import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getTodayVsTargetData } from "@/lib/queries/live-operations"
import { CompositeGauge } from "./gauge"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
}

async function GaugeBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const data = await getTodayVsTargetData(filters)

  return (
    <Widget
      title="Today vs Target"
      titleAr="اليوم مقابل الهدف"
      footer={
        <span>
          {isAr
            ? "انقر على المقياس لإبرازه · الأهداف من ملحق RFP 1"
            : "Click a gauge to highlight · targets from RFP Annex 1"}
        </span>
      }
    >
      <CompositeGauge
        serviceLevel={data.serviceLevel}
        abandonedCalls={data.abandonedCalls}
        aht={data.aht}
        fcr={data.fcr}
        locale={locale}
      />
    </Widget>
  )
}

function GaugeSkeleton() {
  return (
    <Widget title="Today vs Target">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-30 rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </Widget>
  )
}

export function TodayVsTargetWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Today vs Target">
      <Suspense fallback={<GaugeSkeleton />}>
        <GaugeBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
