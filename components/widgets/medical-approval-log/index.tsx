import { Suspense } from "react"
import { Widget, WidgetSkeleton, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getMedicalApprovalData } from "@/lib/queries/governance"
import { checkRole } from "@/lib/auth"
import { MedicalApprovalLogClient } from "./medical-approval-log-client"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"
interface Props {
  filters: Filters
}

function buildExportQs(filters: Filters): string {
  const p = new URLSearchParams()
  if (filters.cluster) p.set("cluster", filters.cluster)
  if (filters.from) p.set("from", filters.from.toISOString())
  if (filters.to) p.set("to", filters.to.toISOString())
  const qs = p.toString()
  return qs ? `?${qs}` : ""
}

async function MedicalApprovalLogBody({ filters }: Props) {
  const allowed = await checkRole("COMPLIANCE")
  if (!allowed) {
    return (
      <Widget title="Medical Content Approval Log" titleAr="سجل اعتماد المحتوى الطبي">
        <WidgetLocked requiredRole="COMPLIANCE" />
      </Widget>
    )
  }

  const rows = await getMedicalApprovalData(filters)
  const exportUrl = `/api/export/medical-approvals${buildExportQs(filters)}`

  return (
    <Widget
      title="Medical Content Approval Log"
      titleAr="سجل اعتماد المحتوى الطبي"
      actions={
        <span className="text-xs text-muted-foreground tabular-nums">{rows.length} records</span>
      }
      footer="Governance & Compliance · COMPLIANCE role required · All records are audit-logged"
    >
      <MedicalApprovalLogClient rows={rows} exportUrl={exportUrl} />
    </Widget>
  )
}

function MedicalApprovalLogSkeleton() {
  return (
    <Widget title="Medical Content Approval Log">
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-md" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </Widget>
  )
}

export function MedicalApprovalLogWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Medical Content Approval Log">
      <Suspense fallback={<MedicalApprovalLogSkeleton />}>
        <MedicalApprovalLogBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
