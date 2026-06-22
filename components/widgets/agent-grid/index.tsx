import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { getAgentGridData, getAgentTrainingHistory } from "@/lib/queries/workforce"
import { AgentGridClient } from "./agent-grid-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"

interface Props {
  filters: Filters
}

async function AgentGridBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const agents = await getAgentGridData(filters)

  // Pre-load training for all agents (batched)
  const trainingResults = await Promise.all(
    agents.map((a) => getAgentTrainingHistory(a.id).then((t) => [a.id, t] as const))
  )
  const trainingMap = Object.fromEntries(trainingResults)

  return (
    <Widget
      title="Agent Performance Grid"
      titleAr="شبكة أداء الوكلاء"
      actions={
        <span className="text-xs text-muted-foreground tabular-nums">
          {isAr ? `${agents.length} موظف` : `${agents.length} agent${agents.length !== 1 ? "s" : ""}`}
        </span>
      }
    >
      <AgentGridClient agents={agents} trainingMap={trainingMap} locale={locale} />
    </Widget>
  )
}

function AgentGridSkeleton() {
  return (
    <Widget title="Agent Performance Grid">
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-md" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </Widget>
  )
}

export function AgentGridWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Agent Performance Grid">
      <Suspense fallback={<AgentGridSkeleton />}>
        <AgentGridBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
