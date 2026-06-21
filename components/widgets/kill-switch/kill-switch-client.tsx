"use client"

import { useState, useTransition } from "react"
import { Zap, ZapOff, ShieldAlert, Clock } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { toggleKillSwitch } from "@/lib/actions/intelligence"
import type { KillSwitchData } from "@/lib/queries/intelligence"

interface Props {
  killSwitch: KillSwitchData
}

const CONFIRM_PHRASE = "ACTIVATE KILL SWITCH"

export function KillSwitchClient({ killSwitch }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isActive = killSwitch.state === "ACTIVE"
  const targetState = isActive ? "ARMED" : "ACTIVE"

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set("killSwitchId", killSwitch.id)
      fd.set("targetState", targetState)
      fd.set("scope", killSwitch.scope)
      if (killSwitch.scopeRef) fd.set("scopeRef", killSwitch.scopeRef)
      fd.set("confirmText", confirmText)
      const result = await toggleKillSwitch(fd)
      if (result.success) {
        setShowConfirm(false)
        setConfirmText("")
      } else {
        setError(result.error ?? "Unknown error.")
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div
        className={[
          "rounded-lg border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3",
          isActive
            ? "border-[var(--status-red)] bg-[var(--status-red-bg)]"
            : "border-[var(--status-green)] bg-[var(--status-green-bg)]",
        ].join(" ")}
      >
        <div
          className={[
            "size-10 rounded-full flex items-center justify-center flex-shrink-0",
            isActive ? "bg-[var(--status-red)]" : "bg-[var(--status-green)]",
          ].join(" ")}
        >
          {isActive ? (
            <Zap className="size-5 text-white" aria-hidden />
          ) : (
            <ZapOff className="size-5 text-white" aria-hidden />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={[
                "text-base font-semibold",
                isActive ? "text-[var(--status-red-fg)]" : "text-[var(--status-green-fg)]",
              ].join(" ")}
            >
              {isActive ? "مفتاح الإيقاف الطارئ مفعّل" : "النظام في وضع الاستعداد"}
            </span>
            <StatusBadge status={isActive ? "red" : "green"} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
            <span>النطاق: {killSwitch.scope}</span>
            {killSwitch.scopeRef && <span>المرجع: {killSwitch.scopeRef}</span>}
            {killSwitch.lastTriggeredAt && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" aria-hidden />
                آخر تفعيل:{" "}
                {killSwitch.lastTriggeredAt.toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Control button */}
      {!showConfirm ? (
        <button
          onClick={() => {
            setError(null)
            setShowConfirm(true)
          }}
          className={[
            "w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer border-2",
            isActive
              ? "border-[var(--status-green)] text-[var(--status-green-fg)] hover:bg-[var(--status-green-bg)]"
              : "border-[var(--status-red)] text-[var(--status-red-fg)] hover:bg-[var(--status-red-bg)]",
          ].join(" ")}
          aria-label={isActive ? "Disarm kill switch" : "Activate kill switch"}
        >
          <ShieldAlert className="size-4" aria-hidden />
          {isActive ? "تعطيل مفتاح الإيقاف" : "تفعيل مفتاح الإيقاف الطارئ"}
        </button>
      ) : (
        /* Confirmation step — deliberately heavy */
        <div className="rounded-lg border border-[var(--status-red)] bg-[var(--status-red-bg)] p-4 space-y-3">
          <div className="flex items-start gap-2">
            <ShieldAlert
              className="size-5 text-[var(--status-red-fg)] flex-shrink-0 mt-0.5"
              aria-hidden
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--status-red-fg)]">
                {isActive ? "تأكيد: تعطيل مفتاح الإيقاف" : "تأكيد: تفعيل مفتاح الإيقاف الطارئ"}
              </p>
              {!isActive && (
                <p className="text-xs text-muted-foreground">
                  سيؤدي هذا إلى إيقاف جميع تفاعلات الذكاء الاصطناعي فوراً. يبقى الموظفون البشريون نشطين. هذا الإجراء مُدقَّق ولا يمكن التراجع عنه دون إعادة التهيئة.
                </p>
              )}
            </div>
          </div>

          {/* Typed confirmation — only required for activation */}
          {!isActive && (
            <div className="space-y-1.5">
              <label
                htmlFor="kill-switch-confirm"
                className="text-xs text-muted-foreground"
              >
                اكتب{" "}
                <code className="font-mono font-semibold text-foreground">
                  {CONFIRM_PHRASE}
                </code>{" "}
                للتأكيد:
              </label>
              <input
                id="kill-switch-confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                className="w-full rounded border bg-transparent px-3 py-1.5 text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--status-red)]"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          )}

          {error && <p className="text-xs text-[var(--status-red-fg)]">{error}</p>}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSubmit}
              disabled={
                isPending || (!isActive && confirmText !== CONFIRM_PHRASE)
              }
              className={[
                "flex-1 sm:flex-none rounded-md px-4 py-2 text-sm font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                isActive
                  ? "bg-[var(--status-green)] text-white hover:opacity-90"
                  : "bg-[var(--status-red)] text-white hover:opacity-90",
              ].join(" ")}
            >
              {isPending
                ? "جارٍ المعالجة…"
                : isActive
                ? "تأكيد التعطيل"
                : "تأكيد التفعيل"}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false)
                setConfirmText("")
                setError(null)
              }}
              className="flex-1 sm:flex-none rounded-md border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        كل تغيير في الحالة يُسجَّل في سجل تدقيق غير قابل للتعديل.
      </p>
    </div>
  )
}
