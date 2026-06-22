import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getQaQueueData } from "@/lib/queries/workforce"
import { QaQueueClient } from "./qa-queue-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"

interface Props {
  filters: Filters
}

async function QaQueueBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

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
          {isAr ? `${items.length} غير مراجَع` : `${items.length} unreviewed`}
        </span>
      }
      footer={isAr
        ? "مرتّب حسب الأولوية · المشاعر السلبية أو انخفاض ثقة الروبوت يُعرض أولاً"
        : "Sorted by priority · worst sentiment or lowest bot confidence shown first"}
    >
      <QaQueueClient items={items} locale={locale} />
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
