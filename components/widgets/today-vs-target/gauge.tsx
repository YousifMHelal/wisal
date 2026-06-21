"use client"

import { useState } from "react"
import type { KpiStatus } from "@/lib/kpi"
import { StatusBadge } from "@/components/ui/status-badge"
import { cn } from "@/lib/utils"

const STATUS_COLOR: Record<KpiStatus, string> = {
  green: "var(--status-green)",
  amber: "var(--status-amber)",
  red: "var(--status-red)",
}

// Arc SVG gauge: 0-100 normalised value, arc from 135° to 405° (270° sweep)
function ArcGauge({
  value,
  max,
  status,
  size = 80,
}: {
  value: number
  max: number
  status: KpiStatus
  size?: number
}) {
  const pct = Math.min(Math.max(value / max, 0), 1)
  const r = (size - 10) / 2
  const cx = size / 2
  const cy = size / 2
  const startAngle = 135
  const sweepAngle = 270
  const angle = startAngle + sweepAngle * pct

  function polarToXY(deg: number, radius: number) {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  const trackStart = polarToXY(startAngle, r)
  const trackEnd = polarToXY(startAngle + sweepAngle - 0.01, r)
  const fillEnd = polarToXY(angle, r)
  const largeArcFlag = sweepAngle * pct > 180 ? 1 : 0
  const largeArcTrack = sweepAngle > 180 ? 1 : 0

  const color = STATUS_COLOR[status]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {/* Track */}
      <path
        d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeArcTrack} 1 ${trackEnd.x} ${trackEnd.y}`}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Fill */}
      {pct > 0 && (
        <path
          d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${fillEnd.x} ${fillEnd.y}`}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

interface SubGaugeProps {
  label: string
  labelAr?: string
  value: number
  target: number
  unit: string
  status: KpiStatus
  active: boolean
  onClick: () => void
}

export function SubGauge({
  label,
  labelAr,
  value,
  target,
  unit,
  status,
  active,
  onClick,
}: SubGaugeProps) {
  const displayValue =
    unit === "s" && value >= 60
      ? `${(value / 60).toFixed(1)}m`
      : unit === "s"
      ? `${Math.round(value)}s`
      : `${value.toFixed(1)}${unit}`

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-150 cursor-pointer",
        "hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "border-primary bg-accent" : "border-border bg-card"
      )}
      aria-pressed={active}
      aria-label={`${label}: ${displayValue}, status: ${status}`}
    >
      <div className="relative">
        <ArcGauge value={value} max={target * 1.5} status={status} size={72} />
        <div className="absolute inset-0 flex items-center justify-center">
          <StatusBadge status={status} dot />
        </div>
      </div>
      <span className="text-lg font-semibold tabular text-foreground leading-none">{displayValue}</span>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
      <span className="text-xs text-muted-foreground tabular">
        الهدف: {unit === "s" && target >= 60 ? `${(target / 60).toFixed(1)}د` : `${target}${unit}`}
      </span>
    </button>
  )
}

interface CompositeGaugeProps {
  serviceLevel: { value: number; status: KpiStatus }
  abandonedCalls: { value: number; status: KpiStatus }
  aht: { value: number; status: KpiStatus }
  fcr: { value: number; status: KpiStatus }
}

function worstStatus(statuses: KpiStatus[]): KpiStatus {
  if (statuses.includes("red")) return "red"
  if (statuses.includes("amber")) return "amber"
  return "green"
}

const SUB_GAUGE_CONFIG = [
  { key: "serviceLevel" as const, label: "مستوى الخدمة", labelAr: "مستوى الخدمة", target: 80, unit: "%" },
  { key: "abandonedCalls" as const, label: "المكالمات المتروكة", labelAr: "متروكة", target: 5, unit: "%" },
  { key: "aht" as const, label: "متوسط وقت المعالجة", labelAr: "وقت المعالجة", target: 300, unit: "s" },
  { key: "fcr" as const, label: "الحل من أول تواصل", labelAr: "الحل الأول", target: 90, unit: "%" },
]

export function CompositeGauge({ serviceLevel, abandonedCalls, aht, fcr }: CompositeGaugeProps) {
  const [active, setActive] = useState<string | null>(null)

  const data = { serviceLevel, abandonedCalls, aht, fcr }
  const overall = worstStatus([serviceLevel.status, abandonedCalls.status, aht.status, fcr.status])

  const overallPct =
    overall === "green" ? 100 : overall === "amber" ? 70 : 40

  return (
    <div className="space-y-4">
      {/* Hero composite arc */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <ArcGauge value={overallPct} max={100} status={overall} size={120} />
          <div className="absolute inset-0 flex items-center justify-center">
            <StatusBadge status={overall} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">الأداء الكلي اليوم</p>
      </div>

      {/* Sub-gauges grid — 2 cols mobile, 4 desktop */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SUB_GAUGE_CONFIG.map((cfg) => {
          const kpiData = data[cfg.key]
          return (
            <SubGauge
              key={cfg.key}
              label={cfg.label}
              labelAr={cfg.labelAr}
              value={kpiData.value}
              target={cfg.target}
              unit={cfg.unit}
              status={kpiData.status}
              active={active === cfg.key}
              onClick={() => setActive((prev) => (prev === cfg.key ? null : cfg.key))}
            />
          )
        })}
      </div>
    </div>
  )
}
