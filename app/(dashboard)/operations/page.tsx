import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { IntegrationNmrWidget } from "@/components/widgets/integration-nmr"
import { SystemHealthWidget } from "@/components/widgets/system-health"
import { Beneficiary360Widget } from "@/components/widgets/beneficiary-360"

export const metadata: Metadata = { title: "Operations & Integrations" }

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OperationsPage({ searchParams }: Props) {
  const params = await searchParams
  const beneficiaryId =
    typeof params.beneficiaryId === "string" ? params.beneficiaryId : undefined

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          <span lang="en" className="[html[dir=rtl]_&]:hidden">Operations &amp; Integrations</span>
          <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">العمليات والتكاملات</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Integration health · System availability · Beneficiary 360 lookup
        </p>
      </div>

      {/* Top row: integration matrix + system health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <IntegrationNmrWidget />
        <SystemHealthWidget />
      </div>

      {/* Full-width: Beneficiary 360 */}
      <Beneficiary360Widget beneficiaryId={beneficiaryId} />
    </div>
  )
}
