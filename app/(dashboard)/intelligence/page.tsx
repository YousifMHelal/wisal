import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { AdaptiveTierMonitorWidget } from "@/components/widgets/adaptive-tier-monitor"
import { AiHumanSplitWidget } from "@/components/widgets/ai-human-split"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "AI Performance — Wisal Command Center" }
export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function IntelligencePage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <PageHeader
        titleEn="AI Performance"
        titleAr="أداء الذكاء الاصطناعي"
        subtitleEn="Adaptive tier routing trends and AI vs human resolution split across channels"
        subtitleAr="اتجاهات توجيه المستويات التكيفية ونسبة حل الذكاء الاصطناعي مقابل البشري"
        crumbs={[
          { labelEn: "Wisal Intelligence", labelAr: "ذكاء وصال" },
          { labelEn: "AI Performance", labelAr: "أداء الذكاء الاصطناعي" },
        ]}
      />
      <div className="space-y-4 md:space-y-6">
        <AdaptiveTierMonitorWidget filters={filters} />
        <AiHumanSplitWidget filters={filters} />
      </div>
    </>
  )
}
