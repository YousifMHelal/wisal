import { Suspense } from "react"
import { Widget, WidgetSkeleton } from "@/components/widgets/widget"
import { getTodayVsTargetData } from "@/lib/queries/live-operations"
import { CompositeGauge } from "./gauge"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
}

async function GaugeBody({ filters }: Props) {
  const data = await getTodayVsTargetData(filters)

  return (
    <Widget
      title="Today vs Target"
      titleAr="اليوم مقابل الهدف"
      footer={<span>Click a gauge to highlight · Targets from RFP Appendix 1</span>}
    >
      <CompositeGauge
        serviceLevel={data.serviceLevel}
        abandonedCalls={data.abandonedCalls}
        aht={data.aht}
        fcr={data.fcr}
      />
    </Widget>
  )
}

function GaugeSkeleton() {
  return (
    <Widget title="Today vs Target">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-[120px] rounded-full" />
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
    <Suspense fallback={<GaugeSkeleton />}>
      <GaugeBody filters={filters} />
    </Suspense>
  )
}
