"use client"

import { useRouter } from "next/navigation"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { status as deriveStatus, KPI_TARGETS, type KpiKey } from "@/lib/kpi"
import type { KpiScorecardRow } from "@/lib/queries/executive"
import { cn } from "@/lib/utils"

const MODULE_ROUTES: Record<string, string> = {
  "live-operations": "/live-operations",
  intelligence: "/intelligence",
  governance: "/governance",
  workforce: "/workforce",
  executive: "/executive",
}

const KPI_LABELS: Record<string, { label: string; labelAr: string; unit: string }> = {
  SERVICE_LEVEL: { label: "Service Level", labelAr: "مستوى الخدمة", unit: "%" },
  ABANDONED_CALLS: { label: "Abandoned Calls", labelAr: "مكالمات متروكة", unit: "%" },
  AHT: { label: "Avg Handle Time", labelAr: "متوسط وقت المعالجة", unit: "s" },
  ASA: { label: "Avg Speed of Answer", labelAr: "متوسط سرعة الرد", unit: "s" },
  FCR: { label: "First Contact Res.", labelAr: "الحل من أول اتصال", unit: "%" },
  CSAT: { label: "Customer Satisfaction", labelAr: "رضا العملاء", unit: "%" },
  AI_COMPLETION_RATE: { label: "AI Completion", labelAr: "إتمام الذكاء الاصطناعي", unit: "%" },
}

function formatValue(metric: string, value: number): string {
  const cfg = KPI_TARGETS[metric as KpiKey]
  if (!cfg) return value.toFixed(1)
  if (cfg.unit === "s") {
    if (value >= 60) return `${(value / 60).toFixed(1)}m`
    return `${value.toFixed(0)}s`
  }
  if (cfg.unit === "%") return `${value.toFixed(1)}%`
  return value.toFixed(1)
}

function DeltaIcon({ thisWeek, lastWeek, metric }: { thisWeek: number; lastWeek: number; metric: string }) {
  const cfg = KPI_TARGETS[metric as KpiKey]
  const diff = thisWeek - lastWeek
  if (Math.abs(diff) < 0.01) return <Minus className="size-3.5 text-muted-foreground" />
  const isImprovement = cfg?.higherIsBetter ? diff > 0 : diff < 0
  if (isImprovement) return <TrendingUp className="size-3.5 text-[var(--status-green-fg)]" />
  return <TrendingDown className="size-3.5 text-[var(--status-red-fg)]" />
}

interface Props {
  rows: KpiScorecardRow[]
}

export function KpiScorecardClient({ rows }: Props) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {rows.map((row) => {
        const kpiKey = row.metric as KpiKey
        const kpiStatus = deriveStatus(kpiKey, row.thisWeek)
        const meta = KPI_LABELS[row.metric] ?? { label: row.metric, labelAr: row.metric, unit: "" }
        const route = MODULE_ROUTES[row.ownerModule] ?? `/${row.ownerModule}`
        const diff = row.thisWeek - row.lastWeek
        const cfg = KPI_TARGETS[kpiKey]

        return (
          <button
            key={row.id}
            onClick={() => router.push(route)}
            className={cn(
              "group relative rounded-xl border bg-card p-4 text-start transition-all duration-150",
              "hover:shadow-md hover:border-primary/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "flex flex-col gap-2 min-h-[112px]"
            )}
            aria-label={`${meta.label}: ${formatValue(row.metric, row.thisWeek)}, navigate to ${row.ownerModule}`}
          >
            {/* title */}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
              <span className="[html[dir=rtl]_&]:hidden">{meta.label}</span>
              <span className="hidden [html[dir=rtl]_&]:inline">{meta.labelAr}</span>
            </p>

            {/* hero metric */}
            <p className="text-3xl font-semibold tabular-nums text-foreground leading-none">
              {formatValue(row.metric, row.thisWeek)}
            </p>

            {/* status + delta row */}
            <div className="flex items-center justify-between gap-2 mt-auto">
              <StatusBadge status={kpiStatus} />
              <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                <DeltaIcon thisWeek={row.thisWeek} lastWeek={row.lastWeek} metric={row.metric} />
                <span>
                  {cfg?.higherIsBetter
                    ? diff >= 0
                      ? `+${Math.abs(diff).toFixed(1)}${meta.unit}`
                      : `-${Math.abs(diff).toFixed(1)}${meta.unit}`
                    : diff <= 0
                    ? `−${Math.abs(diff).toFixed(1)}${meta.unit}`
                    : `+${Math.abs(diff).toFixed(1)}${meta.unit}`}
                </span>
              </div>
            </div>

            {/* target label */}
            <p className="text-[10px] text-muted-foreground tabular-nums">
              Target: {formatValue(row.metric, row.target)} · Last week: {formatValue(row.metric, row.lastWeek)}
            </p>
          </button>
        )
      })}
    </div>
  )
}
