import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton, WidgetEmpty } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getSlaAdminRegionsData } from "@/lib/queries/live-operations"
import { SlaHeatmapClient } from "./sla-heatmap-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"

interface Props {
  filters: Filters
}

async function HeatmapBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const data = await getSlaAdminRegionsData(filters)

  if (!data.length) {
    return (
      <Widget title="National SLA Heatmap" titleAr="خريطة مستوى الخدمة الوطنية">
        <WidgetEmpty
          message="No regional data available."
          messageAr="لا توجد بيانات للمناطق."
        />
      </Widget>
    )
  }

  return (
    <Widget
      title="National SLA Heatmap"
      titleAr="خريطة مستوى الخدمة الوطنية"
      footer={
        <span>
          {isAr
            ? `${data.length} منطقة إدارية · محدّث ${new Date().toLocaleTimeString("ar-SA")}`
            : `${data.length} regions · updated ${new Date().toLocaleTimeString("en-US")}`}
        </span>
      }
    >
      <SlaHeatmapClient data={data} selectedCluster={filters.cluster} locale={locale} />
    </Widget>
  )
}

export function SlaHeatmapWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="National SLA Heatmap">
      <Suspense fallback={<WidgetSkeleton className="min-h-105" />}>
        <HeatmapBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
