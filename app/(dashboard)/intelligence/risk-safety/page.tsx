import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { DriftWatchWidget } from "@/components/widgets/drift-watch"
import { KillSwitchWidget } from "@/components/widgets/kill-switch"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Risk & Safety — Wisal Command Center" }
export const revalidate = 30

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RiskSafetyPage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <PageHeader
        titleEn="Risk & Safety"
        titleAr="المخاطر والسلامة"
        subtitleEn="Dialect drift monitoring and emergency kill switch controls"
        subtitleAr="مراقبة انحراف اللهجة وضوابط مفتاح الإيقاف الطارئ"
        crumbs={[
          { labelEn: "Wisal Intelligence", labelAr: "ذكاء وصال" },
          { labelEn: "Risk & Safety", labelAr: "المخاطر والسلامة" },
        ]}
      />
      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <DriftWatchWidget filters={filters} />
          </div>
          <div className="lg:col-span-1">
            <KillSwitchWidget />
          </div>
        </div>
      </div>
    </>
  )
}
