import { Suspense } from "react"
import { Widget, WidgetSkeleton } from "@/components/widgets/widget"
import { getAiHumanSplitData } from "@/lib/queries/intelligence"
import { AiHumanSplitClient } from "./ai-human-split-client"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
}

async function AiHumanSplitBody({ filters }: Props) {
  const data = await getAiHumanSplitData(filters)

  return (
    <Widget
      title="AI vs Human Split"
      titleAr="توزيع الذكاء الاصطناعي مقابل الإنسان"
      actions={
        data.overall.aiTotalPct > 0 ? (
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ color: "var(--primary)" }}
          >
            {data.overall.aiTotalPct.toFixed(1)}% AI
          </span>
        ) : undefined
      }
      footer="Toggle donut ↔ funnel · Segment by channel or cluster"
    >
      <AiHumanSplitClient data={data} />
    </Widget>
  )
}

function AiHumanSplitSkeleton() {
  return (
    <Widget title="AI vs Human Split">
      <div className="flex gap-4">
        <Skeleton className="size-44 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </Widget>
  )
}

export function AiHumanSplitWidget({ filters }: Props) {
  return (
    <Suspense fallback={<AiHumanSplitSkeleton />}>
      <AiHumanSplitBody filters={filters} />
    </Suspense>
  )
}
