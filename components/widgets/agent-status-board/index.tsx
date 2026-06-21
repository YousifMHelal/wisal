import { Suspense } from "react"
import { Widget, WidgetSkeleton } from "@/components/widgets/widget"
import { getAgentStatusBoard } from "@/lib/queries/live-operations"
import { AgentStatusBoardClient } from "./agent-status-board-client"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
  locale?: string
}

async function BoardBody({ filters, locale = "en" }: Props) {
  const data = await getAgentStatusBoard(filters)

  const totalAgents = data.reduce((s, c) => s + c.total, 0)
  const totalAvail = data.reduce((s, c) => s + c.available, 0)
  const totalOnCall = data.reduce((s, c) => s + c.onCall, 0)

  return (
    <Widget
      title="Live Agent Status"
      titleAr="حالة الوكلاء المباشرة"
      actions={
        <span className="text-xs text-muted-foreground tabular">
          {totalAvail + totalOnCall}/{totalAgents} active
        </span>
      }
      footer={
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full inline-block" style={{ background: "var(--status-green)" }} />
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full inline-block" style={{ background: "var(--primary)" }} />
            On Call
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full inline-block" style={{ background: "var(--status-amber)" }} />
            Wrap/After
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full inline-block" style={{ background: "var(--muted-foreground)" }} />
            Break
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full inline-block" style={{ background: "var(--status-red)" }} />
            Offline
          </span>
        </div>
      }
    >
      <AgentStatusBoardClient data={data} locale={locale} />
    </Widget>
  )
}

function BoardSkeleton() {
  return (
    <Widget title="Live Agent Status">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </Widget>
  )
}

export function AgentStatusBoardWidget({ filters, locale }: Props) {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <BoardBody filters={filters} locale={locale} />
    </Suspense>
  )
}
