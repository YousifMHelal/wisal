import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { BeneficiaryVoiceWidget } from "@/components/widgets/beneficiary-voice"
import { CampaignResultsWidget } from "@/components/widgets/campaign-results"
import { PenaltyImpactWidget } from "@/components/widgets/penalty-impact"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Voice & Campaigns — Wisal Command Center" }
export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function InsightsPage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <PageHeader
        titleEn="Voice & Campaigns"
        titleAr="الصوت والحملات"
        subtitleEn="Beneficiary sentiment themes, outbound campaign outcomes, and SLA penalty exposure"
        subtitleAr="موضوعات مشاعر المستفيدين ونتائج الحملات الصادرة وتعرض غرامات مستوى الخدمة"
        crumbs={[
          { labelEn: "Executive Rollup", labelAr: "ملخص تنفيذي" },
          { labelEn: "Voice & Campaigns", labelAr: "الصوت والحملات" },
        ]}
      />
      <div className="space-y-4 md:space-y-6">
        <BeneficiaryVoiceWidget />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <CampaignResultsWidget filters={filters} />
          <PenaltyImpactWidget filters={filters} />
        </div>
      </div>
    </>
  )
}
