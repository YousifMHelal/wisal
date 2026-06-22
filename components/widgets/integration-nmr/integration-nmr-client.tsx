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
              "flex flex-row items-center gap-2 rounded-lg border border-s-4 bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50",
              stateBg(row.state),
              isNmr ? "ring-1 ring-primary/30" : "",
            ].join(" ")}
          >
            {/* System name */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <StateIcon state={row.state} />
              <span className="font-medium text-sm text-foreground truncate">
                <span lang="en" className="[html[dir=rtl]_&]:hidden">{labels.label}</span>
                <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">{labels.labelAr}</span>
              </span>
              {isNmr && (
                <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30 gap-0.5 shrink-0">
                  <Zap className="size-2.5" aria-hidden="true" />
                  Live API
                </Badge>
              )}
            </div>

            {/* Status */}
            <StateLabel state={row.state} />

            {/* Pattern */}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 shrink-0">
              <RefreshCw className="size-2.5" aria-hidden="true" />
              {row.pattern}
            </Badge>

            {/* Latency */}
            <span className="text-xs tabular-nums shrink-0 text-muted-foreground w-16 text-end">
              {row.latencyMs != null ? (
                <span className={row.latencyMs > 300 ? "text-status-amber-fg" : ""}>
                  {row.latencyMs}ms
                </span>
              ) : "—"}
            </span>

            {/* Last sync */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 w-20 justify-end" title={row.lastSyncAt?.toISOString()}>
              <Clock className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {row.lastSyncAt ? formatDistanceToNow(row.lastSyncAt) : "—"}
              </span>
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
