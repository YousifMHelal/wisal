import type { Metadata } from "next"
import { Beneficiary360Widget } from "@/components/widgets/beneficiary-360"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Beneficiary 360 — Wisal Command Center" }
export const revalidate = 0

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Beneficiary360Page({ searchParams }: PageProps) {
  const params = await searchParams
  const beneficiaryId = typeof params.beneficiaryId === "string" ? params.beneficiaryId : undefined
  return (
    <>
      <PageHeader
        titleEn="Beneficiary 360"
        titleAr="المستفيد 360"
        subtitleEn="Search beneficiaries by ID or name — full profile, cross-channel history, and consent status"
        subtitleAr="البحث عن المستفيدين بالرقم أو الاسم — الملف الكامل والتاريخ متعدد القنوات وحالة الموافقة"
        crumbs={[
          { labelEn: "Operations", labelAr: "العمليات والتكاملات" },
          { labelEn: "Beneficiary 360", labelAr: "المستفيد 360" },
        ]}
      />
      <Beneficiary360Widget beneficiaryId={beneficiaryId} />
    </>
  )
}
