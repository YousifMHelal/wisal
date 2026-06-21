import { prisma } from "@/lib/prisma"
import type { Filters } from "@/lib/filters"
import { resolveDateBounds } from "@/lib/filters"

// ── KPI Scorecard ─────────────────────────────────────────────────────────────

export interface KpiScorecardRow {
  id: string
  metric: string
  thisWeek: number
  target: number
  lastWeek: number
  ownerModule: string
}

export async function getKpiScorecardData(): Promise<KpiScorecardRow[]> {
  const rows = await prisma.kpiScorecard.findMany({
    orderBy: { metric: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    metric: r.metric,
    thisWeek: r.thisWeek,
    target: r.target,
    lastWeek: r.lastWeek,
    ownerModule: r.ownerModule,
  }))
}

// ── Cluster Ranking ───────────────────────────────────────────────────────────

export interface ClusterRankingRow {
  id: string
  clusterId: string
  clusterName: string
  clusterNameAr: string
  compositeScore: number
  perKpi: Record<string, number>
  period: Date
}

export async function getClusterRankingData(filters: Filters): Promise<ClusterRankingRow[]> {
  const { from, to } = resolveDateBounds(filters)

  // Get latest ranking per cluster within the date window
  const rows = await prisma.clusterRanking.findMany({
    where: {
      period: { gte: from, lte: to },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    include: { cluster: { select: { name: true, nameAr: true } } },
    orderBy: [{ period: "desc" }, { compositeScore: "desc" }],
    take: 100,
  })

  // Deduplicate: keep latest per cluster
  const seen = new Set<string>()
  const deduped: typeof rows = []
  for (const row of rows) {
    if (!seen.has(row.clusterId)) {
      seen.add(row.clusterId)
      deduped.push(row)
    }
  }

  return deduped
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .map((r) => ({
      id: r.id,
      clusterId: r.clusterId,
      clusterName: r.cluster.name,
      clusterNameAr: r.cluster.nameAr,
      compositeScore: r.compositeScore,
      perKpi: r.perKpi as Record<string, number>,
      period: r.period,
    }))
}

// ── Savings Tracker ───────────────────────────────────────────────────────────

export interface SavingsPoint {
  date: Date
  agentHoursSaved: number
  aiResolvedVolume: number
  avgHandleTimeSaved: number
  // Derived: estimated cost saving (volume × AHT saved in hours)
  estimatedHoursSaved: number
}

export async function getSavingsTrackerData(filters: Filters): Promise<SavingsPoint[]> {
  const { from, to } = resolveDateBounds(filters)

  const rows = await prisma.savingsPoint.findMany({
    where: {
      date: { gte: from, lte: to },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    orderBy: { date: "asc" },
  })

  // Aggregate by date (sum across clusters when no cluster filter)
  const byDate = new Map<string, SavingsPoint>()
  for (const r of rows) {
    const key = r.date.toISOString().slice(0, 10)
    const existing = byDate.get(key)
    const estimatedHoursSaved = (r.aiResolvedVolume * r.avgHandleTimeSaved) / 3600
    if (existing) {
      existing.agentHoursSaved += r.agentHoursSaved
      existing.aiResolvedVolume += r.aiResolvedVolume
      existing.avgHandleTimeSaved = (existing.avgHandleTimeSaved + r.avgHandleTimeSaved) / 2
      existing.estimatedHoursSaved += estimatedHoursSaved
    } else {
      byDate.set(key, {
        date: r.date,
        agentHoursSaved: r.agentHoursSaved,
        aiResolvedVolume: r.aiResolvedVolume,
        avgHandleTimeSaved: r.avgHandleTimeSaved,
        estimatedHoursSaved,
      })
    }
  }

  return Array.from(byDate.values())
}

// ── Beneficiary Voice ─────────────────────────────────────────────────────────

export interface VoiceTheme {
  id: string
  theme: string
  themeAr: string
  plainSummary: string
  plainSummaryAr: string
  sentiment: number
  weekTrend: number[]   // normalised to plain number[] regardless of seed shape
  examples: string[]
}

type WeekTrendEntry = number | { score?: number; day?: number } | null | undefined

function normaliseTrend(raw: unknown): number[] {
  if (!Array.isArray(raw)) return []
  return (raw as WeekTrendEntry[]).map((v) => {
    if (v == null) return 0
    if (typeof v === "number") return v
    if (typeof v === "object" && "score" in v && typeof v.score === "number") return v.score
    return 0
  })
}

export async function getBeneficiaryVoiceData(): Promise<VoiceTheme[]> {
  const rows = await prisma.beneficiaryVoiceTheme.findMany({
    orderBy: { sentiment: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    theme: r.theme,
    themeAr: r.themeAr,
    plainSummary: r.plainSummary,
    plainSummaryAr: r.plainSummaryAr,
    sentiment: r.sentiment,
    weekTrend: normaliseTrend(r.weekTrend),
    examples: (r.examples as unknown[]).filter((e): e is string => typeof e === "string"),
  }))
}

// ── Campaign Results ──────────────────────────────────────────────────────────

export interface CampaignRow {
  id: string
  name: string
  nameAr: string
  type: string
  status: string
  clusterId: string | null
  clusterName: string | null
  sent: number
  delivered: number
  responded: number
  deliveryRate: number
  responseRate: number
  outcomeMetrics: Record<string, unknown>
  startedAt: Date | null
  completedAt: Date | null
}

export async function getCampaignResultsData(filters: Filters): Promise<CampaignRow[]> {
  const rows = await prisma.campaign.findMany({
    where: filters.cluster ? { clusterId: filters.cluster } : undefined,
    include: { cluster: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    nameAr: r.nameAr,
    type: r.type,
    status: r.status,
    clusterId: r.clusterId,
    clusterName: r.cluster?.name ?? null,
    sent: r.sent,
    delivered: r.delivered,
    responded: r.responded,
    deliveryRate: r.sent > 0 ? (r.delivered / r.sent) * 100 : 0,
    responseRate: r.delivered > 0 ? (r.responded / r.delivered) * 100 : 0,
    outcomeMetrics: r.outcomeMetrics as Record<string, unknown>,
    startedAt: r.startedAt,
    completedAt: r.completedAt,
  }))
}

// ── Penalty Impact ────────────────────────────────────────────────────────────

export interface PenaltyRow {
  id: string
  clusterId: string
  clusterName: string
  clusterNameAr: string
  period: Date
  kpi: string
  failurePct: number
  permissibleTolerance: number
  breached: boolean
  penaltyAmount: number
  basis: string
}

export async function getPenaltyImpactData(filters: Filters): Promise<PenaltyRow[]> {
  const { from, to } = resolveDateBounds(filters)

  const rows = await prisma.penaltyRecord.findMany({
    where: {
      period: { gte: from, lte: to },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    include: { cluster: { select: { name: true, nameAr: true } } },
    orderBy: [{ breached: "desc" }, { penaltyAmount: "desc" }],
    take: 300,
  })

  return rows.map((r) => ({
    id: r.id,
    clusterId: r.clusterId,
    clusterName: r.cluster.name,
    clusterNameAr: r.cluster.nameAr,
    period: r.period,
    kpi: r.kpi,
    failurePct: r.failurePct,
    permissibleTolerance: r.permissibleTolerance,
    breached: r.breached,
    penaltyAmount: r.penaltyAmount,
    basis: r.basis,
  }))
}
