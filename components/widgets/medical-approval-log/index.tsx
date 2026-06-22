import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getMedicalApprovalData } from "@/lib/queries/governance"
import { checkRole } from "@/lib/auth"
import { MedicalApprovalLogClient } from "./medical-approval-log-client"
import { resolveLocale } from "@/lib/i18n"
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
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

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
        <span className="text-xs text-muted-foreground tabular-nums">
          {rows.length} {isAr ? "سجل" : "records"}
        </span>
      }
      footer={isAr
        ? "الحوكمة والامتثال · يتطلب دور الامتثال · جميع السجلات مدرجة في سجل التدقيق"
        : "Governance & compliance · requires Compliance role · all records in audit log"}
    >
      <MedicalApprovalLogClient rows={rows} exportUrl={exportUrl} locale={locale} />
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
