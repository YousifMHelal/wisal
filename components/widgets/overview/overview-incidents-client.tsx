"use client"

import { AlertCircle, AlertTriangle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { IncidentRow } from "@/lib/queries/live-operations"
import { formatDistanceToNow } from "date-fns"

interface Props {
  incidents: IncidentRow[]
}

export function OverviewIncidentsMini({ incidents }: Props) {
  const critical = incidents.filter((i) => i.severity === "CRITICAL")
  const warning = incidents.filter((i) => i.severity === "WARNING")
  const top5 = incidents.slice(0, 5)

  if (!incidents.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
        <AlertCircle className="size-8 opacity-30" />
        <p className="text-sm">
          <span lang="en" className="[html[dir=rtl]_&]:hidden">No active incidents</span>
          <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">لا حوادث نشطة</span>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Severity summary */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-status-red-bg px-3 py-2 flex-1">
          <AlertCircle className="size-4 text-status-red-fg shrink-0" />
          <div>
            <p className="text-lg font-semibold tabular-nums text-status-red-fg leading-none">
              {critical.length}
            </p>
            <p className="text-[10px] text-status-red-fg/70">
              <span lang="en" className="[html[dir=rtl]_&]:hidden">Critical</span>
              <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">حرج</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-status-amber-bg px-3 py-2 flex-1">
          <AlertTriangle className="size-4 text-status-amber-fg shrink-0" />
          <div>
            <p className="text-lg font-semibold tabular-nums text-status-amber-fg leading-none">
              {warning.length}
            </p>
            <p className="text-[10px] text-status-amber-fg/70">
              <span lang="en" className="[html[dir=rtl]_&]:hidden">Warning</span>
              <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">تحذير</span>
            </p>
          </div>
        </div>
      </div>

      {/* Latest incidents list */}
      <div className="space-y-1.5">
        {top5.map((inc) => (
          <div
            key={inc.id}
            className={cn(
              "flex items-start gap-2.5 rounded-lg px-3 py-2 border-s-2",
              inc.severity === "CRITICAL"
                ? "border-s-status-red bg-status-red-bg/40"
                : "border-s-status-amber bg-status-amber-bg/40",
            )}
          >
            {inc.severity === "CRITICAL" ? (
              <AlertCircle className="size-3.5 text-status-red-fg shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="size-3.5 text-status-amber-fg shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">{inc.type}</p>
              {inc.clusterName && (
                <p className="text-[10px] text-muted-foreground truncate">
                  <span className="[html[dir=rtl]_&]:hidden">{inc.clusterName}</span>
                  <span className="hidden [html[dir=rtl]_&]:inline">{inc.clusterNameAr ?? inc.clusterName}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
              <Clock className="size-3" />
              <span className="text-[10px] tabular-nums">
                {formatDistanceToNow(new Date(inc.triggeredAt), { addSuffix: false })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
