"use client"

import { CheckCircle, AlertTriangle, XCircle, Zap, RefreshCw, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import type { IntegrationRow } from "@/lib/queries/operations"

const SYSTEM_LABELS: Record<string, { label: string; labelAr: string }> = {
  NAFATH: { label: "Nafath", labelAr: "نفاذ" },
  MAWID: { label: "Mawid", labelAr: "موعد" },
  SEHHATY: { label: "Sehhaty", labelAr: "صحتي" },
  HR: { label: "HR System", labelAr: "نظام الموارد البشرية" },
  NMR: { label: "NMR Live", labelAr: "NMR مباشر" },
}

function StateIcon({ state }: { state: string }) {
  if (state === "UP") return <CheckCircle className="size-4 text-[var(--status-green-fg)]" aria-hidden="true" />
  if (state === "DEGRADED") return <AlertTriangle className="size-4 text-[var(--status-amber-fg)]" aria-hidden="true" />
  return <XCircle className="size-4 text-[var(--status-red-fg)]" aria-hidden="true" />
}

function StateLabel({ state }: { state: string }) {
  if (state === "UP") return <span className="text-[var(--status-green-fg)] font-medium text-xs">متصل</span>
  if (state === "DEGRADED") return <span className="text-[var(--status-amber-fg)] font-medium text-xs">متدهور</span>
  return <span className="text-[var(--status-red-fg)] font-medium text-xs">منقطع</span>
}

function stateBg(state: string) {
  if (state === "UP") return "border-s-[var(--status-green)]"
  if (state === "DEGRADED") return "border-s-[var(--status-amber)]"
  return "border-s-[var(--status-red)]"
}

interface Props {
  rows: IntegrationRow[]
}

export function IntegrationNmrClient({ rows }: Props) {
  const now = new Date()

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const isNmr = row.system === "NMR"
        const labels = SYSTEM_LABELS[row.system] ?? { label: row.system, labelAr: row.system }

        return (
          <div
            key={row.id}
            className={[
              "flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-s-4 bg-muted/30 p-3 transition-colors hover:bg-muted/50",
              stateBg(row.state),
              isNmr ? "ring-1 ring-primary/30" : "",
            ].join(" ")}
          >
            {/* System name */}
            <div className="flex items-center gap-2 min-w-0 sm:w-44 shrink-0">
              <div className="flex items-center gap-1.5">
                <StateIcon state={row.state} />
                <span className="font-medium text-sm text-foreground">
                  <span lang="en" className="[html[dir=rtl]_&]:hidden">{labels.label}</span>
                  <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">{labels.labelAr}</span>
                </span>
              </div>
              {isNmr && (
                <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30 gap-0.5 shrink-0">
                  <Zap className="size-2.5" aria-hidden="true" />
                  Live API
                </Badge>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5 sm:w-24 shrink-0">
              <StateLabel state={row.state} />
            </div>

            {/* Pattern */}
            <div className="sm:w-20 shrink-0">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                <RefreshCw className="size-2.5" aria-hidden="true" />
                {row.pattern}
              </Badge>
            </div>

            {/* Latency */}
            <div className="text-xs text-muted-foreground sm:w-24 shrink-0">
              {row.latencyMs != null ? (
                <span>
                  <span className={row.latencyMs > 300 ? "text-[var(--status-amber-fg)]" : "text-foreground"}>
                    {row.latencyMs}ms
                  </span>
                  {" زمن استجابة"}
                </span>
              ) : (
                "—"
              )}
            </div>

            {/* Last sync */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground ms-auto">
              <Clock className="size-3 shrink-0" aria-hidden="true" />
              {row.lastSyncAt ? (
                <span title={row.lastSyncAt.toISOString()}>
                  {formatDistanceToNow(row.lastSyncAt, { addSuffix: true })}
                </span>
              ) : (
                <span>لم يتزامن مطلقًا</span>
              )}
            </div>
          </div>
        )
      })}

      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات تكامل متاحة.</p>
      )}

      <p className="text-xs text-muted-foreground text-end">
        تحديث {formatDistanceToNow(now, { addSuffix: true })} · لا اتصالات مباشرة بين الأنظمة
      </p>
    </div>
  )
}
