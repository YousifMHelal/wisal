import { Suspense } from "react"
import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getQaQueueData } from "@/lib/queries/workforce"
import { QaQueueClient } from "./qa-queue-client"
import type { Filters } from "@/lib/filters"

interface Props {
  filters: Filters
}

async function QaQueueBody({ filters }: Props) {
  const allowed = await checkRole("SUPERVISOR")
  if (!allowed) {
    return (
      <Widget title="QA Sampling Queue" titleAr="قائمة انتظار مراجعة الجودة">
        <WidgetLocked requiredRole="SUPERVISOR" />
      </Widget>
    )
  }

  const items = await getQaQueueData(filters)

  return (
    <Widget
      title="QA Sampling Queue"
      titleAr="قائمة انتظار مراجعة الجودة"
      actions={
        <span className="text-xs text-muted-foreground tabular-nums">
          {items.length} غير مراجَع
        </span>
      }
      footer="مرتّب حسب الأولوية · المشاعر السلبية أو انخفاض ثقة الروبوت يُعرض أولاً"
    >
      <QaQueueClient items={items} />
    </Widget>
  )
}

function QaQueueSkeleton() {
  return (
    <Widget title="QA Sampling Queue">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </Widget>
  )
}

export function QaQueueWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="QA Sampling Queue">
      <Suspense fallback={<QaQueueSkeleton />}>
        <QaQueueBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
