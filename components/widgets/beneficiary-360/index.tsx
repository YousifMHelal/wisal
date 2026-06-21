import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { checkRole } from "@/lib/auth"
import { Beneficiary360Client } from "./beneficiary-360-client"

interface Props {
  beneficiaryId?: string
}

export async function Beneficiary360Widget({ beneficiaryId }: Props) {
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
