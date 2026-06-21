import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { MedicalApprovalLogWidget } from "@/components/widgets/medical-approval-log"
import { ConsentAuditWidget } from "@/components/widgets/consent-audit"
import { ForbiddenIntentWidget } from "@/components/widgets/forbidden-intent"
import { ComplianceScorecardWidget } from "@/components/widgets/compliance-scorecard"
import { KnowledgeBaseWidget } from "@/components/widgets/knowledge-base"

export const metadata: Metadata = { title: "Governance & Compliance — Wisal Command Center" }

export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function GovernancePage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters = parseFilters(params)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Row 1: Compliance Scorecard (full width) */}
      <ComplianceScorecardWidget filters={filters} />

      {/* Row 2: Medical Approval Log (left) + Consent Audit (right) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <MedicalApprovalLogWidget filters={filters} />
        <ConsentAuditWidget filters={filters} />
      </div>

      {/* Row 3: Forbidden Intent (full width, trend + log) */}
      <ForbiddenIntentWidget filters={filters} />

      {/* Row 4: Knowledge Base (full width) */}
      <KnowledgeBaseWidget filters={filters} />
    </div>
  )
}
