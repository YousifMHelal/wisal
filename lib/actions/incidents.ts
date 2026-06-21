"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const AcknowledgeSchema = z.object({
  incidentId: z.string().min(1),
})

export async function acknowledgeIncident(formData: FormData) {
  const session = await requireAuth()

  const parsed = AcknowledgeSchema.safeParse({
    incidentId: formData.get("incidentId"),
  })

  if (!parsed.success) {
    return { error: "Invalid incident ID." }
  }

  const { incidentId } = parsed.data

  const incident = await prisma.incident.findUnique({ where: { id: incidentId } })
  if (!incident) return { error: "Incident not found." }
  if (incident.acknowledgedAt) return { error: "Already acknowledged." }

  await prisma.$transaction([
    prisma.incident.update({
      where: { id: incidentId },
      data: { acknowledgedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        actor: session.user.id,
        action: "ACKNOWLEDGE_INCIDENT",
        entity: "Incident",
        entityId: incidentId,
        meta: { severity: incident.severity, type: incident.type },
      },
    }),
  ])

  revalidatePath("/live-operations")
  return { success: true }
}
