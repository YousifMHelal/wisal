import { prisma } from "@/lib/prisma"
import type { Filters } from "@/lib/filters"
import { resolveDateBounds } from "@/lib/filters"

// ── Agent Performance Grid ────────────────────────────────────────────────────

export interface AgentRow {
  id: string
  name: string
  nameAr: string
  team: string
  clusterName: string
  clusterNameAr: string
  clusterId: string
  aht: number
  fcr: number
  qaScore: number
  csat: number
  absenteeism: number
  state: string | null
}

export interface AgentTrainingRecord {
  id: string
  module: string
  completedAt: Date
  qaScoreBefore: number
  qaScoreAfter: number
}

export async function getAgentGridData(filters: Filters): Promise<AgentRow[]> {
  const agents = await prisma.agent.findMany({
    where: filters.cluster ? { clusterId: filters.cluster } : undefined,
    include: {
      cluster: { select: { name: true, nameAr: true } },
      agentStatus: { select: { state: true } },
    },
    orderBy: { name: "asc" },
    take: 300,
  })

  return agents.map((a) => ({
    id: a.id,
    name: a.name,
    nameAr: a.nameAr,
    team: a.team,
    clusterName: a.cluster.name,
    clusterNameAr: a.cluster.nameAr,
    clusterId: a.clusterId,
    aht: a.aht,
    fcr: a.fcr * 100,
    qaScore: a.qaScore,
    csat: a.csat,
    absenteeism: a.absenteeism * 100,
    state: a.agentStatus?.state ?? null,
  }))
}

export async function getAgentTrainingHistory(agentId: string): Promise<AgentTrainingRecord[]> {
  const records = await prisma.trainingRecord.findMany({
    where: { agentId },
    orderBy: { completedAt: "desc" },
  })
  return records.map((r) => ({
    id: r.id,
    module: r.module,
    completedAt: r.completedAt,
    qaScoreBefore: r.qaScoreBefore,
    qaScoreAfter: r.qaScoreAfter,
  }))
}

// ── Schedule & Coverage ───────────────────────────────────────────────────────

export interface HourSlot {
  hour: number
  forecastDemand: number
  staffed: number
}

export interface ShiftSwapRow {
  id: string
  agentName: string
  fromShift: Date
  toShift: Date
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: Date
}

export interface ScheduleCoverageData {
  slots: HourSlot[]
  swaps: ShiftSwapRow[]
}

export async function getScheduleCoverageData(filters: Filters): Promise<ScheduleCoverageData> {
  const { from } = resolveDateBounds(filters)
  const dayStart = new Date(from)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  const [coverage, swaps] = await Promise.all([
    prisma.shiftCoverage.findMany({
      where: {
        date: { gte: dayStart, lt: dayEnd },
        ...(filters.cluster ? { clusterId: filters.cluster } : {}),
      },
      orderBy: { hour: "asc" },
    }),
    prisma.shiftSwapRequest.findMany({
      where: {
        status: "PENDING",
        ...(filters.cluster
          ? { agent: { clusterId: filters.cluster } }
          : {}),
      },
      include: { agent: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  // Build full 24-hour grid (fill missing hours with 0)
  const slotMap = new Map<number, HourSlot>()
  for (const c of coverage) {
    slotMap.set(c.hour, { hour: c.hour, forecastDemand: c.forecastDemand, staffed: c.staffed })
  }
  const slots: HourSlot[] = Array.from({ length: 24 }, (_, h) =>
    slotMap.get(h) ?? { hour: h, forecastDemand: 0, staffed: 0 }
  )

  return {
    slots,
    swaps: swaps.map((s) => ({
      id: s.id,
      agentName: s.agent.name,
      fromShift: s.fromShift,
      toShift: s.toShift,
      status: s.status as "PENDING" | "APPROVED" | "REJECTED",
      createdAt: s.createdAt,
    })),
  }
}

// ── QA Sampling Queue ─────────────────────────────────────────────────────────

export interface QaItem {
  id: string
  interactionId: string
  clusterName: string
  clusterNameAr: string
  sentimentScore: number
  botConfidence: number
  priority: number
  createdAt: Date
}

export async function getQaQueueData(filters: Filters): Promise<QaItem[]> {
  const items = await prisma.qaSampleItem.findMany({
    where: {
      reviewed: false,
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    include: { cluster: { select: { name: true, nameAr: true } } },
    orderBy: [{ priority: "desc" }, { sentimentScore: "asc" }],
    take: 100,
  })

  return items.map((i) => ({
    id: i.id,
    interactionId: i.interactionId,
    clusterName: i.cluster.name,
    clusterNameAr: i.cluster.nameAr,
    sentimentScore: i.sentimentScore,
    botConfidence: i.botConfidence * 100,
    priority: i.priority,
    createdAt: i.createdAt,
  }))
}

// ── Training Impact ───────────────────────────────────────────────────────────

export interface TrainingModuleSummary {
  module: string
  completions: number
  avgBefore: number
  avgAfter: number
  avgDelta: number
}

export interface TrainingAgentDetail {
  agentId: string
  agentName: string
  records: {
    module: string
    completedAt: Date
    qaScoreBefore: number
    qaScoreAfter: number
    delta: number
  }[]
}

export async function getTrainingImpactData(
  filters: Filters,
  moduleFilter?: string
): Promise<TrainingModuleSummary[]> {
  const { from, to } = resolveDateBounds(filters)

  const records = await prisma.trainingRecord.findMany({
    where: {
      completedAt: { gte: from, lte: to },
      ...(moduleFilter ? { module: moduleFilter } : {}),
      ...(filters.cluster ? { agent: { clusterId: filters.cluster } } : {}),
    },
  })

  const moduleMap = new Map<
    string,
    { totalBefore: number; totalAfter: number; count: number }
  >()

  for (const r of records) {
    const entry = moduleMap.get(r.module) ?? { totalBefore: 0, totalAfter: 0, count: 0 }
    entry.totalBefore += r.qaScoreBefore
    entry.totalAfter += r.qaScoreAfter
    entry.count += 1
    moduleMap.set(r.module, entry)
  }

  return Array.from(moduleMap.entries())
    .map(([module, { totalBefore, totalAfter, count }]) => ({
      module,
      completions: count,
      avgBefore: totalBefore / count,
      avgAfter: totalAfter / count,
      avgDelta: (totalAfter - totalBefore) / count,
    }))
    .sort((a, b) => b.avgDelta - a.avgDelta)
}

export async function getAgentTrainingDetail(agentId: string): Promise<TrainingAgentDetail | null> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { name: true, trainingRecords: { orderBy: { completedAt: "asc" } } },
  })
  if (!agent) return null

  return {
    agentId,
    agentName: agent.name,
    records: agent.trainingRecords.map((r) => ({
      module: r.module,
      completedAt: r.completedAt,
      qaScoreBefore: r.qaScoreBefore,
      qaScoreAfter: r.qaScoreAfter,
      delta: r.qaScoreAfter - r.qaScoreBefore,
    })),
  }
}

export async function getTrainingModuleList(): Promise<string[]> {
  const rows = await prisma.trainingRecord.findMany({
    distinct: ["module"],
    select: { module: true },
    orderBy: { module: "asc" },
  })
  return rows.map((r) => r.module)
}

// ── Ticket / Case Queue ───────────────────────────────────────────────────────

export interface TicketRow {
  id: string
  beneficiaryName: string
  beneficiaryId: string
  clusterName: string
  clusterNameAr: string
  type: "COMPLAINT" | "REQUEST"
  status: "OPEN" | "IN_PROGRESS" | "ESCALATED" | "RESOLVED" | "CLOSED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  description: string
  slaDueAt: Date
  escalationPath: string | null
  assignedAgentId: string | null
  assignedAgentName: string | null
  createdAt: Date
  slaBreached: boolean
}

export interface AgentOption {
  id: string
  name: string
  clusterId: string
}

export async function getTicketQueueData(filters: Filters): Promise<TicketRow[]> {
  const now = new Date()

  const tickets = await prisma.ticket.findMany({
    where: {
      status: { notIn: ["RESOLVED", "CLOSED"] },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    include: {
      beneficiary: { select: { name: true } },
      cluster: { select: { name: true, nameAr: true } },
      assignedAgent: { select: { name: true } },
    },
    orderBy: [{ priority: "desc" }, { slaDueAt: "asc" }],
    take: 200,
  })

  return tickets.map((t) => ({
    id: t.id,
    beneficiaryName: t.beneficiary.name,
    beneficiaryId: t.beneficiaryId,
    clusterName: t.cluster.name,
    clusterNameAr: t.cluster.nameAr,
    type: t.type as "COMPLAINT" | "REQUEST",
    status: t.status as "OPEN" | "IN_PROGRESS" | "ESCALATED" | "RESOLVED" | "CLOSED",
    priority: t.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    description: t.description,
    slaDueAt: t.slaDueAt,
    escalationPath: t.escalationPath,
    assignedAgentId: t.assignedAgentId,
    assignedAgentName: t.assignedAgent?.name ?? null,
    createdAt: t.createdAt,
    slaBreached: t.slaDueAt < now,
  }))
}

export async function getAssignableAgents(clusterId?: string): Promise<AgentOption[]> {
  const agents = await prisma.agent.findMany({
    where: clusterId ? { clusterId } : undefined,
    select: { id: true, name: true, clusterId: true },
    orderBy: { name: "asc" },
    take: 200,
  })
  return agents
}
