import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { AgentGridWidget } from "@/components/widgets/agent-grid"
import { ScheduleCoverageWidget } from "@/components/widgets/schedule-coverage"
import { QaQueueWidget } from "@/components/widgets/qa-queue"
import { TrainingImpactWidget } from "@/components/widgets/training-impact"
import { TicketQueueWidget } from "@/components/widgets/ticket-queue"

export const metadata: Metadata = { title: "Workforce & Quality — Wisal Command Center" }

export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function WorkforcePage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters = parseFilters(params)
  const moduleFilter = typeof params.module === "string" ? params.module : undefined

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Row 1: Ticket Queue (full width — operational priority) */}
      <TicketQueueWidget filters={filters} />

      {/* Row 2: Agent Grid (full width) */}
      <AgentGridWidget filters={filters} />

      {/* Row 3: Schedule Coverage (left) + QA Queue (right) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <ScheduleCoverageWidget filters={filters} />
        <QaQueueWidget filters={filters} />
      </div>

      {/* Row 4: Training Impact (full width) */}
      <TrainingImpactWidget filters={filters} moduleFilter={moduleFilter} />
    </div>
  )
}
