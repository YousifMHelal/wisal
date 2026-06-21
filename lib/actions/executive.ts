"use server"

import { z } from "zod"
import { requireRole } from "@/lib/auth"
import { getSavingsTrackerData, getPenaltyImpactData } from "@/lib/queries/executive"
import { parseFilters } from "@/lib/filters"

const ExportSchema = z.object({
  cluster: z.string().optional(),
  range: z.enum(["live", "today", "7d", "30d", "custom"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

// ── Export Savings Report (board-ready CSV) ───────────────────────────────────

export async function exportSavingsReport(formData: FormData) {
  await requireRole("EXECUTIVE")

  const parsed = ExportSchema.safeParse({
    cluster: formData.get("cluster") ?? undefined,
    range: formData.get("range") ?? undefined,
    from: formData.get("from") ?? undefined,
    to: formData.get("to") ?? undefined,
  })
  if (!parsed.success) return { error: "Invalid input." }

  const filters = parseFilters({
    cluster: parsed.data.cluster,
    range: parsed.data.range,
    from: parsed.data.from,
    to: parsed.data.to,
  })

  const rows = await getSavingsTrackerData(filters)

  const header = "Date,Agent Hours Saved,AI Resolved Volume,Avg Handle Time Saved (s),Estimated Hours Saved\n"
  const body = rows
    .map(
      (r) =>
        `${r.date.toISOString().slice(0, 10)},${r.agentHoursSaved.toFixed(1)},${r.aiResolvedVolume},${r.avgHandleTimeSaved.toFixed(0)},${r.estimatedHoursSaved.toFixed(1)}`
    )
    .join("\n")

  return { csv: header + body }
}

// ── Export Penalty Report ─────────────────────────────────────────────────────

export async function exportPenaltyReport(formData: FormData) {
  await requireRole("EXECUTIVE")

  const parsed = ExportSchema.safeParse({
    cluster: formData.get("cluster") ?? undefined,
    range: formData.get("range") ?? undefined,
    from: formData.get("from") ?? undefined,
    to: formData.get("to") ?? undefined,
  })
  if (!parsed.success) return { error: "Invalid input." }

  const filters = parseFilters({
    cluster: parsed.data.cluster,
    range: parsed.data.range,
    from: parsed.data.from,
    to: parsed.data.to,
  })

  const rows = await getPenaltyImpactData(filters)

  const header = "Cluster,Period,KPI,Failure %,Permissible Tolerance %,Breached,Estimated Penalty (SAR),Basis\n"
  const body = rows
    .map(
      (r) =>
        `"${r.clusterName}",${r.period.toISOString().slice(0, 10)},${r.kpi},${r.failurePct.toFixed(2)},${r.permissibleTolerance.toFixed(2)},${r.breached ? "YES" : "NO"},${r.penaltyAmount.toFixed(2)},"${r.basis}"`
    )
    .join("\n")

  return { csv: header + body }
}
