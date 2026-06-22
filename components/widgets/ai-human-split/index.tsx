import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getAiHumanSplitData } from "@/lib/queries/intelligence"
import { AiHumanSplitClient } from "./ai-human-split-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
}

async function AiHumanSplitBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

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
            {data.overall.aiTotalPct.toFixed(1)}% {isAr ? "ذكاء اصطناعي" : "AI"}
          </span>
        ) : undefined
      }
      footer={isAr ? "تبديل الدائرة ↔ القمع · تقسيم حسب القناة أو التجمع" : "Toggle donut ↔ funnel · split by channel or cluster"}
    >
      <AiHumanSplitClient data={data} locale={locale} />
    </Widget>
  )
}

function AiHumanSplitSkeleton() {
  return (
    <Widget title="AI vs Human Split">
      <div className="flex gap-4">
        <Skeleton className="size-44 rounded-full shrink-0" />
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
    <WidgetErrorBoundary widgetTitle="AI vs Human Split">
      <Suspense fallback={<AiHumanSplitSkeleton />}>
        <AiHumanSplitBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
