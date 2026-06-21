import { Suspense } from "react"
import { Widget, WidgetSkeleton, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getCaregiverAuditData } from "@/lib/queries/intelligence"
import { checkRole } from "@/lib/auth"
import { CaregiverAuditClient } from "./caregiver-audit-client"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
}

async function CaregiverAuditBody({ filters }: Props) {
  const allowed = await checkRole("COMPLIANCE")

  if (!allowed) {
    return (
      <Widget title="Caregiver Mode Audit" titleAr="تدقيق نمط القائم بالرعاية">
        <WidgetLocked requiredRole="COMPLIANCE" />
      </Widget>
    )
  }

  const rows = await getCaregiverAuditData(filters)

  return (
    <Widget
      title="Caregiver Mode Audit"
      titleAr="تدقيق نمط القائم بالرعاية"
      actions={
        <span className="text-xs text-muted-foreground tabular-nums">
          {rows.length} cases
        </span>
      }
      footer="RBAC-gated · Compliance & above · All interactions logged"
    >
      <CaregiverAuditClient rows={rows} />
    </Widget>
  )
}

function CaregiverAuditSkeleton() {
  return (
    <Widget title="Caregiver Mode Audit">
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-md" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </Widget>
  )
}

export function CaregiverAuditWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Caregiver Mode Audit">
      <Suspense fallback={<CaregiverAuditSkeleton />}>
        <CaregiverAuditBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
