import { prisma } from "@/lib/prisma"
import { status, type KpiStatus } from "@/lib/kpi"

export type ModuleId =
  | "live-operations"
  | "intelligence"
  | "governance"
  | "workforce"
  | "executive"
  | "operations"

function worst(...statuses: KpiStatus[]): KpiStatus {
  if (statuses.includes("red")) return "red"
  if (statuses.includes("amber")) return "amber"
  return "green"
}

/** Server-computed worst status per module for sidebar dots. Cached per request. */
export async function getModuleStatuses(): Promise<Record<ModuleId, KpiStatus>> {
  const [latestSla, latestIncident, latestKill, latestHealth] = await Promise.all([
    prisma.slaSnapshot.findMany({
      orderBy: { timestamp: "desc" },
      take: 20,
      select: { serviceLevelPct: true, abandonedPct: true },
    }),
    prisma.incident.findFirst({
      where: { acknowledgedAt: null },
      orderBy: { triggeredAt: "desc" },
      select: { severity: true },
    }),
    prisma.killSwitch.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { state: true },
    }),
    prisma.systemHealth.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { availabilityPct: true },
    }),
  ])

  // Module 01 — Live Operations: SLA + active incidents
  const slaStatuses = latestSla.map((s) =>
    worst(
      status("SERVICE_LEVEL", s.serviceLevelPct),
      status("ABANDONED_CALLS", s.abandonedPct)
    )
  )
  const liveOpsStatus = worst(
    worst(...(slaStatuses.length ? slaStatuses : ["green" as KpiStatus])),
    latestIncident?.severity === "CRITICAL" ? "red" : latestIncident ? "amber" : "green"
  )

  // Module 02 — Intelligence: kill switch state
  const intelligenceStatus: KpiStatus =
    latestKill?.state === "ACTIVE" ? "red" : latestKill?.state === "ARMED" ? "amber" : "green"

  // Module 03 — Governance: compliance scores
  const complianceScores = await prisma.complianceScore.findMany({
    select: { status: true },
  })
  const govStatus: KpiStatus =
    complianceScores.some((c) => c.status === "NON_COMPLIANT")
      ? "red"
      : complianceScores.some((c) => c.status === "PARTIAL")
      ? "amber"
      : "green"

  // Module 04 — Workforce: pending shift swaps
  const pendingSwaps = await prisma.shiftSwapRequest.count({
    where: { status: "PENDING" },
  })
  const workforceStatus: KpiStatus = pendingSwaps > 10 ? "amber" : "green"

  // Module 05 — Executive: KPI scorecard
  const kpiRows = await prisma.kpiScorecard.findMany({
    select: { metric: true, thisWeek: true, target: true },
  })
  const execStatuses = kpiRows.map((k) =>
    k.thisWeek >= k.target ? "green" as KpiStatus :
    k.thisWeek >= k.target * 0.95 ? "amber" as KpiStatus :
    "red" as KpiStatus
  )
  const execStatus: KpiStatus = worst(...(execStatuses.length ? execStatuses : ["green" as KpiStatus]))

  // Module 06 — Operations: system health + integrations
  const availStatus: KpiStatus = latestHealth
    ? status("AVAILABILITY", latestHealth.availabilityPct)
    : "green"
  const degradedInteg = await prisma.integrationStatus.count({
    where: { state: { in: ["DEGRADED", "DOWN"] } },
  })
  const opsStatus: KpiStatus = worst(
    availStatus,
    degradedInteg > 0 ? "amber" : "green"
  )

  return {
    "live-operations": liveOpsStatus,
    intelligence: intelligenceStatus,
    governance: govStatus,
    workforce: workforceStatus,
    executive: execStatus,
    operations: opsStatus,
  }
}
