import { Suspense } from "react"
import { Widget, WidgetSkeleton } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getKnowledgeBaseData } from "@/lib/queries/governance"
import { checkRole } from "@/lib/auth"
import { KnowledgeBaseClient } from "./knowledge-base-client"
import type { Filters } from "@/lib/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  filters: Filters
}

async function KnowledgeBaseBody({ filters: _filters }: Props) {
  const [rows, canPublish] = await Promise.all([
    getKnowledgeBaseData(),
    checkRole("COMPLIANCE"),
  ])

  const publishedCount = rows.filter((r) => r.status === "PUBLISHED").length
  const draftCount = rows.filter((r) => r.status === "DRAFT").length

  return (
    <Widget
      title="Knowledge Base"
      titleAr="قاعدة المعرفة"
      actions={
        <span className="text-xs text-muted-foreground tabular-nums">
          {publishedCount} published · {draftCount} draft
        </span>
      }
      footer={
        canPublish
          ? "Bilingual AR/EN · Version-tracked · Publish requires COMPLIANCE role · All changes audit-logged"
          : "Bilingual AR/EN · Version-tracked · Read-only view"
      }
    >
      <KnowledgeBaseClient rows={rows} canPublish={canPublish} />
    </Widget>
  )
}

function KnowledgeBaseSkeleton() {
  return (
    <Widget title="Knowledge Base">
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-md" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </Widget>
  )
}

export function KnowledgeBaseWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Knowledge Base">
      <Suspense fallback={<KnowledgeBaseSkeleton />}>
        <KnowledgeBaseBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
