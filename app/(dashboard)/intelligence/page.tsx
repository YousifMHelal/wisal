import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { AdaptiveTierMonitorWidget } from "@/components/widgets/adaptive-tier-monitor"
import { CaregiverAuditWidget } from "@/components/widgets/caregiver-audit"
import { AiHumanSplitWidget } from "@/components/widgets/ai-human-split"
import { DriftWatchWidget } from "@/components/widgets/drift-watch"
import { KillSwitchWidget } from "@/components/widgets/kill-switch"

export const metadata: Metadata = { title: "Wisal Intelligence — Command Center" }

export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function IntelligencePage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters = parseFilters(params)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Row 1: Tier Monitor (full width) */}
      <AdaptiveTierMonitorWidget filters={filters} />

      {/* Row 2: AI vs Human Split (left) + Kill Switch (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <AiHumanSplitWidget filters={filters} />
        </div>
        <div className="lg:col-span-1">
          <KillSwitchWidget />
        </div>
      </div>

      {/* Row 3: Drift Watch (full width) */}
      <DriftWatchWidget filters={filters} />

      {/* Row 4: Caregiver Audit (full width, RBAC-gated) */}
      <CaregiverAuditWidget filters={filters} />
    </div>
  )
}
