import { Suspense } from "react"
import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getSavingsTrackerData } from "@/lib/queries/executive"
import { SavingsTrackerClient } from "./savings-tracker-client"
import type { Filters } from "@/lib/filters"

interface Props { filters: Filters }

async function SavingsTrackerBody({ filters }: Props) {
  const allowed = await checkRole("EXECUTIVE")
  if (!allowed) {
    return (
      <Widget title="Savings & Efficiency" titleAr="المدخرات والكفاءة">
        <WidgetLocked requiredRole="EXECUTIVE" />
      </Widget>
    )
  }

  const data = await getSavingsTrackerData(filters)

  return (
    <Widget
      title="Savings & Efficiency"
      titleAr="المدخرات والكفاءة"
      footer="مرر للحساب: الحجم × وقت التعامل المُوفَّر · تصدير للتقرير"
    >
      <SavingsTrackerClient data={data} filters={filters} />
    </Widget>
  )
}

function SavingsTrackerSkeleton() {
  return (
    <Widget title="Savings & Efficiency">
      <Skeleton className="h-64 w-full rounded-lg" />
    </Widget>
  )
}

export function SavingsTrackerWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Savings & Efficiency">
      <Suspense fallback={<SavingsTrackerSkeleton />}>
        <SavingsTrackerBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
