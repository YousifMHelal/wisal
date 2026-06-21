"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// ── Shift Swap: Approve / Reject ──────────────────────────────────────────────

const SwapActionSchema = z.object({
  swapId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT"]),
})

export async function resolveShiftSwap(formData: FormData) {
  const session = await requireRole("SUPERVISOR")

  const parsed = SwapActionSchema.safeParse({
    swapId: formData.get("swapId"),
    action: formData.get("action"),
  })
  if (!parsed.success) return { error: "Invalid input." }

  const { swapId, action } = parsed.data
  const swap = await prisma.shiftSwapRequest.findUnique({ where: { id: swapId } })
  if (!swap) return { error: "Shift swap not found." }
  if (swap.status !== "PENDING") return { error: "Already resolved." }

  await prisma.$transaction([
    prisma.shiftSwapRequest.update({
      where: { id: swapId },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        approvedBy: session.user.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        actor: session.user.id,
        action: `SHIFT_SWAP_${action}`,
        entity: "ShiftSwapRequest",
        entityId: swapId,
        meta: { fromShift: swap.fromShift, toShift: swap.toShift, agentId: swap.agentId },
      },
    }),
  ])

  revalidatePath("/workforce")
  return { success: true }
}

// ── QA Sample: Mark Reviewed ──────────────────────────────────────────────────

const QaScoreSchema = z.object({
  itemId: z.string().min(1),
  qualityScore: z.coerce.number().int().min(1).max(5),
  notes: z.string().max(1000).optional(),
})

export async function submitQaScore(formData: FormData) {
  const session = await requireRole("SUPERVISOR")

  const parsed = QaScoreSchema.safeParse({
    itemId: formData.get("itemId"),
    qualityScore: formData.get("qualityScore"),
    notes: formData.get("notes") ?? undefined,
  })
  if (!parsed.success) return { error: "Invalid input." }

  const { itemId, qualityScore, notes } = parsed.data
  const item = await prisma.qaSampleItem.findUnique({ where: { id: itemId } })
  if (!item) return { error: "QA item not found." }

  await prisma.$transaction([
    prisma.qaSampleItem.update({
      where: { id: itemId },
      data: { reviewed: true },
    }),
    prisma.auditLog.create({
      data: {
        actor: session.user.id,
        action: "QA_ITEM_SCORED",
        entity: "QaSampleItem",
        entityId: itemId,
        meta: {
          interactionId: item.interactionId,
          qualityScore,
          notes: notes ?? null,
          sentimentScore: item.sentimentScore,
          botConfidence: item.botConfidence,
        },
      },
    }),
  ])

  revalidatePath("/workforce")
  return { success: true }
}

// ── Ticket: Assign Agent ──────────────────────────────────────────────────────

const AssignTicketSchema = z.object({
  ticketId: z.string().min(1),
  agentId: z.string().min(1),
})

export async function assignTicketAgent(formData: FormData) {
  const session = await requireRole("SUPERVISOR")

  const parsed = AssignTicketSchema.safeParse({
    ticketId: formData.get("ticketId"),
    agentId: formData.get("agentId"),
  })
  if (!parsed.success) return { error: "Invalid input." }

  const { ticketId, agentId } = parsed.data
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
  if (!ticket) return { error: "Ticket not found." }

  const agent = await prisma.agent.findUnique({ where: { id: agentId }, select: { name: true } })
  if (!agent) return { error: "Agent not found." }

  await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedAgentId: agentId,
        status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
      },
    }),
    prisma.auditLog.create({
      data: {
        actor: session.user.id,
        action: "TICKET_ASSIGNED",
        entity: "Ticket",
        entityId: ticketId,
        meta: {
          previousAgentId: ticket.assignedAgentId,
          newAgentId: agentId,
          agentName: agent.name,
          ticketType: ticket.type,
          priority: ticket.priority,
        },
      },
    }),
  ])

  revalidatePath("/workforce")
  return { success: true }
}
