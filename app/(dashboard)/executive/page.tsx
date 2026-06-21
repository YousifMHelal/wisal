import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { KpiScorecardWidget } from "@/components/widgets/kpi-scorecard"
import { ClusterRankingWidget } from "@/components/widgets/cluster-ranking"
import { SavingsTrackerWidget } from "@/components/widgets/savings-tracker"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "KPIs & Rankings — Wisal Command Center" }
export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ExecutivePage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <PageHeader
        titleEn="KPIs & Rankings"
        titleAr="المؤشرات والتصنيفات"
        subtitleEn="National KPI scorecard, cluster leaderboard, and savings realization tracker"
        subtitleAr="بطاقة المؤشرات الوطنية ولوحة تصنيف المجموعات ومتتبع تحقيق المدخرات"
        crumbs={[
          { labelEn: "Executive Rollup", labelAr: "ملخص تنفيذي" },
          { labelEn: "KPIs & Rankings", labelAr: "المؤشرات والتصنيفات" },
        ]}
      />
      <div className="space-y-4 md:space-y-6">
        <KpiScorecardWidget />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <ClusterRankingWidget filters={filters} />
          <SavingsTrackerWidget filters={filters} />
        </div>
      </div>
    </>
  )
}
