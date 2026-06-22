import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getCampaignResultsData } from "@/lib/queries/executive"
import { CampaignResultsClient } from "./campaign-results-client"
import { resolveLocale } from "@/lib/i18n"
import type { Filters } from "@/lib/filters"

interface Props { filters: Filters }

async function CampaignResultsBody({ filters }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

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
      footer={isAr
        ? "الحملات الصادرة · مُرسَل / مُوصَّل / استجابة · حسب النوع"
        : "Outbound campaigns · sent / delivered / responded · by type"}
    >
      <CampaignResultsClient campaigns={campaigns} locale={locale} />
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
