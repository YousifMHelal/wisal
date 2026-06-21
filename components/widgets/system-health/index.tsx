import { Suspense } from "react"
import { Widget, WidgetSkeleton, WidgetEmpty } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { getSystemHealthData } from "@/lib/queries/operations"
import { SystemHealthClient } from "./system-health-client"

async function SystemHealthBody() {
  const data = await getSystemHealthData()

  if (!data) {
    return (
      <Widget title="System Health & DR" titleAr="صحة النظام والتعافي من الكوارث">
        <WidgetEmpty message="No system health data available." />
      </Widget>
    )
  }

  return (
    <Widget
      title="System Health & DR"
      titleAr="صحة النظام والتعافي من الكوارث"
      footer={`Availability target: 99.9999% · BCP/DR RTO/RPO per channel · KSA data residency`}
    >
      <SystemHealthClient data={data} />
    </Widget>
  )
}

function SystemHealthSkeleton() {
  return (
    <Widget title="System Health & DR">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-28 w-full rounded-lg sm:col-span-2" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-13 w-full rounded-lg" />
            <Skeleton className="h-13 w-full rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </Widget>
  )
}

export function SystemHealthWidget() {
  return (
    <WidgetErrorBoundary widgetTitle="System Health & DR">
      <Suspense fallback={<SystemHealthSkeleton />}>
        <SystemHealthBody />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
