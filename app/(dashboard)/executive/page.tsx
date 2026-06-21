import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { KpiScorecardWidget } from "@/components/widgets/kpi-scorecard"
import { ClusterRankingWidget } from "@/components/widgets/cluster-ranking"
import { SavingsTrackerWidget } from "@/components/widgets/savings-tracker"
import { BeneficiaryVoiceWidget } from "@/components/widgets/beneficiary-voice"
import { CampaignResultsWidget } from "@/components/widgets/campaign-results"
import { PenaltyImpactWidget } from "@/components/widgets/penalty-impact"

export const metadata: Metadata = { title: "Executive Rollup" }

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ExecutivePage({ searchParams }: Props) {
  const params = await searchParams
  const filters = parseFilters(params)

  return (
    <div className="space-y-4 max-w-screen-2xl">
      {/* Row 1: KPI Scorecard — full width */}
      <KpiScorecardWidget />

      {/* Row 2: Cluster Ranking + Savings Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ClusterRankingWidget filters={filters} />
        <SavingsTrackerWidget filters={filters} />
      </div>

      {/* Row 3: Beneficiary Voice — full width */}
      <BeneficiaryVoiceWidget />

      {/* Row 4: Campaign Results + Penalty Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CampaignResultsWidget filters={filters} />
        <PenaltyImpactWidget filters={filters} />
      </div>
    </div>
  )
}
