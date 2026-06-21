import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { ComplianceScorecardWidget } from "@/components/widgets/compliance-scorecard"
import { MedicalApprovalLogWidget } from "@/components/widgets/medical-approval-log"
import { ConsentAuditWidget } from "@/components/widgets/consent-audit"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Compliance & Audit — Wisal Command Center" }
export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function GovernancePage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <PageHeader
        titleEn="Compliance & Audit"
        titleAr="الامتثال والتدقيق"
        subtitleEn="NCA, PDPL, DGA and NDMO compliance scores, medical approvals, and consent audit"
        subtitleAr="درجات الامتثال لـ NCA وPDPL وDGA وNDMO والموافقات الطبية وتدقيق الموافقة"
        crumbs={[
          { labelEn: "Governance", labelAr: "الحوكمة والامتثال" },
          { labelEn: "Compliance & Audit", labelAr: "الامتثال والتدقيق" },
        ]}
      />
      <div className="space-y-4 md:space-y-6">
        <ComplianceScorecardWidget filters={filters} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <MedicalApprovalLogWidget filters={filters} />
          <ConsentAuditWidget filters={filters} />
        </div>
      </div>
    </>
  )
}
