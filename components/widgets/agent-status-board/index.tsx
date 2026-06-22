import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getAgentStatusBoard } from "@/lib/queries/live-operations"
import { AgentStatusBoardClient } from "./agent-status-board-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
}

async function BoardBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

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
          {totalAvail + totalOnCall}/{totalAgents} {isAr ? "نشط" : "active"}
        </span>
      }
      footer={
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full inline-block" style={{ background: "var(--status-green)" }} />
            {isAr ? "متاح" : "Available"}
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full inline-block" style={{ background: "var(--primary)" }} />
            {isAr ? "في مكالمة" : "On Call"}
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full inline-block" style={{ background: "var(--status-amber)" }} />
            {isAr ? "إنهاء/بعد المكالمة" : "Wrap-up"}
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full inline-block" style={{ background: "var(--muted-foreground)" }} />
            {isAr ? "استراحة" : "Break"}
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full inline-block" style={{ background: "var(--status-red)" }} />
            {isAr ? "غير متصل" : "Offline"}
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

export function AgentStatusBoardWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Live Agent Status">
      <Suspense fallback={<BoardSkeleton />}>
        <BoardBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
