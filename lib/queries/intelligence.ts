import { prisma } from "@/lib/prisma"
import { status, type KpiStatus } from "@/lib/kpi"
import type { Filters } from "@/lib/filters"
import { resolveDateBounds } from "@/lib/filters"

// ── Adaptive Tier Monitor ─────────────────────────────────────────────────────

export interface TierPoint {
  timestamp: string
  tier1Pct: number
  tier2Pct: number
  tier3Pct: number
  tier1AutocorrectRate: number
}

export interface TierMonitorData {
  trend: TierPoint[]
  latest: {
    tier1Pct: number
    tier2Pct: number
    tier3Pct: number
    tier1AutocorrectRate: number
    autocorrectStatus: KpiStatus
  } | null
}

export async function getTierMonitorData(filters: Filters): Promise<TierMonitorData> {
  const { from, to } = resolveDateBounds(filters)

  const snaps = await prisma.tierSnapshot.findMany({
    where: {
      timestamp: { gte: from, lte: to },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    orderBy: { timestamp: "asc" },
    take: 100,
  })

  const trend: TierPoint[] = snaps.map((s) => ({
    timestamp: s.timestamp.toISOString(),
    tier1Pct: Math.round(s.tier1Pct * 100) / 100,
    tier2Pct: Math.round(s.tier2Pct * 100) / 100,
    tier3Pct: Math.round(s.tier3Pct * 100) / 100,
    tier1AutocorrectRate: Math.round(s.tier1AutocorrectRate * 100) / 100,
  }))

  const latest = snaps[snaps.length - 1] ?? null
  return {
    trend,
    latest: latest
      ? {
          tier1Pct: latest.tier1Pct,
          tier2Pct: latest.tier2Pct,
          tier3Pct: latest.tier3Pct,
          tier1AutocorrectRate: latest.tier1AutocorrectRate,
          // Autocorrect status: green ≥ 80%, amber ≥ 60%, red below
          autocorrectStatus: status("AI_COMPLETION_RATE", latest.tier1AutocorrectRate),
        }
      : null,
  }
}

// ── Caregiver Mode Audit ──────────────────────────────────────────────────────

export interface CaregiverCaseRow {
  id: string
  caseId: string
  clusterName: string
  clusterNameEn: string
  proxyConfirmed: string
  action: string
  timestamp: Date
  auditTrail: { step: string; actor: string; at: string; note?: string }[]
}

export async function getCaregiverAuditData(filters: Filters): Promise<CaregiverCaseRow[]> {
  const { from, to } = resolveDateBounds(filters)

  const rows = await prisma.caregiverCase.findMany({
    where: {
      timestamp: { gte: from, lte: to },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    include: { cluster: { select: { name: true, nameAr: true } } },
    orderBy: { timestamp: "desc" },
    take: 200,
  })

  return rows.map((r) => ({
    id: r.id,
    caseId: r.caseId,
    clusterName: r.cluster.nameAr ?? r.cluster.name,
    clusterNameEn: r.cluster.name,
    proxyConfirmed: r.proxyConfirmed,
    action: r.action,
    timestamp: r.timestamp,
    auditTrail: (r.auditTrail as { step: string; actor: string; at: string; note?: string }[]) ?? [],
  }))
}

// ── AI vs Human Split ─────────────────────────────────────────────────────────

export interface ResolutionSplitRow {
  label: string
  aiFullPct: number
  aiPartialPct: number
  humanPct: number
  volume: number
  // Derived totals for donut
  aiTotalPct: number
}

export interface AiHumanSplitData {
  byChannel: ResolutionSplitRow[]
  byCluster: ResolutionSplitRow[]
  overall: { aiTotalPct: number; humanPct: number; aiFullPct: number; aiPartialPct: number }
}

export async function getAiHumanSplitData(filters: Filters): Promise<AiHumanSplitData> {
  const { from, to } = resolveDateBounds(filters)

  const rows = await prisma.resolutionSplit.findMany({
    where: {
      timestamp: { gte: from, lte: to },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    include: {
      channel: { select: { type: true } },
      cluster: { select: { name: true } },
    },
  })

  function aggregateRows(
    groups: Map<string, typeof rows>
  ): ResolutionSplitRow[] {
    return Array.from(groups.entries()).map(([label, group]) => {
      const totalVol = group.reduce((s, r) => s + r.volume, 0)
      const aiFull =
        totalVol > 0
          ? group.reduce((s, r) => s + r.aiFullPct * r.volume, 0) / totalVol
          : 0
      const aiPartial =
        totalVol > 0
          ? group.reduce((s, r) => s + r.aiPartialPct * r.volume, 0) / totalVol
          : 0
      const human =
        totalVol > 0
          ? group.reduce((s, r) => s + r.humanPct * r.volume, 0) / totalVol
          : 0
      return {
        label,
        aiFullPct: Math.round(aiFull * 10) / 10,
        aiPartialPct: Math.round(aiPartial * 10) / 10,
        humanPct: Math.round(human * 10) / 10,
        volume: totalVol,
        aiTotalPct: Math.round((aiFull + aiPartial) * 10) / 10,
      }
    })
  }

  // By channel
  const byChannelMap = new Map<string, typeof rows>()
  for (const r of rows) {
    const key = r.channel?.type ?? "Unknown"
    if (!byChannelMap.has(key)) byChannelMap.set(key, [])
    byChannelMap.get(key)!.push(r)
  }

  // By cluster
  const byClusterMap = new Map<string, typeof rows>()
  for (const r of rows) {
    const key = r.cluster?.name ?? "Unknown"
    if (!byClusterMap.has(key)) byClusterMap.set(key, [])
    byClusterMap.get(key)!.push(r)
  }

  const totalVol = rows.reduce((s, r) => s + r.volume, 0)
  const overall = {
    aiFullPct:
      totalVol > 0 ? rows.reduce((s, r) => s + r.aiFullPct * r.volume, 0) / totalVol : 0,
    aiPartialPct:
      totalVol > 0 ? rows.reduce((s, r) => s + r.aiPartialPct * r.volume, 0) / totalVol : 0,
    humanPct:
      totalVol > 0 ? rows.reduce((s, r) => s + r.humanPct * r.volume, 0) / totalVol : 0,
    aiTotalPct: 0,
  }
  overall.aiTotalPct = overall.aiFullPct + overall.aiPartialPct

  return {
    byChannel: aggregateRows(byChannelMap),
    byCluster: aggregateRows(byClusterMap),
    overall: {
      aiFullPct: Math.round(overall.aiFullPct * 10) / 10,
      aiPartialPct: Math.round(overall.aiPartialPct * 10) / 10,
      humanPct: Math.round(overall.humanPct * 10) / 10,
      aiTotalPct: Math.round(overall.aiTotalPct * 10) / 10,
    },
  }
}

// ── Drift Watch ───────────────────────────────────────────────────────────────

export interface DriftSeriesPoint {
  date: string
  nluConfidence: number
  intentConfidence: number
}

export interface DriftSeries {
  id: string
  label: string
  labelEn: string
  dialect: string
  clusterName: string
  clusterId: string
  points: DriftSeriesPoint[]
  latestNlu: number
  latestIntent: number
  flagged: boolean
}

export interface DriftAlert {
  id: string
  clusterName: string
  clusterNameEn: string
  clusterId: string
  dialect: string
  dialectEn: string
  date: Date
  nluConfidence: number
  message: string | null
}

export interface DriftWatchData {
  series: DriftSeries[]
  alerts: DriftAlert[]
}

export async function getDriftWatchData(filters: Filters): Promise<DriftWatchData> {
  const { from, to } = resolveDateBounds(filters)

  const snaps = await prisma.driftSnapshot.findMany({
    where: {
      date: { gte: from, lte: to },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    include: { cluster: { select: { name: true, nameAr: true } } },
    orderBy: { date: "asc" },
  })

  // Group by clusterId + dialect
  const DIALECT_AR: Record<string, string> = {
    Najdi: "نجدي",
    Hijazi: "حجازي",
    Gulf: "خليجي",
    Southern: "جنوبي",
    Northern: "شمالي",
  }

  const seriesMap = new Map<
    string,
    { clusterId: string; clusterName: string; clusterNameEn: string; dialect: string; dialectAr: string; points: DriftSeriesPoint[]; flagged: boolean }
  >()

  for (const s of snaps) {
    const key = `${s.clusterId}::${s.dialect}`
    if (!seriesMap.has(key)) {
      seriesMap.set(key, {
        clusterId: s.clusterId,
        clusterName: s.cluster.nameAr ?? s.cluster.name,
        clusterNameEn: s.cluster.name,
        dialect: s.dialect,
        dialectAr: DIALECT_AR[s.dialect] ?? s.dialect,
        points: [],
        flagged: false,
      })
    }
    const entry = seriesMap.get(key)!
    entry.points.push({
      date: s.date.toISOString().split("T")[0],
      nluConfidence: s.nluConfidence,
      intentConfidence: s.intentConfidence,
    })
    if (s.flagged) entry.flagged = true
  }

  const series: DriftSeries[] = Array.from(seriesMap.entries()).map(([key, v]) => {
    const last = v.points[v.points.length - 1]
    return {
      id: key,
      label: `${v.clusterName} / ${v.dialectAr}`,
      labelEn: `${v.clusterNameEn} / ${v.dialect}`,
      dialect: v.dialectAr,
      clusterName: v.clusterName,
      clusterId: v.clusterId,
      points: v.points,
      latestNlu: last?.nluConfidence ?? 0,
      latestIntent: last?.intentConfidence ?? 0,
      flagged: v.flagged,
    }
  })

  const alerts: DriftAlert[] = snaps
    .filter((s) => s.flagged)
    .map((s) => ({
      id: s.id,
      clusterName: s.cluster.nameAr ?? s.cluster.name,
      clusterNameEn: s.cluster.name,
      clusterId: s.clusterId,
      dialect: DIALECT_AR[s.dialect] ?? s.dialect,
      dialectEn: s.dialect,
      date: s.date,
      nluConfidence: s.nluConfidence,
      message: s.message,
    }))
    .slice(0, 50)

  return { series, alerts }
}

// ── Kill Switch ───────────────────────────────────────────────────────────────

export interface KillSwitchData {
  id: string
  state: "ARMED" | "ACTIVE"
  scope: "ALL" | "CHANNEL" | "CLUSTER"
  scopeRef: string | null
  lastTriggeredAt: Date | null
  updatedAt: Date
}

export async function getKillSwitchData(): Promise<KillSwitchData | null> {
  const ks = await prisma.killSwitch.findFirst({ orderBy: { updatedAt: "desc" } })
  if (!ks) return null
  return {
    id: ks.id,
    state: ks.state as "ARMED" | "ACTIVE",
    scope: ks.scope as "ALL" | "CHANNEL" | "CLUSTER",
    scopeRef: ks.scopeRef,
    lastTriggeredAt: ks.lastTriggeredAt,
    updatedAt: ks.updatedAt,
  }
}
