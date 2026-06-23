import { prisma } from "@/lib/prisma"
import { status, type KpiStatus } from "@/lib/kpi"
import type { Filters } from "@/lib/filters"
import { resolveDateBounds } from "@/lib/filters"

// ── SLA Heatmap ──────────────────────────────────────────────────────────────

export interface SlaRegion {
  clusterId: string
  clusterName: string
  clusterNameAr: string
  svgRegionId: string
  serviceLevelPct: number
  callVolume: number
  abandonedPct: number
  aht: number
  fcr: number
  status: KpiStatus
}

// Maps Cluster.region string → GeoJSON shapeISO (SA-XX)
const REGION_TO_ISO: Record<string, string> = {
  "Riyadh":     "SA-01",
  "Makkah":     "SA-02",
  "Medina":     "SA-03",
  "Eastern":    "SA-04",
  "Qassim":     "SA-05",
  "Hail":       "SA-06",
  "Tabuk":      "SA-07",
  "N. Borders": "SA-08",
  "Jizan":      "SA-09",
  "Najran":     "SA-10",
  "Al Baha":    "SA-11",
  "Al Jouf":    "SA-12",
  "Asir":       "SA-14",
}

const REGION_NAME_AR: Record<string, string> = {
  "Riyadh":     "منطقة الرياض",
  "Makkah":     "منطقة مكة المكرمة",
  "Medina":     "منطقة المدينة المنورة",
  "Eastern":    "المنطقة الشرقية",
  "Qassim":     "منطقة القصيم",
  "Hail":       "منطقة حائل",
  "Tabuk":      "منطقة تبوك",
  "N. Borders": "منطقة الحدود الشمالية",
  "Jizan":      "منطقة جازان",
  "Najran":     "منطقة نجران",
  "Al Baha":    "منطقة الباحة",
  "Al Jouf":    "منطقة الجوف",
  "Asir":       "منطقة عسير",
}

export interface SlaAdminRegion {
  /** GeoJSON shapeISO — matches properties.shapeISO in ksa-regions.json */
  regionIso: string
  /** Display name for tooltip (best cluster in region, or region name) */
  regionName: string
  regionNameAr: string
  /** Weighted-average service level across all clusters in this admin region */
  serviceLevelPct: number
  /** Total call volume across all clusters in this admin region */
  callVolume: number
  /** Worst status among all clusters in region */
  status: KpiStatus
  /** Individual clusters within this region (for tooltip detail) */
  clusters: { name: string; nameAr: string; serviceLevelPct: number; callVolume: number; status: KpiStatus }[]
}

export async function getSlaAdminRegionsData(filters: Filters): Promise<SlaAdminRegion[]> {
  const { from, to } = resolveDateBounds(filters)

  const clusters = await prisma.cluster.findMany({
    include: {
      slaSnapshots: {
        where: { timestamp: { gte: from, lte: to } },
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
  })

  // Group clusters by admin region ISO
  const byIso = new Map<string, typeof clusters>()
  for (const c of clusters) {
    const iso = REGION_TO_ISO[c.region]
    if (!iso) continue
    if (!byIso.has(iso)) byIso.set(iso, [])
    byIso.get(iso)!.push(c)
  }

  const results: SlaAdminRegion[] = []
  for (const [iso, regionClusters] of byIso) {
    const clusterData = regionClusters.map((c) => {
      const snap = c.slaSnapshots[0]
      const slPct = snap?.serviceLevelPct ?? 0
      return {
        name: c.name,
        nameAr: c.nameAr,
        serviceLevelPct: slPct,
        callVolume: snap?.callVolume ?? 0,
        status: status("SERVICE_LEVEL", slPct),
      }
    })

    const totalVolume = clusterData.reduce((s, c) => s + c.callVolume, 0)
    // Weighted avg SL by call volume; fall back to simple avg if all volumes zero
    const weightedSl = totalVolume > 0
      ? clusterData.reduce((s, c) => s + c.serviceLevelPct * c.callVolume, 0) / totalVolume
      : clusterData.reduce((s, c) => s + c.serviceLevelPct, 0) / clusterData.length

    // Worst status: red > amber > green
    const worstStatus: KpiStatus = clusterData.some((c) => c.status === "red")
      ? "red"
      : clusterData.some((c) => c.status === "amber")
        ? "amber"
        : "green"

    const regionName = regionClusters[0].region
    const regionNameAr = REGION_NAME_AR[regionName] ?? regionClusters[0].nameAr

    results.push({
      regionIso: iso,
      regionName,
      regionNameAr,
      serviceLevelPct: weightedSl,
      callVolume: totalVolume,
      status: worstStatus,
      clusters: clusterData,
    })
  }

  // If a cluster filter is active, surface only admin regions that contain that cluster
  if (filters.cluster) {
    const targetCluster = clusters.find((c) => c.id === filters.cluster)
    if (targetCluster) {
      const targetIso = REGION_TO_ISO[targetCluster.region]
      return results.filter((r) => r.regionIso === targetIso)
    }
  }

  return results
}

export async function getSlaHeatmapData(filters: Filters): Promise<SlaRegion[]> {
  const { from, to } = resolveDateBounds(filters)

  const clusters = await prisma.cluster.findMany({
    where: filters.cluster ? { id: filters.cluster } : undefined,
    include: {
      slaSnapshots: {
        where: { timestamp: { gte: from, lte: to } },
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
  })

  return clusters.map((c) => {
    const snap = c.slaSnapshots[0]
    const slPct = snap?.serviceLevelPct ?? 0
    return {
      clusterId: c.id,
      clusterName: c.name,
      clusterNameAr: c.nameAr,
      svgRegionId: c.svgRegionId,
      serviceLevelPct: slPct,
      callVolume: snap?.callVolume ?? 0,
      abandonedPct: snap?.abandonedPct ?? 0,
      aht: snap?.aht ?? 0,
      fcr: snap?.fcr ?? 0,
      status: status("SERVICE_LEVEL", slPct),
    }
  })
}

// ── Channel Pulse ─────────────────────────────────────────────────────────────

export interface ChannelPulseRow {
  channelId: string
  channelType: string
  volume: number
  avgWaitSec: number
  status: KpiStatus
}

export async function getChannelPulseData(filters: Filters): Promise<ChannelPulseRow[]> {
  const { from, to } = resolveDateBounds(filters)

  const channels = await prisma.channel.findMany({
    include: {
      channelPulses: {
        where: {
          timestamp: { gte: from, lte: to },
          ...(filters.cluster ? { clusterId: filters.cluster } : {}),
        },
      },
    },
  })

  return channels.map((ch) => {
    const pulses = ch.channelPulses
    if (!pulses.length) {
      return { channelId: ch.id, channelType: ch.type, volume: 0, avgWaitSec: 0, status: status("ASA", 0) }
    }

    const totalVolume = pulses.reduce((s, p) => s + p.volume, 0)
    const avgWait = pulses.reduce((s, p) => s + p.avgWaitSec, 0) / pulses.length

    return {
      channelId: ch.id,
      channelType: ch.type,
      volume: totalVolume,
      avgWaitSec: avgWait,
      status: status("ASA", avgWait),
    }
  })
}

// ── Active Incidents ──────────────────────────────────────────────────────────

export interface IncidentRow {
  id: string
  severity: "CRITICAL" | "WARNING"
  type: string
  description: string
  clusterName: string | null
  clusterNameAr: string | null
  channelType: string | null
  triggeredAt: Date
  acknowledgedAt: Date | null
  metricTrend: { label: string; value: number }[]
}

export async function getActiveIncidents(filters: Filters): Promise<IncidentRow[]> {
  const { from, to } = resolveDateBounds(filters)

  const incidents = await prisma.incident.findMany({
    where: {
      acknowledgedAt: null,
      triggeredAt: { gte: from, lte: to },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    orderBy: [{ severity: "asc" }, { triggeredAt: "desc" }],
    include: {
      cluster: { select: { name: true, nameAr: true } },
      channel: { select: { type: true } },
    },
    take: 50,
  })

  return incidents.map((inc) => ({
    id: inc.id,
    severity: inc.severity,
    type: inc.type,
    description: inc.description,
    clusterName: inc.cluster?.name ?? null,
    clusterNameAr: inc.cluster?.nameAr ?? null,
    channelType: inc.channel?.type ?? null,
    triggeredAt: inc.triggeredAt,
    acknowledgedAt: inc.acknowledgedAt,
    metricTrend: (inc.metricTrend as { label: string; value: number }[]) ?? [],
  }))
}

// ── Today vs Target ───────────────────────────────────────────────────────────

export interface TodayVsTargetData {
  serviceLevel: { value: number; status: KpiStatus }
  abandonedCalls: { value: number; status: KpiStatus }
  aht: { value: number; status: KpiStatus }
  fcr: { value: number; status: KpiStatus }
}

export async function getTodayVsTargetData(filters: Filters): Promise<TodayVsTargetData> {
  const { from, to } = resolveDateBounds(filters)

  const snaps = await prisma.slaSnapshot.findMany({
    where: {
      timestamp: { gte: from, lte: to },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    select: { serviceLevelPct: true, abandonedPct: true, aht: true, fcr: true },
  })

  function avg(vals: number[]) {
    if (!vals.length) return 0
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  const slVal = avg(snaps.map((s) => s.serviceLevelPct))
  const abVal = avg(snaps.map((s) => s.abandonedPct))
  const ahtVal = avg(snaps.map((s) => s.aht))
  const fcrVal = avg(snaps.map((s) => s.fcr * 100))

  return {
    serviceLevel: { value: slVal, status: status("SERVICE_LEVEL", slVal) },
    abandonedCalls: { value: abVal, status: status("ABANDONED_CALLS", abVal) },
    aht: { value: ahtVal, status: status("AHT", ahtVal) },
    fcr: { value: fcrVal, status: status("FCR", fcrVal) },
  }
}

// ── Live Agent Status Board ───────────────────────────────────────────────────

export interface AgentStatusCluster {
  clusterId: string
  clusterName: string
  clusterNameAr: string
  available: number
  onCall: number
  wrap: number
  afterCall: number
  onBreak: number
  offline: number
  total: number
  overallStatus: KpiStatus
}

export async function getAgentStatusBoard(filters: Filters): Promise<AgentStatusCluster[]> {
  const clusters = await prisma.cluster.findMany({
    where: filters.cluster ? { id: filters.cluster } : undefined,
    include: {
      agentStatuses: {
        select: { state: true },
      },
    },
    orderBy: { name: "asc" },
  })

  return clusters.map((c) => {
    const statuses = c.agentStatuses
    const available = statuses.filter((s) => s.state === "AVAILABLE").length
    const onCall = statuses.filter((s) => s.state === "ON_CALL").length
    const wrap = statuses.filter((s) => s.state === "WRAP").length
    const afterCall = statuses.filter((s) => s.state === "AFTER_CALL").length
    const onBreak = statuses.filter((s) => s.state === "BREAK").length
    const offline = statuses.filter((s) => s.state === "OFFLINE").length
    const total = statuses.length

    // Derive status: green if ≥70% available/on-call, amber if 40-70%, red below
    const activeRatio = total > 0 ? (available + onCall) / total : 0
    const overallStatus: KpiStatus =
      activeRatio >= 0.7 ? "green" : activeRatio >= 0.4 ? "amber" : "red"

    return {
      clusterId: c.id,
      clusterName: c.name,
      clusterNameAr: c.nameAr,
      available,
      onCall,
      wrap,
      afterCall,
      onBreak,
      offline,
      total,
      overallStatus,
    }
  })
}
