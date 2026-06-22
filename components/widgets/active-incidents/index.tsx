import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getActiveIncidents } from "@/lib/queries/live-operations"
import { ActiveIncidentsClient } from "./active-incidents-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface Props {
  filters: Filters
}

async function IncidentsBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const data = await getActiveIncidents(filters)

  const criticalCount = data.filter((i) => i.severity === "CRITICAL").length
  const warningCount = data.filter((i) => i.severity === "WARNING").length

  return (
    <Widget
      title="Active Incidents"
      titleAr="الحوادث النشطة"
      actions={
        data.length > 0 ? (
          <span className="text-xs text-muted-foreground tabular">
            {criticalCount > 0 && (
              <span className="text-status-red-fg me-2">
                {criticalCount} {isAr ? "حرج" : "critical"}
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-status-amber-fg">
                {warningCount} {isAr ? "تحذير" : "warning"}
              </span>
            )}
          </span>
        ) : undefined
      }
      footer={data.length > 0 ? (
        <span>
          {isAr
            ? `${data.length} غير مُقرّ · انقر لعرض التوجه`
            : `${data.length} unacknowledged · click to view trend`}
        </span>
      ) : undefined}
    >
      <ActiveIncidentsClient data={data} locale={locale} />
    </Widget>
  )
}

function IncidentsSkeleton() {
  return (
    <Widget title="Active Incidents">
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </Widget>
  )
}

export function ActiveIncidentsWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Active Incidents">
      <Suspense fallback={<IncidentsSkeleton />}>
        <IncidentsBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
