import { Suspense } from "react"
import { cookies } from "next/headers"
import { Widget, WidgetSkeleton, WidgetLocked } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { getKillSwitchData } from "@/lib/queries/intelligence"
import { checkRole } from "@/lib/auth"
import { KillSwitchClient } from "./kill-switch-client"
import { resolveLocale } from "@/lib/i18n"
import { Skeleton } from "@/components/ui/skeleton"

async function KillSwitchBody() {
  const jar = await cookies()
  const locale = resolveLocale(jar.get("locale")?.value)
  const isAr = locale === "ar"

  const allowed = await checkRole("PLATFORM_ADMIN")

  if (!allowed) {
    return (
      <Widget title="Kill Switch" titleAr="مفتاح الإيقاف الطارئ">
        <WidgetLocked requiredRole="PLATFORM_ADMIN" />
      </Widget>
    )
  }

  const killSwitch = await getKillSwitchData()

  if (!killSwitch) {
    return (
      <Widget title="Kill Switch" titleAr="مفتاح الإيقاف الطارئ">
        <div className="flex items-center justify-center min-h-30">
          <p className="text-sm text-muted-foreground">
            {isAr ? "لم تتم تهيئة سجل مفتاح الإيقاف." : "Kill switch record not initialised."}
          </p>
        </div>
      </Widget>
    )
  }

  const updatedStr = killSwitch.updatedAt.toLocaleString(isAr ? "ar-SA" : "en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  })

  return (
    <Widget
      title="Kill Switch"
      titleAr="مفتاح الإيقاف الطارئ"
      actions={
        <span className="text-xs text-muted-foreground">
          {isAr ? "مسؤول النظام فقط" : "Platform Admin only"}
        </span>
      }
      footer={isAr ? `آخر تحديث: ${updatedStr}` : `Last updated: ${updatedStr}`}
    >
      <KillSwitchClient killSwitch={killSwitch} locale={locale} />
    </Widget>
  )
}

function KillSwitchSkeleton() {
  return (
    <Widget title="Kill Switch">
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
    </Widget>
  )
}

export function KillSwitchWidget() {
  return (
    <WidgetErrorBoundary widgetTitle="Kill Switch">
      <Suspense fallback={<KillSwitchSkeleton />}>
        <KillSwitchBody />
      </Suspense>
    </WidgetErrorBoundary>
  )
}
