import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { KnowledgeBaseWidget } from "@/components/widgets/knowledge-base"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Knowledge Base — Wisal Command Center" }
export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function KnowledgeBasePage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <PageHeader
        titleEn="Knowledge Base"
        titleAr="قاعدة المعرفة"
        subtitleEn="Versioned bilingual articles — draft, publish, and manage role-based access"
        subtitleAr="مقالات ثنائية اللغة ذات إصدارات — صياغة ونشر وإدارة الوصول المبني على الأدوار"
        crumbs={[
          { labelEn: "Governance", labelAr: "الحوكمة والامتثال" },
          { labelEn: "Knowledge Base", labelAr: "قاعدة المعرفة" },
        ]}
      />
      <KnowledgeBaseWidget filters={filters} />
    </>
  )
}
