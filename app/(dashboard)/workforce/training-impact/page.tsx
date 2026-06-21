import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { TrainingImpactWidget } from "@/components/widgets/training-impact"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Training Impact — Wisal Command Center" }
export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TrainingImpactPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters = parseFilters(params)
  const moduleFilter = typeof params.module === "string" ? params.module : undefined
  return (
    <>
      <PageHeader
        titleEn="Training Impact"
        titleAr="أثر التدريب"
        subtitleEn="Before vs after QA score comparison across training modules and agents"
        subtitleAr="مقارنة درجات الجودة قبل وبعد التدريب عبر الوحدات التدريبية والوكلاء"
        crumbs={[
          { labelEn: "Workforce & Quality", labelAr: "القوى العاملة والجودة" },
          { labelEn: "Training Impact", labelAr: "أثر التدريب" },
        ]}
      />
      <TrainingImpactWidget filters={filters} moduleFilter={moduleFilter} />
    </>
  )
}
