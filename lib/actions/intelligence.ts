"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireRole, checkRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// ── Kill Switch ───────────────────────────────────────────────────────────────

const ToggleKillSwitchSchema = z.object({
  killSwitchId: z.string().min(1),
  targetState: z.enum(["ARMED", "ACTIVE"]),
  scope: z.enum(["ALL", "CHANNEL", "CLUSTER"]).default("ALL"),
  scopeRef: z.string().optional(),
  confirmText: z.string(),
})

export async function toggleKillSwitch(formData: FormData) {
  // PLATFORM_ADMIN only — server enforced
  const session = await requireRole("PLATFORM_ADMIN")

  const parsed = ToggleKillSwitchSchema.safeParse({
    killSwitchId: formData.get("killSwitchId"),
    targetState: formData.get("targetState"),
    scope: formData.get("scope") ?? "ALL",
    scopeRef: formData.get("scopeRef") ?? undefined,
    confirmText: formData.get("confirmText"),
  })

  if (!parsed.success) {
    return { error: "Invalid input." }
  }

  const { killSwitchId, targetState, scope, scopeRef, confirmText } = parsed.data

  // Require typed confirmation for ACTIVE state
  if (targetState === "ACTIVE" && confirmText !== "ACTIVATE KILL SWITCH") {
    return { error: "Confirmation text does not match." }
  }

  const ks = await prisma.killSwitch.findUnique({ where: { id: killSwitchId } })
  if (!ks) return { error: "Kill switch record not found." }

  await prisma.$transaction([
    prisma.killSwitch.update({
      where: { id: killSwitchId },
      data: {
        state: targetState,
        scope,
        scopeRef: scopeRef ?? null,
        lastTriggeredAt: targetState === "ACTIVE" ? new Date() : ks.lastTriggeredAt,
      },
    }),
    prisma.auditLog.create({
      data: {
        actor: session.user.id,
        action: targetState === "ACTIVE" ? "KILL_SWITCH_ACTIVATE" : "KILL_SWITCH_DISARM",
        entity: "KillSwitch",
        entityId: killSwitchId,
        meta: { scope, scopeRef, previousState: ks.state },
      },
    }),
  ])

  revalidatePath("/intelligence")
  return { success: true }
}

// ── Drift Watch — assign alert ────────────────────────────────────────────────

const AssignDriftAlertSchema = z.object({
  driftSnapshotId: z.string().min(1),
  assigneeUserId: z.string().min(1),
})

export async function assignDriftAlert(formData: FormData) {
  const session = await requireRole("SUPERVISOR")

  const parsed = AssignDriftAlertSchema.safeParse({
    driftSnapshotId: formData.get("driftSnapshotId"),
    assigneeUserId: formData.get("assigneeUserId"),
  })

  if (!parsed.success) return { error: "Invalid input." }

  const { driftSnapshotId, assigneeUserId } = parsed.data

  const snap = await prisma.driftSnapshot.findUnique({ where: { id: driftSnapshotId } })
  if (!snap) return { error: "Drift snapshot not found." }

  const assignee = await prisma.user.findUnique({ where: { id: assigneeUserId } })
  if (!assignee) return { error: "Assignee user not found." }

  await prisma.auditLog.create({
    data: {
      actor: session.user.id,
      action: "DRIFT_ALERT_ASSIGNED",
      entity: "DriftSnapshot",
      entityId: driftSnapshotId,
      meta: {
        assignedTo: assigneeUserId,
        assigneeName: assignee.name,
        dialect: snap.dialect,
        clusterId: snap.clusterId,
        nluConfidence: snap.nluConfidence,
      },
    },
  })

  revalidatePath("/intelligence")
  return { success: true }
}

// ── Drift Watch — get assignable users (supervisors+) ────────────────────────

export async function getAssignableUsers() {
  const canAssign = await checkRole("SUPERVISOR")
  if (!canAssign) return []

  const users = await prisma.user.findMany({
    where: { role: { in: ["SUPERVISOR", "COMPLIANCE", "PLATFORM_ADMIN"] } },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  })
  return users
}
