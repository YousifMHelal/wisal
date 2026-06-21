import { Suspense } from "react"
import { Widget } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { getTrainingImpactData, getTrainingModuleList } from "@/lib/queries/workforce"
import { TrainingImpactClient } from "./training-impact-client"
import type { Filters } from "@/lib/filters"

interface Props {
  filters: Filters
  moduleFilter?: string
}

async function TrainingImpactBody({ filters, moduleFilter }: Props) {
  const [summaries, moduleList] = await Promise.all([
    getTrainingImpactData(filters, moduleFilter),
    getTrainingModuleList(),
  ])

  return (
    <Widget
      title="Training Impact"
      titleAr="أثر التدريب"
      actions={
        <span className="text-xs text-muted-foreground tabular-nums">
          {summaries.length} module{summaries.length !== 1 ? "s" : ""}
        </span>
      }
      footer="QA score before vs after per training module"
    >
      <TrainingImpactClient
        summaries={summaries}
        agentDetails={{}}
        moduleList={moduleList}
        defaultModule={moduleFilter ?? ""}
      />
    </Widget>
  )
}

function TrainingImpactSkeleton() {
  return (
    <Widget title="Training Impact">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-48 w-full rounded-md" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </Widget>
  )
}

export function TrainingImpactWidget({ filters, moduleFilter }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Training Impact">
      <Suspense fallback={<TrainingImpactSkeleton />}>
        <TrainingImpactBody filters={filters} moduleFilter={moduleFilter} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
