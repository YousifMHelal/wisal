import { prisma } from "@/lib/prisma"
import { status, type KpiStatus } from "@/lib/kpi"
import type { Filters } from "@/lib/filters"
import { resolveDateBounds } from "@/lib/filters"

// ── Hero Stats ─────────────────────────────────────────────────────────────────

export interface OverviewHeroStats {
  serviceLevel: { value: number; status: KpiStatus }
  abandonedCalls: { value: number; status: KpiStatus }
  fcr: { value: number; status: KpiStatus }
  activeIncidents: { total: number; critical: number; warning: number; status: KpiStatus }
  totalCallVolume: number
  aiResolutionPct: number
}

export async function getOverviewHeroStats(filters: Filters): Promise<OverviewHeroStats> {
  const { from, to } = resolveDateBounds(filters)

  const [snaps, incidents, resolutionSplits] = await Promise.all([
    prisma.slaSnapshot.findMany({
      where: {
        timestamp: { gte: from, lte: to },
        ...(filters.cluster ? { clusterId: filters.cluster } : {}),
      },
      select: { serviceLevelPct: true, abandonedPct: true, fcr: true, callVolume: true },
    }),
    prisma.incident.findMany({
      where: {
        acknowledgedAt: null,
        triggeredAt: { gte: from, lte: to },
        ...(filters.cluster ? { clusterId: filters.cluster } : {}),
      },
      select: { severity: true },
    }),
    prisma.resolutionSplit.findMany({
      where: filters.cluster ? { clusterId: filters.cluster } : undefined,
      select: { aiFullPct: true, aiPartialPct: true, humanPct: true, volume: true },
    }),
  ])

  function avg(vals: number[]) {
    if (!vals.length) return 0
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  const slVal = avg(snaps.map((s) => s.serviceLevelPct))
  const abVal = avg(snaps.map((s) => s.abandonedPct))
  const fcrVal = avg(snaps.map((s) => s.fcr * 100))
  const totalVolume = snaps.reduce((s, r) => s + r.callVolume, 0)

  const critical = incidents.filter((i) => i.severity === "CRITICAL").length
  const warning = incidents.filter((i) => i.severity === "WARNING").length

  // Weighted AI resolution % across resolution splits
  const totalSplitVolume = resolutionSplits.reduce((s, r) => s + r.volume, 0)
  const aiResPct = totalSplitVolume > 0
    ? resolutionSplits.reduce((s, r) => s + ((r.aiFullPct + r.aiPartialPct) / 100) * r.volume, 0) / totalSplitVolume * 100
    : 0

  return {
    serviceLevel: { value: slVal, status: status("SERVICE_LEVEL", slVal) },
    abandonedCalls: { value: abVal, status: status("ABANDONED_CALLS", abVal) },
    fcr: { value: fcrVal, status: status("FCR", fcrVal) },
    activeIncidents: {
      total: incidents.length,
      critical,
      warning,
      status: critical > 0 ? "red" : warning > 0 ? "amber" : "green",
    },
    totalCallVolume: totalVolume,
    aiResolutionPct: aiResPct,
  }
}

// ── SLA 7-day Trend ────────────────────────────────────────────────────────────

export interface SlaTrendPoint {
  date: string   // YYYY-MM-DD
  serviceLevel: number
  callVolume: number
}

export async function getOverviewSlaTrend(filters: Filters): Promise<SlaTrendPoint[]> {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 7)

  const snaps = await prisma.slaSnapshot.findMany({
    where: {
      timestamp: { gte: from, lte: to },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    select: { timestamp: true, serviceLevelPct: true, callVolume: true },
    orderBy: { timestamp: "asc" },
  })

  // Aggregate by date
  const byDate = new Map<string, { sum: number; vol: number; count: number }>()
  for (const snap of snaps) {
    const key = snap.timestamp.toISOString().slice(0, 10)
    const existing = byDate.get(key)
    if (existing) {
      existing.sum += snap.serviceLevelPct
      existing.vol += snap.callVolume
      existing.count += 1
    } else {
      byDate.set(key, { sum: snap.serviceLevelPct, vol: snap.callVolume, count: 1 })
    }
  }

  return Array.from(byDate.entries()).map(([date, { sum, vol, count }]) => ({
    date,
    serviceLevel: sum / count,
    callVolume: vol,
  }))
}

// ── AI Resolution Mini ─────────────────────────────────────────────────────────

export interface AiResolutionMini {
  aiFullPct: number
  aiPartialPct: number
  humanPct: number
  aiTotalPct: number
}

export async function getOverviewAiResolution(filters: Filters): Promise<AiResolutionMini> {
  const splits = await prisma.resolutionSplit.findMany({
    where: filters.cluster ? { clusterId: filters.cluster } : undefined,
    select: { aiFullPct: true, aiPartialPct: true, humanPct: true, volume: true },
  })

  if (!splits.length) return { aiFullPct: 0, aiPartialPct: 0, humanPct: 0, aiTotalPct: 0 }

  const totalVol = splits.reduce((s, r) => s + r.volume, 0)

  function wavg(key: "aiFullPct" | "aiPartialPct" | "humanPct") {
    return totalVol > 0
      ? splits.reduce((s, r) => s + (r[key] / 100) * r.volume, 0) / totalVol * 100
      : splits.reduce((s, r) => s + r[key], 0) / splits.length
  }

  const aiFullPct = wavg("aiFullPct")
  const aiPartialPct = wavg("aiPartialPct")
  const humanPct = wavg("humanPct")

  return { aiFullPct, aiPartialPct, humanPct, aiTotalPct: aiFullPct + aiPartialPct }
}

// ── Cluster Health Snapshot ────────────────────────────────────────────────────

export interface ClusterHealthRow {
  clusterId: string
  clusterName: string
  clusterNameAr: string
  compositeScore: number
  rank: number
  status: KpiStatus
}

export async function getOverviewClusterHealth(filters: Filters): Promise<{
  top5: ClusterHealthRow[]
  bottom5: ClusterHealthRow[]
  total: number
}> {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 7)

  const rows = await prisma.clusterRanking.findMany({
    where: {
      period: { gte: from, lte: to },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    include: { cluster: { select: { name: true, nameAr: true } } },
    orderBy: [{ period: "desc" }, { compositeScore: "desc" }],
    take: 200,
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

  const sorted = deduped.sort((a, b) => b.compositeScore - a.compositeScore)

  const toRow = (r: typeof sorted[0], rank: number): ClusterHealthRow => {
    const score = r.compositeScore
    const st: KpiStatus = score >= 0.8 ? "green" : score >= 0.6 ? "amber" : "red"
    return {
      clusterId: r.clusterId,
      clusterName: r.cluster.name,
      clusterNameAr: r.cluster.nameAr,
      compositeScore: score,
      rank,
      status: st,
    }
  }

  const ranked = sorted.map((r, i) => toRow(r, i + 1))

  return {
    top5: ranked.slice(0, 5),
    bottom5: ranked.length > 5 ? ranked.slice(-5).reverse() : [],
    total: ranked.length,
  }
}

// ── Channel Volume ─────────────────────────────────────────────────────────────

export interface ChannelVolumeRow {
  channelType: string
  volume: number
  avgWaitSec: number
  status: KpiStatus
}

export async function getOverviewChannelVolume(filters: Filters): Promise<ChannelVolumeRow[]> {
  const { from, to } = resolveDateBounds(filters)

  const channels = await prisma.channel.findMany({
    include: {
      channelPulses: {
        where: {
          timestamp: { gte: from, lte: to },
          ...(filters.cluster ? { clusterId: filters.cluster } : {}),
        },
        select: { volume: true, avgWaitSec: true },
      },
    },
  })

  return channels
    .map((ch) => {
      const total = ch.channelPulses.reduce((s, p) => s + p.volume, 0)
      const avgWait =
        ch.channelPulses.length > 0
          ? ch.channelPulses.reduce((s, p) => s + p.avgWaitSec, 0) / ch.channelPulses.length
          : 0
      return {
        channelType: ch.type,
        volume: total,
        avgWaitSec: avgWait,
        status: status("ASA", avgWait),
      }
    })
    .filter((ch) => ch.volume > 0)
    .sort((a, b) => b.volume - a.volume)
}
