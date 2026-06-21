import { Suspense } from "react"
import { Widget, WidgetSkeleton } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getDriftWatchData } from "@/lib/queries/intelligence"
import { getAssignableUsers } from "@/lib/actions/intelligence"
import { DriftWatchClient } from "./drift-watch-client"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
}

async function DriftWatchBody({ filters }: Props) {
  const [data, rawUsers] = await Promise.all([
    getDriftWatchData(filters),
    getAssignableUsers(),
  ])

  const assignableUsers = rawUsers.map((u) => ({ ...u, name: u.name ?? u.id }))

  return (
    <Widget
      title="Drift Watch"
      titleAr="مراقبة الانجراف"
      actions={
        data.alerts.length > 0 ? (
          <span className="text-xs text-status-amber-fg tabular-nums">
            {data.alerts.length} flagged
          </span>
        ) : undefined
      }
      footer="NLU confidence by cluster/dialect · Click alert to highlight series · Assign to member"
    >
      <DriftWatchClient data={data} assignableUsers={assignableUsers} />
    </Widget>
  )
}

function DriftWatchSkeleton() {
  return (
    <Widget title="Drift Watch">
      <div className="space-y-3">
        <Skeleton className="h-52 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </Widget>
  )
}

export function DriftWatchWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Drift Watch">
      <Suspense fallback={<DriftWatchSkeleton />}>
        <DriftWatchBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
