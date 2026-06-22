import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { checkRole } from "@/lib/auth"
import { getBeneficiaryVoiceData } from "@/lib/queries/executive"
import { BeneficiaryVoiceClient } from "./beneficiary-voice-client"
import { resolveLocale } from "@/lib/i18n"

async function BeneficiaryVoiceBody() {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

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
      footer={isAr
        ? "موضوعات من تفاعلات المستفيد · وسّع لأمثلة مجهولة الهوية + التوجه"
        : "Themes from beneficiary interactions · expand for anonymized examples + trend"}
    >
      <BeneficiaryVoiceClient themes={themes} locale={locale} />
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
    <WidgetErrorBoundary widgetTitle="Beneficiary Voice">
      <Suspense fallback={<BeneficiaryVoiceSkeleton />}>
        <BeneficiaryVoiceBody />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
