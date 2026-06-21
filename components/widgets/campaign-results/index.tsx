import { Suspense } from "react"
import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getCampaignResultsData } from "@/lib/queries/executive"
import { CampaignResultsClient } from "./campaign-results-client"
import type { Filters } from "@/lib/filters"

interface Props { filters: Filters }

async function CampaignResultsBody({ filters }: Props) {
  const allowed = await checkRole("EXECUTIVE")
  if (!allowed) {
    return (
      <Widget title="Campaign Results" titleAr="نتائج الحملات">
        <WidgetLocked requiredRole="EXECUTIVE" />
      </Widget>
    )
  }

  const campaigns = await getCampaignResultsData(filters)

  return (
    <Widget
      title="Campaign Results"
      titleAr="نتائج الحملات"
      footer="Outbound campaigns · sent / delivered / responded · by type"
    >
      <CampaignResultsClient campaigns={campaigns} />
    </Widget>
  )
}

function CampaignResultsSkeleton() {
  return (
    <Widget title="Campaign Results">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </div>
    </Widget>
  )
}

export function CampaignResultsWidget({ filters }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Campaign Results">
      <Suspense fallback={<CampaignResultsSkeleton />}>
        <CampaignResultsBody filters={filters} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
