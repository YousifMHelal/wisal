import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { getTrainingImpactData, getTrainingModuleList } from "@/lib/queries/workforce"
import { TrainingImpactClient } from "./training-impact-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"

interface Props {
  filters: Filters
  moduleFilter?: string
}

async function TrainingImpactBody({ filters, moduleFilter }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

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
          {isAr ? `${summaries.length} وحدة` : `${summaries.length} module${summaries.length !== 1 ? "s" : ""}`}
        </span>
      }
      footer={isAr ? "درجة الجودة قبل وبعد كل وحدة تدريبية" : "QA score before and after each training module"}
    >
      <TrainingImpactClient
        summaries={summaries}
        agentDetails={{}}
        moduleList={moduleList}
        defaultModule={moduleFilter ?? ""}
        locale={locale}
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
