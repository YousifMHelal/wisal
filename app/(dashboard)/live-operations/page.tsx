import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { ActiveIncidentsWidget } from "@/components/widgets/active-incidents"
import { ChannelPulseWidget } from "@/components/widgets/channel-pulse"
import { LiveRefresh } from "@/components/widgets/live-refresh"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Live Operations — Wisal Command Center" }
export const revalidate = 30

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LiveOperationsPage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <LiveRefresh pollMs={30_000} />
      <PageHeader
        titleEn="Operations Overview"
        titleAr="نظرة عامة على العمليات"
        subtitleEn="Real-time incident feed and channel activity across all clusters"
        subtitleAr="تغذية الحوادث الفورية ونشاط القنوات عبر جميع المجموعات"
        crumbs={[
          { labelEn: "Live Operations", labelAr: "العمليات الحية" },
          { labelEn: "Overview", labelAr: "نظرة عامة" },
        ]}
      />
      <div className="space-y-4 md:space-y-6">
        <ActiveIncidentsWidget filters={filters} />
        <ChannelPulseWidget filters={filters} />
      </div>
    </>
  )
}
