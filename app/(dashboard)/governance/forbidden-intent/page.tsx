import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { ForbiddenIntentWidget } from "@/components/widgets/forbidden-intent"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Forbidden Intent — Wisal Command Center" }
export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ForbiddenIntentPage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <PageHeader
        titleEn="Forbidden Intent Triggers"
        titleAr="محفزات النوايا المحظورة"
        subtitleEn="Detected guardrail violations, Wisal responses, and trigger frequency trends"
        subtitleAr="انتهاكات الضوابط المكتشفة واستجابات وصال واتجاهات تكرار المحفزات"
        crumbs={[
          { labelEn: "Governance", labelAr: "الحوكمة والامتثال" },
          { labelEn: "Forbidden Intent", labelAr: "النوايا المحظورة" },
        ]}
      />
      <ForbiddenIntentWidget filters={filters} />
    </>
  )
}
