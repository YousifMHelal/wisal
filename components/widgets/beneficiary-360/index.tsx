import { Suspense } from "react"
import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { Beneficiary360Client } from "./beneficiary-360-client"

interface Props {
  beneficiaryId?: string
}

async function Beneficiary360Body({ beneficiaryId }: Props) {
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
      footer="Search by national ID (Iqama) or name · Cross-channel interaction history · Active tickets"
    >
      <Beneficiary360Client initialBeneficiaryId={beneficiaryId} />
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
