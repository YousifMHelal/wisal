import type { Metadata } from "next"
import { IntegrationNmrWidget } from "@/components/widgets/integration-nmr"
import { SystemHealthWidget } from "@/components/widgets/system-health"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Integration & Health — Wisal Command Center" }
export const revalidate = 60

export default function OperationsPage() {
  return (
    <>
      <PageHeader
        titleEn="Integration & System Health"
        titleAr="التكاملات وصحة النظام"
        subtitleEn="NMR live feed, integration matrix status, availability SLA and DR readiness"
        subtitleAr="التغذية الحية لـ NMR وحالة مصفوفة التكاملات وتوفر مستوى الخدمة وجاهزية التعافي"
        crumbs={[
          { labelEn: "Operations", labelAr: "العمليات والتكاملات" },
          { labelEn: "Integration & Health", labelAr: "التكاملات وصحة النظام" },
        ]}
      />
      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <IntegrationNmrWidget />
          <SystemHealthWidget />
        </div>
      </div>
    </>
  )
}
