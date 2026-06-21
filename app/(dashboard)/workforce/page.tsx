import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { TicketQueueWidget } from "@/components/widgets/ticket-queue"
import { AgentGridWidget } from "@/components/widgets/agent-grid"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Tickets & Agents — Wisal Command Center" }
export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function WorkforcePage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <PageHeader
        titleEn="Tickets & Agents"
        titleAr="التذاكر والوكلاء"
        subtitleEn="Open ticket queue with SLA tracking and full agent performance grid"
        subtitleAr="قائمة التذاكر المفتوحة مع تتبع مستوى الخدمة وشبكة أداء الوكلاء الكاملة"
        crumbs={[
          { labelEn: "Workforce & Quality", labelAr: "القوى العاملة والجودة" },
          { labelEn: "Tickets & Agents", labelAr: "التذاكر والوكلاء" },
        ]}
      />
      <div className="space-y-4 md:space-y-6">
        <TicketQueueWidget filters={filters} />
        <AgentGridWidget filters={filters} />
      </div>
    </>
  )
}
