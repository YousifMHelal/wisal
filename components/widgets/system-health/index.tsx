import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton, WidgetEmpty } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { getSystemHealthData } from "@/lib/queries/operations"
import { SystemHealthClient } from "./system-health-client"
import { resolveLocale } from "@/lib/i18n"

async function SystemHealthBody() {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const data = await getSystemHealthData()

  if (!data) {
    return (
      <Widget title="System Health & DR" titleAr="صحة النظام والتعافي من الكوارث">
        <WidgetEmpty
          message="No system health data available."
          messageAr="لا توجد بيانات لصحة النظام."
        />
      </Widget>
    )
  }

  return (
    <Widget
      title="System Health & DR"
      titleAr="صحة النظام والتعافي من الكوارث"
      footer={isAr
        ? "هدف التوفر: 99.9999% · BCP/DR RTO/RPO لكل قناة · إقامة البيانات في المملكة"
        : "Availability target: 99.9999% · BCP/DR RTO/RPO per channel · KSA data residency"}
    >
      <SystemHealthClient data={data} locale={locale} />
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
