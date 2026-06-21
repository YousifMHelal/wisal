import { prisma } from "@/lib/prisma"

// ── Integration & NMR Status ──────────────────────────────────────────────────

export interface IntegrationRow {
  id: string
  system: string
  state: string
  lastSyncAt: Date | null
  latencyMs: number | null
  pattern: string
  updatedAt: Date
}

export async function getIntegrationStatusData(): Promise<IntegrationRow[]> {
  const rows = await prisma.integrationStatus.findMany({
    orderBy: { system: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    system: r.system,
    state: r.state,
    lastSyncAt: r.lastSyncAt,
    latencyMs: r.latencyMs,
    pattern: r.pattern,
    updatedAt: r.updatedAt,
  }))
}

// ── System Health ─────────────────────────────────────────────────────────────

export interface DrChannel {
  channel: string
  rto: string
  rpo: string
}

export interface SystemHealthData {
  id: string
  availabilityPct: number
  drChannels: DrChannel[]
  lastDrTestAt: Date | null
  region: string
  updatedAt: Date
}

export async function getSystemHealthData(): Promise<SystemHealthData | null> {
  const row = await prisma.systemHealth.findFirst({
    orderBy: { updatedAt: "desc" },
  })
  if (!row) return null

  let drChannels: DrChannel[] = []
  if (row.dr && typeof row.dr === "object" && !Array.isArray(row.dr)) {
    drChannels = Object.entries(row.dr as Record<string, unknown>).map(([ch, v]) => {
      const val = v as Record<string, string>
      return { channel: ch, rto: val.rto ?? "—", rpo: val.rpo ?? "—" }
    })
  }

  return {
    id: row.id,
    availabilityPct: row.availabilityPct,
    drChannels,
    lastDrTestAt: row.lastDrTestAt,
    region: row.region,
    updatedAt: row.updatedAt,
  }
}

// ── Beneficiary 360 ───────────────────────────────────────────────────────────

export interface BeneficiaryProfile {
  id: string
  name: string
  nameAr: string
  nationalId: string
  dateOfBirth: Date
  gender: string
  clusterId: string
  clusterName: string
  phone: string | null
  consentStatus: string
  tier: string
}

export interface InteractionRow {
  id: string
  channelId: string
  channelName: string
  agentName: string | null
  startedAt: Date
  durationSec: number
  intent: string
  sentiment: number
  resolution: string
}

export interface TicketRow360 {
  id: string
  type: string
  status: string
  priority: string
  description: string
  slaDueAt: Date
  escalationPath: string | null
  assignedAgentName: string | null
  createdAt: Date
}

export interface Beneficiary360 {
  profile: BeneficiaryProfile
  interactions: InteractionRow[]
  tickets: TicketRow360[]
}

export async function getBeneficiary360(id: string): Promise<Beneficiary360 | null> {
  const [b, interactions, tickets] = await Promise.all([
    prisma.beneficiary.findFirst({
      where: { id },
      include: { cluster: { select: { name: true } } },
    }),
    prisma.interaction.findMany({
      where: { beneficiaryId: id },
      include: {
        channel: { select: { type: true } },
        agent: { select: { name: true } },
      },
      orderBy: { startedAt: "desc" },
      take: 50,
    }),
    prisma.ticket.findMany({
      where: { beneficiaryId: id },
      include: { assignedAgent: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ])

  if (!b) return null

  return {
    profile: {
      id: b.id,
      name: b.name,
      nameAr: b.nameAr,
      nationalId: b.nationalId,
      dateOfBirth: b.dateOfBirth,
      gender: b.gender,
      clusterId: b.clusterId,
      clusterName: b.cluster.name,
      phone: b.phone,
      consentStatus: b.consentStatus,
      tier: b.tier,
    },
    interactions: interactions.map((i) => ({
      id: i.id,
      channelId: i.channelId,
      channelName: i.channel.type as string,
      agentName: i.agent?.name ?? null,
      startedAt: i.startedAt,
      durationSec: i.durationSec,
      intent: i.intent,
      sentiment: i.sentiment,
      resolution: i.resolution,
    })),
    tickets: tickets.map((t) => ({
      id: t.id,
      type: t.type as string,
      status: t.status as string,
      priority: t.priority as string,
      description: t.description,
      slaDueAt: t.slaDueAt,
      escalationPath: t.escalationPath,
      assignedAgentName: t.assignedAgent?.name ?? null,
      createdAt: t.createdAt,
    })),
  }
}

export interface BeneficiarySearchResult {
  id: string
  name: string
  nameAr: string
  nationalId: string
  clusterName: string
  tier: string
  consentStatus: string
}

export async function searchBeneficiaries(query: string): Promise<BeneficiarySearchResult[]> {
  const q = query.trim()
  if (!q || q.length < 2) return []

  const rows = await prisma.beneficiary.findMany({
    where: {
      OR: [
        { nationalId: { contains: q } },
        { name: { contains: q, mode: "insensitive" } },
        { nameAr: { contains: q } },
      ],
    },
    include: { cluster: { select: { name: true } } },
    take: 20,
    orderBy: { name: "asc" },
  })

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    nameAr: r.nameAr,
    nationalId: r.nationalId,
    clusterName: r.cluster.name,
    tier: r.tier,
    consentStatus: r.consentStatus,
  }))
}
