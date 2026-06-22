import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton, WidgetLocked, WidgetEmpty } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getClusterRankingData } from "@/lib/queries/executive"
import { ClusterRankingClient } from "./cluster-ranking-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"

interface Props { filters: Filters }

async function ClusterRankingBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const allowed = await checkRole("EXECUTIVE")
  if (!allowed) {
    return (
      <Widget title="Cluster Ranking" titleAr="تصنيف المجموعات">
        <WidgetLocked requiredRole="EXECUTIVE" />
      </Widget>
    )
  }

  const rows = await getClusterRankingData(filters)

  return (
    <Widget
      title="Cluster Ranking"
      titleAr="تصنيف المجموعات"
      footer={isAr
        ? "النتيجة المركبة · قابل للترتيب حسب أي مؤشر · انقر على التجمع لتصفية لوحة التحكم"
        : "Composite score · sortable by any KPI · click a cluster to filter the dashboard"}
    >
      {rows.length === 0 ? (
        <div className="flex items-center justify-center min-h-30">
          <p className="text-sm text-muted-foreground">
            {isAr ? "لا توجد بيانات ترتيب لهذه الفترة." : "No ranking data for this period."}
          </p>
        </div>
      ) : (
        <ClusterRankingClient rows={rows} locale={locale} />
      )}
    </Widget>
  )
}

function ClusterRankingSkeleton() {
  return (
    <Widget title="Cluster Ranking">
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-md" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </Widget>
  )
}

export function ClusterRankingWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Cluster Ranking">
      <Suspense fallback={<ClusterRankingSkeleton />}>
        <ClusterRankingBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
