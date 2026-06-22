import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getTicketQueueData, getAssignableAgents } from "@/lib/queries/workforce"
import { TicketQueueClient } from "./ticket-queue-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"

interface Props {
  filters: Filters
}

async function TicketQueueBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const allowed = await checkRole("SUPERVISOR")
  if (!allowed) {
    return (
      <Widget title="Ticket / Case Queue" titleAr="قائمة التذاكر والحالات">
        <WidgetLocked requiredRole="SUPERVISOR" />
      </Widget>
    )
  }

  const [tickets, agents] = await Promise.all([
    getTicketQueueData(filters),
    getAssignableAgents(filters.cluster ?? undefined),
  ])

  const breachedCount = tickets.filter((t) => t.slaBreached).length

  return (
    <Widget
      title="Ticket / Case Queue"
      titleAr="قائمة التذاكر والحالات"
      actions={
        <div className="flex items-center gap-2">
          {breachedCount > 0 && (
            <span className="text-xs text-[var(--status-red-fg)] tabular-nums font-medium">
              {isAr ? `${breachedCount} خرق اتفاقية الخدمة` : `${breachedCount} SLA breach${breachedCount !== 1 ? "es" : ""}`}
            </span>
          )}
          <span className="text-xs text-muted-foreground tabular-nums">
            {isAr ? `${tickets.length} مفتوح` : `${tickets.length} open`}
          </span>
        </div>
      }
      footer={isAr
        ? "الشكاوى والطلبات · الصف → ملف المستفيد ٣٦٠ · تكليف موظف يُسجّل في سجل التدقيق"
        : "Complaints & requests · queue → beneficiary 360 profile · assigning an agent is audit-logged"}
    >
      <TicketQueueClient tickets={tickets} agents={agents} locale={locale} />
    </Widget>
  )
}

function TicketQueueSkeleton() {
  return (
    <Widget title="Ticket / Case Queue">
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-md" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </Widget>
  )
}

export function TicketQueueWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Ticket / Case Queue">
      <Suspense fallback={<TicketQueueSkeleton />}>
        <TicketQueueBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
