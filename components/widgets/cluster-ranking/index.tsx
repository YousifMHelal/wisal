import { Suspense } from "react"
import { Widget, WidgetSkeleton, WidgetLocked, WidgetEmpty } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getClusterRankingData } from "@/lib/queries/executive"
import { ClusterRankingClient } from "./cluster-ranking-client"
import type { Filters } from "@/lib/filters"

interface Props { filters: Filters }

async function ClusterRankingBody({ filters }: Props) {
  const allowed = await checkRole("EXECUTIVE")
  if (!allowed) {
    return (
      <Widget title="Cluster Ranking" titleAr="تصنيف المجموعات">
        <WidgetLocked requiredRole="EXECUTIVE" />
      </Widget>
    )
  }

  const rows = await getClusterRankingData(filters)

  return (
    <Widget
      title="Cluster Ranking"
      titleAr="تصنيف المجموعات"
      footer="Composite score · sortable by any KPI · click cluster → filter dashboard"
    >
      {rows.length === 0 ? (
        <div className="flex items-center justify-center min-h-30">
          <p className="text-sm text-muted-foreground">No ranking data for this period.</p>
        </div>
      ) : (
        <ClusterRankingClient rows={rows} />
      )}
    </Widget>
  )
}

function ClusterRankingSkeleton() {
  return (
    <Widget title="Cluster Ranking">
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-md" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </Widget>
  )
}

export function ClusterRankingWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Cluster Ranking">
      <Suspense fallback={<ClusterRankingSkeleton />}>
        <ClusterRankingBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
