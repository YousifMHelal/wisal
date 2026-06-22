"use client"

import { useState, useTransition } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
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

// Custom Y-axis tick — uses foreignObject to get real HTML RTL rendering
function RtlYTick({
  x, y, payload, width, isAr,
}: {
  x?: number
  y?: number
  payload?: { value: string }
  width?: number
  isAr: boolean
}) {
  if (x === undefined || y === undefined || !payload) return null
  const raw = payload.value ?? ""
  const truncated = raw.length > 24 ? raw.slice(0, 23) + "…" : raw
  const foWidth = width ?? 160
  const foX = isAr ? x - foWidth : x - foWidth
  return (
    <foreignObject x={foX} y={y - 10} width={foWidth} height={20}>
      <div
        // @ts-expect-error xmlns required for foreignObject
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          fontSize: 10,
          color: "var(--muted-foreground)",
          direction: isAr ? "rtl" : "ltr",
          textAlign: isAr ? "right" : "right",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: "20px",
          width: "100%",
        }}
        title={raw}
      >
        {truncated}
      </div>
    </foreignObject>
  )
}

export function DriftWatchClient({ data, assignableUsers, locale = "ar" }: Props) {
  const isAr = locale === "ar"
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [assigneeId, setAssigneeId] = useState("")
  const [isPending, startTransition] = useTransition()
  const [assignResult, setAssignResult] = useState<Record<string, "success" | "error">>({})

  const { series, alerts } = data

  if (!series.length) return <WidgetEmpty message="No drift data for this period." messageAr="لا توجد بيانات انحراف لهذه الفترة." />

  const chartData = [...series]
    .sort((a, b) => a.latestNlu - b.latestNlu)
    .map((s) => ({
      id: s.id,
      label: isAr ? s.label : s.labelEn,
      nlu: Math.round(s.latestNlu * 100 * 10) / 10,
      flagged: s.flagged,
    }))

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

  const barHeight = 32
  const chartHeight = Math.max(160, chartData.length * barHeight + 40)

  return (
    <div className="space-y-4">
      <div style={{ height: chartHeight }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 40, left: 0, bottom: 4 }}
            barSize={18}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={isAr ? 170 : 140}
              tickLine={false}
              axisLine={false}
              tick={(props) => <RtlYTick {...props} width={isAr ? 165 : 135} isAr={isAr} />}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => [`${v}%`, isAr ? "ثقة NLU" : "NLU Confidence"]}
              cursor={{ fill: "var(--muted)/20" }}
            />
            <ReferenceLine
              x={75}
              stroke="var(--status-amber-fg)"
              strokeDasharray="4 3"
              strokeOpacity={0.7}
              label={{
                value: isAr ? "الهدف ٧٥٪" : "Target 75%",
                position: "top",
                fontSize: 9,
                fill: "var(--status-amber-fg)",
              }}
            />
            <Bar
              dataKey="nlu"
              radius={[0, 4, 4, 0]}
              onClick={(entry) =>
                setHighlightedId((prev) => (prev === entry.id ? null : entry.id))
              }
              style={{ cursor: "pointer" }}
            >
              {chartData.map((entry) => {
                const dimmed = highlightedId !== null && highlightedId !== entry.id
                const color = entry.flagged
                  ? "var(--status-red)"
                  : entry.nlu >= 75
                  ? "var(--primary)"
                  : "var(--status-amber)"
                return <Cell key={entry.id} fill={color} opacity={dimmed ? 0.3 : 1} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground px-1">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-sm shrink-0" style={{ background: "var(--primary)" }} />
          {isAr ? "≥٧٥٪ (مقبول)" : "≥75% (OK)"}
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-sm shrink-0" style={{ background: "var(--status-amber)" }} />
          {isAr ? "دون الهدف" : "Below target"}
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-sm shrink-0" style={{ background: "var(--status-red)" }} />
          {isAr ? "مُبلَّغ عنه" : "Flagged"}
        </span>
      </div>

      {/* Alert list */}
      {alerts.length > 0 && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <AlertTriangle className="size-3.5 text-status-amber-fg" aria-hidden />
            {isAr ? `تنبيهات مُعلَّمة (${alerts.length})` : `Flagged alerts (${alerts.length})`}
          </div>

          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {alerts.map((alert) => {
              const seriesKey = `${alert.clusterId}::${alert.dialectEn}`
              const isAssigning = assigningId === alert.id
              const result = assignResult[alert.id]

              return (
                <div
                  key={alert.id}
                  className={[
                    "rounded-lg border p-2.5 cursor-pointer transition-all duration-150",
                    highlightedId === seriesKey
                      ? "border-primary bg-(--primary)/5"
                      : "border-border hover:border-status-amber hover:bg-status-amber-bg",
                  ].join(" ")}
                  onClick={() =>
                    setHighlightedId((prev) => (prev === seriesKey ? null : seriesKey))
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setHighlightedId((prev) => (prev === seriesKey ? null : seriesKey))
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
                        <span className="text-xs text-muted-foreground">
                          {isAr ? alert.dialect : alert.dialectEn}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs tabular-nums text-status-amber-fg">
                          NLU: {(alert.nluConfidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      {alert.message && (
                        <p className="text-xs text-muted-foreground truncate max-w-65">
                          {alert.message}
                        </p>
                      )}
                    </div>

                    {assignableUsers.length > 0 && !result && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setAssigningId(isAssigning ? null : alert.id)
                        }}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                        aria-label={isAr ? "تكليف تنبيه" : "Assign alert"}
                      >
                        <UserCheck className="size-3.5" aria-hidden />
                        {isAr ? "تكليف" : "Assign"}
                      </button>
                    )}
                    {result === "success" && (
                      <span className="text-xs text-status-green-fg">
                        {isAr ? "تم التكليف ✓" : "Assigned ✓"}
                      </span>
                    )}
                    {result === "error" && (
                      <span className="text-xs text-status-red-fg">
                        {isAr ? "فشل" : "Failed"}
                      </span>
                    )}
                  </div>

                  {isAssigning && assignableUsers.length > 0 && (
                    <div
                      className="mt-2 flex gap-2 items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                        className="flex-1 rounded border bg-transparent text-xs px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
                        className="rounded px-2 py-1 text-xs bg-primary text-primary-foreground disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-opacity"
                      >
                        {isPending ? "…" : isAr ? "تكليف" : "Assign"}
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
