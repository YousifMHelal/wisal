"use client"

import { useState, useTransition } from "react"
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import type { IncidentRow } from "@/lib/queries/live-operations"
import { acknowledgeIncident } from "@/lib/actions/incidents"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatDistanceToNow } from "date-fns"

interface Props {
  data: IncidentRow[]
  locale?: string
}

const SEVERITY_ICON: Record<string, React.ReactNode> = {
  CRITICAL: <AlertCircle className="size-4 text-status-red" aria-hidden />,
  WARNING: <AlertTriangle className="size-4 text-status-amber" aria-hidden />,
}

const SEVERITY_STATUS = {
  CRITICAL: "red" as const,
  WARNING: "amber" as const,
}

function TimeAgo({ date }: { date: Date }) {
  return (
    <span className="text-xs text-muted-foreground tabular">
      {formatDistanceToNow(date, { addSuffix: true })}
    </span>
  )
}

function TrendMiniChart({ trend, isAr }: { trend: { label: string; value: number }[]; isAr: boolean }) {
  if (!trend.length) {
    return (
      <p className="text-xs text-muted-foreground italic py-2">
        {isAr ? "لا توجد بيانات اتجاه." : "No trend data available."}
      </p>
    )
  }

  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trend} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 11,
              color: "var(--popover-foreground)",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--status-amber)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface IncidentItemProps {
  incident: IncidentRow
  isAr: boolean
}

function IncidentItem({ incident, isAr }: IncidentItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)

  const handleAcknowledge = () => {
    setError(null)
    const fd = new FormData()
    fd.set("incidentId", incident.id)
    startTransition(async () => {
      const result = await acknowledgeIncident(fd)
      if (result && "error" in result && result.error) {
        setError(result.error)
      } else {
        setAcknowledged(true)
      }
    })
  }

  const status = SEVERITY_STATUS[incident.severity] ?? "amber"

  return (
    <li
      className={cn(
        "rounded-lg border p-3 transition-colors duration-150",
        incident.severity === "CRITICAL"
          ? "border-(--status-red)/40 bg-status-red-bg"
          : "border-(--status-amber)/30 bg-status-amber-bg"
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className="shrink-0 mt-0.5">{SEVERITY_ICON[incident.severity]}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{incident.type}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{incident.description}</p>
            </div>
            <StatusBadge status={status} className="shrink-0" />
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {incident.clusterName && (
              <span className="text-xs text-muted-foreground">
                {isAr ? (incident.clusterNameAr ?? incident.clusterName) : incident.clusterName}
              </span>
            )}
            {incident.channelType && (
              <span className="text-xs text-muted-foreground">{incident.channelType.replace("_", " ")}</span>
            )}
            <TimeAgo date={incident.triggeredAt} />
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
              aria-expanded={expanded}
              aria-controls={`trend-${incident.id}`}
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded
                ? (isAr ? "إخفاء الاتجاه" : "Hide trend")
                : (isAr ? "عرض الاتجاه" : "View trend")}
            </button>

            {!acknowledged && !incident.acknowledgedAt && (
              <form action={handleAcknowledge} onSubmit={(e) => { e.preventDefault(); handleAcknowledge() }}>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  className="h-6 text-xs px-2 cursor-pointer"
                  aria-label={`Acknowledge incident: ${incident.type}`}
                >
                  {pending
                    ? (isAr ? "جارٍ الإقرار…" : "Acknowledging…")
                    : (isAr ? "إقرار" : "Acknowledge")}
                </Button>
              </form>
            )}

            {(acknowledged || incident.acknowledgedAt) && (
              <span className="text-xs text-status-green-fg">
                ✓ {isAr ? "تم الإقرار" : "Acknowledged"}
              </span>
            )}
          </div>

          {error && (
            <p className="text-xs text-destructive mt-1" role="alert">{error}</p>
          )}

          {expanded && (
            <div id={`trend-${incident.id}`} className="mt-3 border-t pt-3">
              <TrendMiniChart trend={incident.metricTrend} isAr={isAr} />
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export function ActiveIncidentsClient({ data, locale = "ar" }: Props) {
  const isAr = locale === "ar"

  if (!data.length) {
    return (
      <div className="flex items-center justify-center min-h-30">
        <p className="text-sm text-status-green-fg">
          ✓ {isAr ? "لا توجد حوادث نشطة" : "No active incidents"}
        </p>
      </div>
    )
  }

  const critical = data.filter((i) => i.severity === "CRITICAL")
  const warnings = data.filter((i) => i.severity === "WARNING")
  const sorted = [...critical, ...warnings]

  return (
    <ul
      className="space-y-2 max-h-128 overflow-y-auto pe-1"
      aria-label={isAr ? "الحوادث النشطة مرتبة حسب الخطورة" : "Active incidents sorted by severity"}
    >
      {sorted.map((inc) => (
        <IncidentItem key={inc.id} incident={inc} isAr={isAr} />
      ))}
    </ul>
  )
}
