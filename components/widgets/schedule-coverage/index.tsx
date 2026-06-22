import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getScheduleCoverageData } from "@/lib/queries/workforce"
import { ScheduleCoverageClient } from "./schedule-coverage-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"

interface Props {
  filters: Filters
}

async function ScheduleCoverageBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const allowed = await checkRole("SUPERVISOR")
  if (!allowed) {
    return (
      <Widget title="Schedule & Coverage" titleAr="الجدول والتغطية">
        <WidgetLocked requiredRole="SUPERVISOR" />
      </Widget>
    )
  }

  const data = await getScheduleCoverageData(filters)

  return (
    <Widget
      title="Schedule & Coverage"
      titleAr="الجدول والتغطية"
      actions={
        <span className="text-xs text-muted-foreground tabular-nums">
          {isAr
            ? `${data.swaps.length} طلب تبادل معلّق`
            : `${data.swaps.length} pending swap request${data.swaps.length !== 1 ? "s" : ""}`}
        </span>
      }
      footer={isAr
        ? "الموظفون مقابل الطلب المتوقع بالساعة · يتطلب دور المشرف لموافقة التبادلات"
        : "Staffed vs. forecast demand by hour · Supervisor role required to approve swaps"}
    >
      <ScheduleCoverageClient slots={data.slots} swaps={data.swaps} locale={locale} />
    </Widget>
  )
}

function ScheduleCoverageSkeleton() {
  return (
    <Widget title="Schedule & Coverage">
      <div className="space-y-3">
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </Widget>
  )
}

export function ScheduleCoverageWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Schedule & Coverage">
      <Suspense fallback={<ScheduleCoverageSkeleton />}>
        <ScheduleCoverageBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
