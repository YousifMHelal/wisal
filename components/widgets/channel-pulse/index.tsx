import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton, WidgetEmpty } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getChannelPulseData } from "@/lib/queries/live-operations"
import { ChannelPulseClient } from "./channel-pulse-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
}

async function PulseBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const data = await getChannelPulseData(filters)

  if (!data.length) {
    return (
      <Widget title="Channel Pulse" titleAr="نبض القنوات">
        <WidgetEmpty
          message="No channel data available."
          messageAr="لا توجد بيانات للقنوات."
        />
      </Widget>
    )
  }

  return (
    <Widget
      title="Channel Pulse"
      titleAr="نبض القنوات"
      footer={
        <span>
          {isAr ? "انقر على قناة لتصفية الحوادث أدناه" : "Click a channel to filter incidents below"}
        </span>
      }
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
          <Skeleton key={i} className="h-28 w-37 md:w-auto shrink-0 rounded-lg" />
        ))}
      </div>
    </Widget>
  )
}

export function ChannelPulseWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Channel Pulse">
      <Suspense fallback={<PulseSkeleton />}>
        <PulseBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
