import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { Beneficiary360Client } from "./beneficiary-360-client"
import { resolveLocale } from "@/lib/i18n"

interface Props {
  beneficiaryId?: string
}

async function Beneficiary360Body({ beneficiaryId }: Props) {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const allowed = await checkRole("SUPERVISOR")
  if (!allowed) {
    return (
      <Widget title="Beneficiary 360" titleAr="ملف المستفيد الشامل">
        <WidgetLocked requiredRole="SUPERVISOR" />
      </Widget>
    )
  }

  return (
    <Widget
      title="Beneficiary 360"
      titleAr="ملف المستفيد الشامل"
      footer={isAr
        ? "ابحث برقم الهوية (الإقامة) أو الاسم · سجل التفاعلات عبر القنوات · التذاكر النشطة"
        : "Search by national ID (iqama) or name · cross-channel interaction history · active tickets"}
    >
      <Beneficiary360Client initialBeneficiaryId={beneficiaryId} locale={locale} />
    </Widget>
  )
}

function Beneficiary360Skeleton() {
  return (
    <Widget title="Beneficiary 360">
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </Widget>
  )
}

export function Beneficiary360Widget({ beneficiaryId }: Props) {
  return (
    <WidgetErrorBoundary widgetTitle="Beneficiary 360">
      <Suspense fallback={<Beneficiary360Skeleton />}>
        <Beneficiary360Body beneficiaryId={beneficiaryId} />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
