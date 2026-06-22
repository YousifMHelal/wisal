import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getCaregiverAuditData } from "@/lib/queries/intelligence"
import { checkRole } from "@/lib/auth"
import { CaregiverAuditClient } from "./caregiver-audit-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
}

async function CaregiverAuditBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const allowed = await checkRole("COMPLIANCE")

  if (!allowed) {
    return (
      <Widget title="Caregiver Mode Audit" titleAr="تدقيق نمط القائم بالرعاية">
        <WidgetLocked requiredRole="COMPLIANCE" requiredRoleAr="الامتثال" />
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
          {rows.length} {isAr ? "حالة" : "cases"}
        </span>
      }
      footer={isAr
        ? "مقيّد بالصلاحيات · الامتثال وما فوق · جميع التفاعلات مسجّلة"
        : "Role-restricted · Compliance and above · all interactions logged"}
    >
      <CaregiverAuditClient rows={rows} locale={locale} />
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
