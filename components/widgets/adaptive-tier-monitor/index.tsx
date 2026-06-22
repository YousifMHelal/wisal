import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getTierMonitorData } from "@/lib/queries/intelligence"
import { AdaptiveTierMonitorClient } from "./adaptive-tier-monitor-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"
import { BrainCircuit } from "lucide-react"

interface Props {
  filters: Filters
}

async function TierMonitorBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const data = await getTierMonitorData(filters)

  return (
    <Widget
      title="Adaptive Tier Monitor"
      titleAr="مراقبة المستويات التكيفية"
      actions={
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BrainCircuit className="size-3.5" aria-hidden />
          <span>{data.trend.length} {isAr ? "لقطة" : "snapshots"}</span>
        </div>
      }
      footer={
        data.latest
          ? `T1: ${data.latest.tier1Pct.toFixed(0)}% · T2: ${data.latest.tier2Pct.toFixed(0)}% · T3: ${data.latest.tier3Pct.toFixed(0)}% · ${isAr ? "انقر على نطاق المستوى للتصفية" : "click tier band to filter"}`
          : undefined
      }
    >
      <AdaptiveTierMonitorClient data={data} locale={locale} />
    </Widget>
  )
}

function TierMonitorSkeleton() {
  return (
    <Widget title="Adaptive Tier Monitor">
      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </Widget>
  )
}

export function AdaptiveTierMonitorWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Adaptive Tier Monitor">
      <Suspense fallback={<TierMonitorSkeleton />}>
        <TierMonitorBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
