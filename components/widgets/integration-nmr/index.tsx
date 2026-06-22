import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getIntegrationStatusData } from "@/lib/queries/operations"
import { IntegrationNmrClient } from "./integration-nmr-client"
import { resolveLocale } from "@/lib/i18n"

async function IntegrationNmrBody() {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const allowed = await checkRole("PLATFORM_ADMIN")
  if (!allowed) {
    return (
      <Widget title="Integration & NMR Status" titleAr="حالة التكاملات وـ NMR">
        <WidgetLocked requiredRole="PLATFORM_ADMIN" />
      </Widget>
    )
  }

  const rows = await getIntegrationStatusData()

  return (
    <Widget
      title="Integration & NMR Status"
      titleAr="حالة التكاملات وـ NMR"
      footer={isAr
        ? "صحة مصفوفة التكاملات · NMR = تغذية API مباشرة · لا وصلات مباشرة"
        : "Integration matrix health · NMR = live API feed · no direct system-to-system links"}
    >
      <IntegrationNmrClient rows={rows} locale={locale} />
    </Widget>
  )
}

function IntegrationNmrSkeleton() {
  return (
    <Widget title="Integration & NMR Status">
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </Widget>
  )
}

export function IntegrationNmrWidget() {
  return (
    <WidgetErrorBoundary widgetTitle="Integration & NMR Status">
      <Suspense fallback={<IntegrationNmrSkeleton />}>
        <IntegrationNmrBody />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
