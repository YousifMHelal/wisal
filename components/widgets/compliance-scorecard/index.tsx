import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getComplianceScorecardData } from "@/lib/queries/governance"
import { checkRole } from "@/lib/auth"
import { ComplianceScorecardClient } from "./compliance-scorecard-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
}

async function ComplianceScorecardBody({ filters: _filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const allowed = await checkRole("COMPLIANCE")
  if (!allowed) {
    return (
      <Widget title="Compliance Scorecard" titleAr="بطاقة أداء الامتثال">
        <WidgetLocked requiredRole="COMPLIANCE" />
      </Widget>
    )
  }

  const cards = await getComplianceScorecardData()
  const nonCompliantCount = cards.filter((c) => c.status === "NON_COMPLIANT").length
  const partialCount = cards.filter((c) => c.status === "PARTIAL").length

  const statusSummary = isAr
    ? nonCompliantCount > 0
      ? `${nonCompliantCount} خرق`
      : partialCount > 0
      ? `${partialCount} جزئي`
      : "الكل ممتثل"
    : nonCompliantCount > 0
      ? `${nonCompliantCount} breach${nonCompliantCount > 1 ? "es" : ""}`
      : partialCount > 0
      ? `${partialCount} partial`
      : "All compliant"

  return (
    <Widget
      title="Compliance Scorecard"
      titleAr="بطاقة أداء الامتثال"
      actions={
        <span className={`text-xs font-medium tabular-nums ${
          nonCompliantCount > 0 ? "text-status-red-fg" :
          partialCount > 0 ? "text-status-amber-fg" :
          "text-status-green-fg"
        }`}>
          {statusSummary}
        </span>
      }
      footer={isAr
        ? "NCA · PDPL · DGA · NDMO · تصدير حسب الإطار أو حزمة الامتثال الكاملة"
        : "NCA · PDPL · DGA · NDMO · export by framework or full compliance pack"}
    >
      <ComplianceScorecardClient
        cards={cards}
        packExportUrl="/api/export/compliance-pack"
        locale={locale}
      />
    </Widget>
  )
}

function ComplianceScorecardSkeleton() {
  return (
    <Widget title="Compliance Scorecard">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </Widget>
  )
}

export function ComplianceScorecardWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Compliance Scorecard">
      <Suspense fallback={<ComplianceScorecardSkeleton />}>
        <ComplianceScorecardBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
