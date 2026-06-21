import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { SlaHeatmapWidget } from "@/components/widgets/sla-heatmap"
import { TodayVsTargetWidget } from "@/components/widgets/today-vs-target"
import { LiveRefresh } from "@/components/widgets/live-refresh"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "SLA & Targets — Wisal Command Center" }
export const revalidate = 30

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SlaHeatmapPage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <LiveRefresh pollMs={30_000} />
      <PageHeader
        titleEn="SLA & Targets"
        titleAr="مستوى الخدمة والأهداف"
        subtitleEn="National SLA heatmap and today's performance vs committed targets"
        subtitleAr="خريطة مستوى الخدمة الوطنية وأداء اليوم مقابل الأهداف المحددة"
        crumbs={[
          { labelEn: "Live Operations", labelAr: "العمليات الحية" },
          { labelEn: "SLA & Targets", labelAr: "مستوى الخدمة والأهداف" },
        ]}
      />
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <TodayVsTargetWidget filters={filters} />
          <SlaHeatmapWidget filters={filters} />
        </div>
      </div>
    </>
  )
}
