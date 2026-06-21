import { Suspense } from "react"
import { Widget, WidgetSkeleton, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getForbiddenIntentData } from "@/lib/queries/governance"
import { checkRole } from "@/lib/auth"
import { ForbiddenIntentClient } from "./forbidden-intent-client"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

function buildExportQs(filters: Filters): string {
  const p = new URLSearchParams()
  if (filters.cluster) p.set("cluster", filters.cluster)
  if (filters.from) p.set("from", filters.from.toISOString())
  if (filters.to) p.set("to", filters.to.toISOString())
  const qs = p.toString()
  return qs ? `?${qs}` : ""
}

interface Props {
  filters: Filters
}

async function ForbiddenIntentBody({ filters }: Props) {
  const allowed = await checkRole("COMPLIANCE")
  if (!allowed) {
    return (
      <Widget title="Forbidden-Intent Triggers" titleAr="محفزات النية المحظورة">
        <WidgetLocked requiredRole="COMPLIANCE" />
      </Widget>
    )
  }

  const data = await getForbiddenIntentData(filters)
  const exportUrl = `/api/export/forbidden-intent${buildExportQs(filters)}`

  return (
    <Widget
      title="Forbidden-Intent Triggers"
      titleAr="محفزات النية المحظورة"
      actions={
        <span className={`text-xs tabular-nums font-medium ${data.events.length > 0 ? "text-status-amber-fg" : "text-muted-foreground"}`}>
          {data.events.length} event{data.events.length !== 1 ? "s" : ""}
        </span>
      }
      footer="Click a chart data point to filter the log to that date · COMPLIANCE role required"
    >
      <ForbiddenIntentClient data={data} exportUrl={exportUrl} />
    </Widget>
  )
}

function ForbiddenIntentSkeleton() {
  return (
    <Widget title="Forbidden-Intent Triggers">
      <div className="space-y-3">
        <Skeleton className="h-40 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </Widget>
  )
}

export function ForbiddenIntentWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Forbidden-Intent Triggers">
      <Suspense fallback={<ForbiddenIntentSkeleton />}>
        <ForbiddenIntentBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
