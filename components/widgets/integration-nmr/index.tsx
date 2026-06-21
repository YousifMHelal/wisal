import { Suspense } from "react"
import { Widget, WidgetSkeleton, WidgetLocked } from "@/components/widgets/widget"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getIntegrationStatusData } from "@/lib/queries/operations"
import { IntegrationNmrClient } from "./integration-nmr-client"

async function IntegrationNmrBody() {
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
      footer="Integration matrix health · NMR = Live Open API feed · No point-to-point connections"
    >
      <IntegrationNmrClient rows={rows} />
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
    <Suspense fallback={<IntegrationNmrSkeleton />}>
      <IntegrationNmrBody />
    </Suspense>
  )
}
