import { Suspense } from "react"
import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getBeneficiaryVoiceData } from "@/lib/queries/executive"
import { BeneficiaryVoiceClient } from "./beneficiary-voice-client"

async function BeneficiaryVoiceBody() {
  const allowed = await checkRole("EXECUTIVE")
  if (!allowed) {
    return (
      <Widget title="Beneficiary Voice" titleAr="صوت المستفيد">
        <WidgetLocked requiredRole="EXECUTIVE" />
      </Widget>
    )
  }

  const themes = await getBeneficiaryVoiceData()

  return (
    <Widget
      title="Beneficiary Voice"
      titleAr="صوت المستفيد"
      footer="Plain-language themes from beneficiary interactions · expand for anonymized examples + trend"
    >
      <BeneficiaryVoiceClient themes={themes} />
    </Widget>
  )
}

function BeneficiaryVoiceSkeleton() {
  return (
    <Widget title="Beneficiary Voice">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </Widget>
  )
}

export function BeneficiaryVoiceWidget() {
  return (
    <Suspense fallback={<BeneficiaryVoiceSkeleton />}>
      <BeneficiaryVoiceBody />
    </Suspense>
  )
}
