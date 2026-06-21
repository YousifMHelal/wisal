import { Suspense } from "react"
import { Widget, WidgetSkeleton, WidgetEmpty } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getChannelPulseData } from "@/lib/queries/live-operations"
import { ChannelPulseClient } from "./channel-pulse-client"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
  locale?: string
}

async function PulseBody({ filters, locale = "en" }: Props) {
  const data = await getChannelPulseData(filters)

  if (!data.length) {
    return (
      <Widget title="Channel Pulse" titleAr="نبض القنوات">
        <WidgetEmpty message="لا توجد بيانات للقنوات." />
      </Widget>
    )
  }

  return (
    <Widget
      title="Channel Pulse"
      titleAr="نبض القنوات"
      footer={<span>انقر على قناة لتصفية الحوادث أدناه</span>}
    >
      <ChannelPulseClient data={data} locale={locale} />
    </Widget>
  )
}

function PulseSkeleton() {
  return (
    <Widget title="Channel Pulse">
      <div className="flex gap-3 overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-[148px] md:w-auto flex-shrink-0 rounded-lg" />
        ))}
      </div>
    </Widget>
  )
}

export function ChannelPulseWidget({ filters, locale }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Channel Pulse">
      <Suspense fallback={<PulseSkeleton />}>
        <PulseBody filters={filters} locale={locale} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
