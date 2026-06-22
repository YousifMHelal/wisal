"use client"

import { useState, useTransition } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { AlertTriangle, UserCheck } from "lucide-react"
import { WidgetEmpty } from "@/components/widgets/widget"
import { assignDriftAlert } from "@/lib/actions/intelligence"
import type { DriftWatchData } from "@/lib/queries/intelligence"

interface AssignableUser {
  id: string
  name: string
  role: string
}

interface Props {
  data: DriftWatchData
  assignableUsers: AssignableUser[]
  locale?: string
}

const LINE_COLORS = [
  "var(--primary)",
  "var(--status-amber)",
  "var(--status-green)",
  "#a78bfa",
  "#60a5fa",
  "#f472b6",
  "#34d399",
  "#fb923c",
]

export function DriftWatchClient({ data, assignableUsers, locale = "ar" }: Props) {
  const isAr = locale === "ar"
  const [highlightedSeries, setHighlightedSeries] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [assigneeId, setAssigneeId] = useState("")
  const [isPending, startTransition] = useTransition()
  const [assignResult, setAssignResult] = useState<Record<string, "success" | "error">>({})

  const { series, alerts } = data

  if (!series.length) return <WidgetEmpty message="No drift data for this period." messageAr="لا توجد بيانات انحراف لهذه الفترة." />

  // Build flat chart data — all series share same date axis
  const allDates = Array.from(
    new Set(series.flatMap((s) => s.points.map((p) => p.date)))
  ).sort()

  const chartData = allDates.map((date) => {
    const row: Record<string, string | number> = { date }
    for (const s of series.slice(0, 8)) {
      const point = s.points.find((p) => p.date === date)
      row[s.id] = point?.nluConfidence ?? NaN
    }
    return row
  })

  function handleAlertClick(clusterId: string, dialectEn: string) {
    // series id = "clusterId::dialectEn" (raw DB dialect value)
    const seriesKey = `${clusterId}::${dialectEn}`
    setHighlightedSeries((prev) => (prev === seriesKey ? null : seriesKey))
  }

  function handleAssign(alertId: string) {
    if (!assigneeId) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set("driftSnapshotId", alertId)
      fd.set("assigneeUserId", assigneeId)
      const result = await assignDriftAlert(fd)
      setAssignResult((prev) => ({
        ...prev,
        [alertId]: result.success ? "success" : "error",
      }))
      setAssigningId(null)
      setAssigneeId("")
    })
  }

  const visibleSeries = series.slice(0, 8)

  return (
    <div className="space-y-4">
      {/* Multi-line NLU confidence chart */}
      <div className="h-52 md:h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              domain={[0, 1]}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(v, key) => {
                const s = series.find((s) => s.id === (key as string))
                const lbl = isAr ? s?.label : s?.labelEn
                return [`${((v as number) * 100).toFixed(1)}%`, lbl ?? (key as string)]
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10 }}
              formatter={(value) => {
                const s = series.find((s) => s.id === value)
                return (isAr ? s?.label : s?.labelEn) ?? value
              }}
              onClick={(e) =>
                setHighlightedSeries((prev) =>
                  prev === e.dataKey ? null : (e.dataKey as string)
                )
              }
            />
            {visibleSeries.map((s, i) => (
              <Line
                key={s.id}
                type="monotone"
                dataKey={s.id}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={highlightedSeries === null || highlightedSeries === s.id ? 2 : 1}
                strokeOpacity={
                  highlightedSeries === null || highlightedSeries === s.id ? 1 : 0.25
                }
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alert list */}
      {alerts.length > 0 && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <AlertTriangle className="size-3.5 text-[var(--status-amber-fg)]" aria-hidden />
            {isAr ? `تنبيهات مُعلَّمة (${alerts.length})` : `Flagged alerts (${alerts.length})`}
          </div>

          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {alerts.map((alert) => {
              const isAssigning = assigningId === alert.id
              const result = assignResult[alert.id]

              return (
                <div
                  key={alert.id}
                  className={[
                    "rounded-lg border p-2.5 cursor-pointer transition-all duration-150",
                    highlightedSeries === `${alert.clusterId}::${alert.dialectEn}`
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] hover:border-[var(--status-amber)] hover:bg-[var(--status-amber-bg)]",
                  ].join(" ")}
                  onClick={() => handleAlertClick(alert.clusterId, alert.dialectEn)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleAlertClick(alert.clusterId, alert.dialectEn)
                  }}
                  aria-label={`Drift alert: ${alert.clusterNameEn} ${alert.dialectEn}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-medium text-foreground">
                          {isAr ? alert.clusterName : alert.clusterNameEn}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{isAr ? alert.dialect : alert.dialectEn}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs tabular-nums text-[var(--status-amber-fg)]">
                          NLU: {(alert.nluConfidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      {alert.message && (
                        <p className="text-xs text-muted-foreground truncate max-w-[260px]">
                          {alert.message}
                        </p>
                      )}
                    </div>

                    {/* Assign button */}
                    {assignableUsers.length > 0 && !result && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setAssigningId(isAssigning ? null : alert.id)
                        }}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex-shrink-0"
                        aria-label={isAr ? "تكليف تنبيه" : "Assign alert"}
                      >
                        <UserCheck className="size-3.5" aria-hidden />
                        {isAr ? "تكليف" : "Assign"}
                      </button>
                    )}
                    {result === "success" && (
                      <span className="text-xs text-[var(--status-green-fg)]">{isAr ? "تم التكليف ✓" : "Assigned ✓"}</span>
                    )}
                    {result === "error" && (
                      <span className="text-xs text-[var(--status-red-fg)]">{isAr ? "فشل" : "Failed"}</span>
                    )}
                  </div>

                  {/* Inline assign panel */}
                  {isAssigning && assignableUsers.length > 0 && (
                    <div
                      className="mt-2 flex gap-2 items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                        className="flex-1 rounded border bg-transparent text-xs px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                        aria-label="Select assignee"
                      >
                        <option value="">{isAr ? "اختر عضواً…" : "Select a member…"}</option>
                        {assignableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={!assigneeId || isPending}
                        onClick={() => handleAssign(alert.id)}
                        className="rounded px-2 py-1 text-xs bg-[var(--primary)] text-[var(--primary-foreground)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-opacity"
                      >
                        {isPending ? "…" : (isAr ? "تكليف" : "Assign")}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
