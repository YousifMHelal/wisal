import type { Metadata } from "next"
import { parseFilters } from "@/lib/filters"
import { ScheduleCoverageWidget } from "@/components/widgets/schedule-coverage"
import { QaQueueWidget } from "@/components/widgets/qa-queue"
import { PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Scheduling & QA — Wisal Command Center" }
export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SchedulingPage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams)
  return (
    <>
      <PageHeader
        titleEn="Scheduling & QA"
        titleAr="الجدولة والجودة"
        subtitleEn="Staffing coverage vs demand forecast and prioritized QA sampling queue"
        subtitleAr="تغطية التوظيف مقابل توقعات الطلب وقائمة عينات الجودة ذات الأولوية"
        crumbs={[
          { labelEn: "Workforce & Quality", labelAr: "القوى العاملة والجودة" },
          { labelEn: "Scheduling & QA", labelAr: "الجدولة والجودة" },
        ]}
      />
      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <ScheduleCoverageWidget filters={filters} />
          <QaQueueWidget filters={filters} />
        </div>
      </div>
    </>
  )
}
