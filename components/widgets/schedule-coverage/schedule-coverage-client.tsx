"use client"

import { useTransition, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, Users } from "lucide-react"
import { format } from "date-fns"
import { resolveShiftSwap } from "@/lib/actions/workforce"
import type { HourSlot, ShiftSwapRow } from "@/lib/queries/workforce"

function hourLabel(h: number): string {
  const ampm = h < 12 ? "ص" : "م"
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}${ampm}`
}

interface CoverageBarProps {
  slot: HourSlot
  showLabel: boolean
}

function CoverageBar({ slot, showLabel }: CoverageBarProps) {
  if (slot.forecastDemand === 0) {
    return (
      <div className="flex flex-col items-end gap-1 flex-1 min-w-0">
        <div className="w-full bg-muted/10 rounded-sm" style={{ height: 68 }} />
        <span className="h-3" />
      </div>
    )
  }

  const pct = Math.min((slot.staffed / slot.forecastDemand) * 100, 100)
  const isOver = slot.staffed > slot.forecastDemand
  const isUnder = slot.staffed < slot.forecastDemand * 0.85

  const barColor = isOver
    ? "bg-[var(--status-green)]"
    : isUnder
    ? "bg-[var(--status-red)]"
    : "bg-[var(--status-amber)]"

  const label = `${hourLabel(slot.hour)}: ${slot.staffed}/${slot.forecastDemand}`

  return (
    <div className="flex flex-col items-end gap-1 flex-1 min-w-0 group" title={label}>
      <div className="w-full bg-muted/10 rounded-sm overflow-hidden flex flex-col justify-end" style={{ height: 68 }}>
        <div
          className={`w-full ${barColor} rounded-sm transition-all duration-300 group-hover:brightness-110`}
          style={{ height: `${pct}%` }}
        />
      </div>
      <span className="text-[9px] text-muted-foreground tabular-nums leading-none h-3 flex items-center self-center">
        {showLabel ? hourLabel(slot.hour) : ""}
      </span>
    </div>
  )
}

interface SwapCardProps {
  swap: ShiftSwapRow
}

function SwapCard({ swap }: SwapCardProps) {
  const [isPending, startTransition] = useTransition()
  const [resolved, setResolved] = useState<"APPROVE" | "REJECT" | null>(null)

  function handleAction(action: "APPROVE" | "REJECT") {
    startTransition(async () => {
      const fd = new FormData()
      fd.set("swapId", swap.id)
      fd.set("action", action)
      const result = await resolveShiftSwap(fd)
      if (result.success) setResolved(action)
    })
  }

  if (resolved) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        {resolved === "APPROVE"
          ? <Check className="size-3.5 text-[var(--status-green-fg)]" />
          : <X className="size-3.5 text-[var(--status-red-fg)]" />
        }
        <span>{swap.agentName} — تبديل {resolved === "APPROVE" ? "موافق عليه" : "مرفوض"}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Users className="size-4 text-muted-foreground shrink-0" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{swap.agentName}</p>
          <p className="text-xs text-muted-foreground">
            <Clock className="inline size-3 me-1" aria-hidden />
            {format(swap.fromShift, "dd MMM HH:mm")} → {format(swap.toShift, "dd MMM HH:mm")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleAction("REJECT")}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-[var(--status-red)] text-xs font-medium text-[var(--status-red-fg)] bg-[var(--status-red-bg)] hover:bg-[var(--status-red)]/20 transition-colors duration-150 cursor-pointer disabled:opacity-50"
          aria-label={`رفض تبديل ${swap.agentName}`}
        >
          <X className="size-3" aria-hidden />
          رفض
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleAction("APPROVE")}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-[var(--status-green)] text-xs font-medium text-[var(--status-green-fg)] bg-[var(--status-green-bg)] hover:bg-[var(--status-green)]/20 transition-colors duration-150 cursor-pointer disabled:opacity-50"
          aria-label={`الموافقة على تبديل ${swap.agentName}`}
        >
          <Check className="size-3" aria-hidden />
          موافقة
        </button>
      </div>
    </div>
  )
}

interface Props {
  slots: HourSlot[]
  swaps: ShiftSwapRow[]
}

export function ScheduleCoverageClient({ slots, swaps }: Props) {
  const [view, setView] = useState<"day" | "peak">("day")

  const displaySlots = view === "peak"
    ? slots.filter((s) => s.hour >= 7 && s.hour <= 22)
    : slots

  const totalForecast = slots.reduce((s, h) => s + h.forecastDemand, 0)
  const totalStaffed = slots.reduce((s, h) => s + h.staffed, 0)
  const coveragePct = totalForecast > 0 ? ((totalStaffed / totalForecast) * 100).toFixed(0) : "—"

  return (
    <div className="flex flex-col gap-4">
      {/* Summary + toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <div>
            <p className="text-[11px] text-muted-foreground">التغطية</p>
            <p className="text-xl font-bold tabular-nums text-foreground leading-tight">{coveragePct}%</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">الموظفون</p>
            <p className="text-xl font-bold tabular-nums text-foreground leading-tight">{totalStaffed}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">التوقع</p>
            <p className="text-xl font-bold tabular-nums text-muted-foreground leading-tight">{totalForecast}</p>
          </div>
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden text-xs">
          {(["day", "peak"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`px-3 py-1.5 transition-colors duration-150 cursor-pointer ${
                view === v
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {v === "day" ? "٢٤ ساعة" : "ذروة (٧–٢٢)"}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-green inline-block" />
          فائض توظيف
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-amber inline-block" />
          في الهدف
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-red inline-block" />
          نقص توظيف
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-px">
        {displaySlots.map((slot, i) => (
          <CoverageBar
            key={slot.hour}
            slot={slot}
            showLabel={slot.hour % 4 === 0}
          />
        ))}
      </div>

      {/* Shift swap requests */}
      {swaps.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              طلبات تبديل الوردية المعلقة
            </h3>
            <Badge variant="outline" className="text-xs">
              {swaps.length}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {swaps.map((swap) => (
              <SwapCard key={swap.id} swap={swap} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
