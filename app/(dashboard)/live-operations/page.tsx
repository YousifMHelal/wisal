import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { SlaHeatmapWidget } from "@/components/widgets/sla-heatmap"
import { ChannelPulseWidget } from "@/components/widgets/channel-pulse"
import { ActiveIncidentsWidget } from "@/components/widgets/active-incidents"
import { TodayVsTargetWidget } from "@/components/widgets/today-vs-target"
import { AgentStatusBoardWidget } from "@/components/widgets/agent-status-board"
import { LiveRefresh } from "@/components/widgets/live-refresh"

export const metadata: Metadata = { title: "Live Operations — Wisal Command Center" }

// Revalidate every 30s for ISR fallback (complements SSE)
export const revalidate = 30

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LiveOperationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters = parseFilters(params)

  return (
    <>
      {/* SSE live refresh — client-only, no layout impact */}
      <LiveRefresh pollMs={30_000} />

      <div className="space-y-4 md:space-y-6">
        {/* Row 1: Active Incidents — full width, fires first */}
        <ActiveIncidentsWidget filters={filters} />

        {/* Row 2: Today vs Target (1/3) + Channel Pulse (2/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-1">
            <TodayVsTargetWidget filters={filters} />
          </div>
          <div className="lg:col-span-2">
            <ChannelPulseWidget filters={filters} />
          </div>
        </div>

        {/* Row 3: SLA Heatmap (full width) */}
        {/* <SlaHeatmapWidget filters={filters} /> */}

        {/* Row 4: Live Agent Status Board — full width */}
        <AgentStatusBoardWidget filters={filters} />
      </div>
    </>
  );
}
