import { Suspense } from "react"
import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getPenaltyImpactData } from "@/lib/queries/executive"
import { PenaltyImpactClient } from "./penalty-impact-client"
import type { Filters } from "@/lib/filters"

interface Props { filters: Filters }

async function PenaltyImpactBody({ filters }: Props) {
  const allowed = await checkRole("EXECUTIVE")
  if (!allowed) {
    return (
      <Widget title="SLA Penalty / Financial Impact" titleAr="غرامات مستوى الخدمة / الأثر المالي">
        <WidgetLocked requiredRole="EXECUTIVE" />
      </Widget>
    )
  }

  const rows = await getPenaltyImpactData(filters)
  const breachedCount = rows.filter((r) => r.breached).length
  const totalPenalty = rows.reduce((s, r) => s + (r.breached ? r.penaltyAmount : 0), 0)

  return (
    <Widget
      title="SLA Penalty / Financial Impact"
      titleAr="غرامات مستوى الخدمة / الأثر المالي"
      actions={
        breachedCount > 0 ? (
          <span className="text-xs font-medium text-status-red-fg tabular-nums">
            {breachedCount} breach{breachedCount > 1 ? "es" : ""} · SAR {totalPenalty.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        ) : undefined
      }
      footer="Failure % vs permissible tolerance · breach = avg failure % × operating cost (RFP §6)"
    >
      <PenaltyImpactClient rows={rows} filters={filters} />
    </Widget>
  )
}

function PenaltyImpactSkeleton() {
  return (
    <Widget title="SLA Penalty / Financial Impact">
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-md" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </Widget>
  )
}

export function PenaltyImpactWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="SLA Penalty / Financial Impact">
      <Suspense fallback={<PenaltyImpactSkeleton />}>
        <PenaltyImpactBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
