import { Suspense } from "react"
import { Widget, WidgetSkeleton } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getActiveIncidents } from "@/lib/queries/live-operations"
import { ActiveIncidentsClient } from "./active-incidents-client"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface Props {
  filters: Filters
}

async function IncidentsBody({ filters }: Props) {
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
              <span className="text-[var(--status-red-fg)] me-2">{criticalCount} critical</span>
            )}
            {warningCount > 0 && (
              <span className="text-[var(--status-amber-fg)]">{warningCount} warning</span>
            )}
          </span>
        ) : undefined
      }
      footer={data.length > 0 ? <span>{data.length} unacknowledged · Click to expand trend</span> : undefined}
    >
      <ActiveIncidentsClient data={data} />
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
