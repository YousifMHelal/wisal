import { Suspense } from "react"
import { Widget, WidgetSkeleton, WidgetLocked } from "@/components/widgets/widget"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getKpiScorecardData } from "@/lib/queries/executive"
import { KpiScorecardClient } from "./kpi-scorecard-client"

async function KpiScorecardBody() {
  const allowed = await checkRole("EXECUTIVE")
  if (!allowed) {
    return (
      <Widget title="National KPI Scorecard" titleAr="مؤشرات الأداء الوطنية">
        <WidgetLocked requiredRole="EXECUTIVE" />
      </Widget>
    )
  }

  const rows = await getKpiScorecardData()

  return (
    <Widget
      title="National KPI Scorecard"
      titleAr="مؤشرات الأداء الوطنية"
      footer="This week vs target vs last week · click card → owning module"
    >
      <KpiScorecardClient rows={rows} />
    </Widget>
  )
}

function KpiScorecardSkeleton() {
  return (
    <Widget title="National KPI Scorecard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </Widget>
  )
}

export function KpiScorecardWidget() {
  return (
    <Suspense fallback={<KpiScorecardSkeleton />}>
      <KpiScorecardBody />
    </Suspense>
  )
}
