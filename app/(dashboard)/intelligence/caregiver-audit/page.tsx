import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { CaregiverAuditWidget } from "@/components/widgets/caregiver-audit"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Caregiver Audit — Wisal Command Center" }
export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CaregiverAuditPage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <PageHeader
        titleEn="Caregiver Mode Audit"
        titleAr="تدقيق وضع مقدم الرعاية"
        subtitleEn="Tier 3 proxy-consent decisions, action log, and escalation audit trail"
        subtitleAr="قرارات الموافقة بالوكالة للمستوى الثالث وسجل الإجراءات ومسار التدقيق"
        crumbs={[
          { labelEn: "Wisal Intelligence", labelAr: "ذكاء وصال" },
          { labelEn: "Caregiver Audit", labelAr: "تدقيق مقدم الرعاية" },
        ]}
      />
      <CaregiverAuditWidget filters={filters} />
    </>
  )
}
