import { Suspense } from "react"
import { Widget, WidgetSkeleton, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getConsentAuditData } from "@/lib/queries/governance"
import { checkRole } from "@/lib/auth"
import { ConsentAuditClient } from "./consent-audit-client"
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

async function ConsentAuditBody({ filters }: Props) {
  const allowed = await checkRole("COMPLIANCE")
  if (!allowed) {
    return (
      <Widget title="Consent & Disclosure Audit" titleAr="تدقيق الموافقة والإفصاح">
        <WidgetLocked requiredRole="COMPLIANCE" />
      </Widget>
    )
  }

  const rows = await getConsentAuditData(filters)
  const exportUrl = `/api/export/consent-audit${buildExportQs(filters)}`

  const missingCount = rows.filter((r) => !r.consentOnFile).length

  return (
    <Widget
      title="Consent & Disclosure Audit"
      titleAr="تدقيق الموافقة والإفصاح"
      actions={
        <span className={`text-xs tabular-nums font-medium ${missingCount > 0 ? "text-status-red-fg" : "text-muted-foreground"}`}>
          {missingCount > 0 ? `${missingCount} مفقود` : `${rows.length} سجل`}
        </span>
      }
      footer="مرتبط بمراجعة مقدم الرعاية (الوحدة 02) · يتطلب دور الامتثال"
    >
      <ConsentAuditClient rows={rows} exportUrl={exportUrl} />
    </Widget>
  )
}

function ConsentAuditSkeleton() {
  return (
    <Widget title="Consent & Disclosure Audit">
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-md" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </Widget>
  )
}

export function ConsentAuditWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Consent & Disclosure Audit">
      <Suspense fallback={<ConsentAuditSkeleton />}>
        <ConsentAuditBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
