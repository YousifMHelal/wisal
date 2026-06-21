import { Suspense } from "react"
import { Widget } from "@/components/widgets/widget"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { WidgetLocked } from "@/components/widgets/widget"
import { getTicketQueueData, getAssignableAgents } from "@/lib/queries/workforce"
import { TicketQueueClient } from "./ticket-queue-client"
import type { Filters } from "@/lib/filters"

interface Props {
  filters: Filters
}

async function TicketQueueBody({ filters }: Props) {
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
              {breachedCount} SLA breached
            </span>
          )}
          <span className="text-xs text-muted-foreground tabular-nums">
            {tickets.length} open
          </span>
        </div>
      }
      footer="Complaints & requests · row → Beneficiary 360 · assign agent writes AuditLog"
    >
      <TicketQueueClient tickets={tickets} agents={agents} />
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
    <Suspense fallback={<TicketQueueSkeleton />}>
      <TicketQueueBody filters={filters} />
    </Suspense>
  )
}
