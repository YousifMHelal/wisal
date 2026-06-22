import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getKpiScorecardData } from "@/lib/queries/executive"
import { KpiScorecardClient } from "./kpi-scorecard-client"
import { resolveLocale } from "@/lib/i18n"

async function KpiScorecardBody() {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

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
      footer={isAr
        ? "هذا الأسبوع مقابل الهدف مقابل الأسبوع الماضي · انقر على البطاقة للوحدة المسؤولة"
        : "This week vs. target vs. last week · click a card to navigate to the owning module"}
    >
      <KpiScorecardClient rows={rows} locale={locale} />
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
    <WidgetErrorBoundary widgetTitle="National KPI Scorecard">
      <Suspense fallback={<KpiScorecardSkeleton />}>
        <KpiScorecardBody />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
