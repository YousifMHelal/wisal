import { prisma } from "@/lib/prisma"
import type { Filters } from "@/lib/filters"
import { resolveDateBounds } from "@/lib/filters"

// ── Medical Content Approval Log ──────────────────────────────────────────────

export interface MedicalApprovalRow {
  id: string
  caseId: string
  clusterName: string | null
  content: string
  status: "APPROVED" | "PENDING" | "REJECTED"
  approvedBy: string | null
  timestamp: Date
}

export async function getMedicalApprovalData(filters: Filters): Promise<MedicalApprovalRow[]> {
  const { from, to } = resolveDateBounds(filters)

  const rows = await prisma.medicalContentApproval.findMany({
    where: {
      timestamp: { gte: from, lte: to },
      ...(filters.cluster ? { clusterId: filters.cluster } : {}),
    },
    include: { cluster: { select: { name: true } } },
    orderBy: { timestamp: "desc" },
    take: 500,
  })

  return rows.map((r) => ({
    id: r.id,
    caseId: r.caseId,
    clusterName: r.cluster?.name ?? null,
    content: r.content,
    status: r.status as "APPROVED" | "PENDING" | "REJECTED",
    approvedBy: r.approvedBy,
    timestamp: r.timestamp,
  }))
}

// ── Consent & Disclosure Audit ────────────────────────────────────────────────

export interface ConsentAuditRow {
  id: string
  caseId: string
  caregiverCaseId: string
  caregiverCaseRef: string
  consentOnFile: boolean
  timestamp: Date
}

export async function getConsentAuditData(filters: Filters): Promise<ConsentAuditRow[]> {
  const { from, to } = resolveDateBounds(filters)

  const rows = await prisma.consentDisclosure.findMany({
    where: {
      timestamp: { gte: from, lte: to },
    },
    include: {
      caregiverCase: { select: { caseId: true, clusterId: true } },
    },
    orderBy: { timestamp: "desc" },
    take: 500,
  })

  const clusterFilter = filters.cluster
  const filtered = clusterFilter
    ? rows.filter((r) => r.caregiverCase.clusterId === clusterFilter)
    : rows

  return filtered.map((r) => ({
    id: r.id,
    caseId: r.caseId,
    caregiverCaseId: r.caregiverCaseId,
    caregiverCaseRef: r.caregiverCase.caseId,
    consentOnFile: r.consentOnFile,
    timestamp: r.timestamp,
  }))
}

// ── Forbidden Intent Triggers ─────────────────────────────────────────────────

export interface ForbiddenIntentEvent {
  id: string
  caseId: string
  pattern: string
  wisalResponse: string
  timestamp: Date
}

export interface ForbiddenIntentTrendPoint {
  date: string
  count: number
}

export interface ForbiddenIntentData {
  trend: ForbiddenIntentTrendPoint[]
  events: ForbiddenIntentEvent[]
}

export async function getForbiddenIntentData(filters: Filters): Promise<ForbiddenIntentData> {
  const { from, to } = resolveDateBounds(filters)

  const events = await prisma.forbiddenIntentEvent.findMany({
    where: { timestamp: { gte: from, lte: to } },
    orderBy: { timestamp: "asc" },
    take: 1000,
  })

  // Aggregate by date
  const dateMap = new Map<string, number>()
  for (const e of events) {
    const d = e.timestamp.toISOString().split("T")[0]
    dateMap.set(d, (dateMap.get(d) ?? 0) + 1)
  }

  const trend: ForbiddenIntentTrendPoint[] = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  return {
    trend,
    events: events
      .slice()
      .reverse()
      .map((e) => ({
        id: e.id,
        caseId: e.caseId,
        pattern: e.pattern,
        wisalResponse: e.wisalResponse,
        timestamp: e.timestamp,
      })),
  }
}

// ── Compliance Scorecard ──────────────────────────────────────────────────────

export interface ComplianceCard {
  id: string
  framework: "NCA" | "PDPL" | "DGA" | "NDMO"
  status: "COMPLIANT" | "PARTIAL" | "NON_COMPLIANT"
  score: number
  refreshedAt: Date
  evidenceRefs: string[]
}

export async function getComplianceScorecardData(): Promise<ComplianceCard[]> {
  const rows = await prisma.complianceScore.findMany({
    orderBy: { framework: "asc" },
  })

  return rows.map((r) => ({
    id: r.id,
    framework: r.framework as "NCA" | "PDPL" | "DGA" | "NDMO",
    status: r.status as "COMPLIANT" | "PARTIAL" | "NON_COMPLIANT",
    score: r.score,
    refreshedAt: r.refreshedAt,
    evidenceRefs: (r.evidenceRefs as string[]) ?? [],
  }))
}

// ── Knowledge Base ────────────────────────────────────────────────────────────

export interface KnowledgeArticleRow {
  id: string
  titleEn: string
  titleAr: string
  bodyEn: string
  bodyAr: string
  version: number
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED"
  publishAt: Date | null
  publishedBy: string | null
  publisherName: string | null
  createdAt: Date
  updatedAt: Date
}

export async function getKnowledgeBaseData(): Promise<KnowledgeArticleRow[]> {
  const rows = await prisma.knowledgeArticle.findMany({
    include: { publisher: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  })

  return rows.map((r) => ({
    id: r.id,
    titleEn: r.titleEn,
    titleAr: r.titleAr,
    bodyEn: r.bodyEn,
    bodyAr: r.bodyAr,
    version: r.version,
    status: r.status as "DRAFT" | "PUBLISHED" | "UNPUBLISHED",
    publishAt: r.publishAt,
    publishedBy: r.publishedBy,
    publisherName: r.publisher?.name ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }))
}
