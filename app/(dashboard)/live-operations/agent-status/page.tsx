import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { AgentStatusBoardWidget } from "@/components/widgets/agent-status-board"
import { LiveRefresh } from "@/components/widgets/live-refresh"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Agent Status Board — Wisal Command Center" }
export const revalidate = 30

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AgentStatusPage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <LiveRefresh pollMs={30_000} />
      <PageHeader
        titleEn="Agent Status Board"
        titleAr="لوحة حالة الوكلاء"
        subtitleEn="Live availability, call state, and wrap-up status for all agents"
        subtitleAr="التوفر الفوري وحالة المكالمة وحالة الإنهاء لجميع الوكلاء"
        crumbs={[
          { labelEn: "Live Operations", labelAr: "العمليات الحية" },
          { labelEn: "Agent Status Board", labelAr: "لوحة حالة الوكلاء" },
        ]}
      />
      <AgentStatusBoardWidget filters={filters} locale="ar" />
    </>
  )
}
