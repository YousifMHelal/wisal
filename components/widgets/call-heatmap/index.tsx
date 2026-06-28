import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetEmpty } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { getCallRecordings } from "@/lib/queries/call-heatmap"
import { CallHeatmapClient } from "./call-heatmap-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"

interface Props {
  filters: Filters
}

async function CallHeatmapBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const recordings = await getCallRecordings(filters)

  if (recordings.length === 0) {
    return (
      <Widget
        title="Call Emotion Heatmap"
        titleAr="خريطة المشاعر الحرارية للمكالمات"
      >
        <CallHeatmapClient recordings={[]} locale={locale} />
      </Widget>
    )
  }

  return (
    <Widget
      title="Call Emotion Heatmap"
      titleAr="خريطة المشاعر الحرارية للمكالمات"
      footer={isAr
        ? "تحليل المشاعر لكل جزء من المكالمة · الأحمر = غضب أو ضائقة · الأخضر = هادئ"
        : "Per-segment emotion analysis · Red = anger or distress · Green = calm"}
    >
      <CallHeatmapClient recordings={recordings} locale={locale} />
    </Widget>
  )
}

function CallHeatmapSkeleton() {
  return (
    <Widget title="Call Emotion Heatmap">
      <div className="space-y-4">
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16 rounded" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </Widget>
  )
}

export function CallHeatmapWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Call Emotion Heatmap">
      <Suspense fallback={<CallHeatmapSkeleton />}>
        <CallHeatmapBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
