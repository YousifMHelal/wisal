import { Suspense } from "react"
import { Widget, WidgetSkeleton, WidgetEmpty } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getSlaAdminRegionsData } from "@/lib/queries/live-operations"
import { SlaHeatmapClient } from "./sla-heatmap-client"
import type { Filters } from "@/lib/filters"

interface Props {
  filters: Filters
}

async function HeatmapBody({ filters }: Props) {
  const data = await getSlaAdminRegionsData(filters)

  if (!data.length) {
    return (
      <Widget title="National SLA Heatmap" titleAr="خريطة مستوى الخدمة الوطنية">
        <WidgetEmpty message="لا توجد بيانات للمناطق." />
      </Widget>
    )
  }

  return (
    <Widget
      title="National SLA Heatmap"
      titleAr="خريطة مستوى الخدمة الوطنية"
      footer={
        <span>
          {data.length} منطقة إدارية · محدّث {new Date().toLocaleTimeString()}
        </span>
      }
    >
      <SlaHeatmapClient data={data} selectedCluster={filters.cluster} />
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
