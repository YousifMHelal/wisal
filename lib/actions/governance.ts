"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// ── Knowledge Base: publish / unpublish ───────────────────────────────────────

const PublishArticleSchema = z.object({
  articleId: z.string().min(1),
  action: z.enum(["PUBLISH", "UNPUBLISH", "DRAFT"]),
  publishAt: z.string().datetime().optional(),
})

export async function setArticleStatus(formData: FormData) {
  const session = await requireRole("COMPLIANCE")

  const parsed = PublishArticleSchema.safeParse({
    articleId: formData.get("articleId"),
    action: formData.get("action"),
    publishAt: formData.get("publishAt") ?? undefined,
  })

  if (!parsed.success) return { error: "Invalid input." }

  const { articleId, action, publishAt } = parsed.data

  const article = await prisma.knowledgeArticle.findUnique({ where: { id: articleId } })
  if (!article) return { error: "Article not found." }

  const newStatus =
    action === "PUBLISH" ? "PUBLISHED" : action === "UNPUBLISH" ? "UNPUBLISHED" : "DRAFT"

  await prisma.$transaction([
    prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        status: newStatus,
        publishedBy: action === "PUBLISH" ? session.user.id : article.publishedBy,
        publishAt: action === "PUBLISH" && publishAt ? new Date(publishAt) : article.publishAt,
        version: action === "PUBLISH" ? article.version + 1 : article.version,
      },
    }),
    prisma.auditLog.create({
      data: {
        actor: session.user.id,
        action: `KB_ARTICLE_${action}`,
        entity: "KnowledgeArticle",
        entityId: articleId,
        meta: { previousStatus: article.status, newStatus, titleEn: article.titleEn },
      },
    }),
  ])

  revalidatePath("/governance")
  return { success: true }
}

// ── CSV export helpers (called from API route) ────────────────────────────────

const ExportSchema = z.object({
  kind: z.enum(["medical-approvals", "consent-audit", "forbidden-intent", "compliance-pack"]),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cluster: z.string().optional(),
})

export async function buildExportCsv(params: unknown): Promise<{ csv: string; filename: string }> {
  const parsed = ExportSchema.safeParse(params)
  if (!parsed.success) throw new Error("Invalid export params")

  const { kind, from, to, cluster } = parsed.data
  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to) : new Date()

  switch (kind) {
    case "medical-approvals": {
      const rows = await prisma.medicalContentApproval.findMany({
        where: {
          timestamp: { gte: fromDate, lte: toDate },
          ...(cluster ? { clusterId: cluster } : {}),
        },
        include: { cluster: { select: { name: true } } },
        orderBy: { timestamp: "desc" },
      })
      const header = "caseId,cluster,status,approvedBy,timestamp,content"
      const lines = rows.map(
        (r) =>
          `"${r.caseId}","${r.cluster?.name ?? ""}","${r.status}","${r.approvedBy ?? ""}","${r.timestamp.toISOString()}","${r.content.replace(/"/g, '""')}"`
      )
      return { csv: [header, ...lines].join("\n"), filename: "medical-approvals.csv" }
    }

    case "consent-audit": {
      const rows = await prisma.consentDisclosure.findMany({
        where: { timestamp: { gte: fromDate, lte: toDate } },
        include: { caregiverCase: { select: { caseId: true } } },
        orderBy: { timestamp: "desc" },
      })
      const header = "caseId,caregiverCaseRef,consentOnFile,timestamp"
      const lines = rows.map(
        (r) =>
          `"${r.caseId}","${r.caregiverCase.caseId}","${r.consentOnFile}","${r.timestamp.toISOString()}"`
      )
      return { csv: [header, ...lines].join("\n"), filename: "consent-audit.csv" }
    }

    case "forbidden-intent": {
      const rows = await prisma.forbiddenIntentEvent.findMany({
        where: { timestamp: { gte: fromDate, lte: toDate } },
        orderBy: { timestamp: "desc" },
      })
      const header = "caseId,pattern,wisalResponse,timestamp"
      const lines = rows.map(
        (r) =>
          `"${r.caseId}","${r.pattern.replace(/"/g, '""')}","${r.wisalResponse.replace(/"/g, '""')}","${r.timestamp.toISOString()}"`
      )
      return { csv: [header, ...lines].join("\n"), filename: "forbidden-intent.csv" }
    }

    case "compliance-pack": {
      const scores = await prisma.complianceScore.findMany({ orderBy: { framework: "asc" } })
      const header = "framework,status,score,refreshedAt,evidenceRefs"
      const lines = scores.map(
        (s) =>
          `"${s.framework}","${s.status}","${s.score}","${s.refreshedAt.toISOString()}","${JSON.stringify(s.evidenceRefs).replace(/"/g, '""')}"`
      )
      return { csv: [header, ...lines].join("\n"), filename: "compliance-pack.csv" }
    }
  }
}
