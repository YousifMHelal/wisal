"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { ChevronLeft } from "lucide-react"
import { format } from "date-fns"
import type { TrainingModuleSummary, TrainingAgentDetail } from "@/lib/queries/workforce"

interface DrilldownData {
  agentId: string
  agentName: string
  records: TrainingAgentDetail["records"]
}

interface TooltipProps {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full inline-block shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="tabular-nums text-foreground font-medium">{p.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  )
}

interface Props {
  summaries: TrainingModuleSummary[]
  agentDetails: Record<string, TrainingAgentDetail>
  moduleList: string[]
  defaultModule?: string
}

export function TrainingImpactClient({
  summaries: initialSummaries,
  agentDetails,
  moduleList,
  defaultModule = "",
}: Props) {
  const [selectedModule, setSelectedModule] = useState(defaultModule)
  const [drilldown, setDrilldown] = useState<DrilldownData | null>(null)

  // Filter summaries client-side when module changes
  const summaries = selectedModule
    ? initialSummaries.filter((s) => s.module === selectedModule)
    : initialSummaries

  function onModuleChange(m: string) {
    setSelectedModule(m)
    setDrilldown(null)
  }

  const chartData = summaries.map((s) => ({
    name: s.module.length > 20 ? s.module.slice(0, 18) + "…" : s.module,
    fullName: s.module,
    "Avg Before": +s.avgBefore.toFixed(1),
    "Avg After": +s.avgAfter.toFixed(1),
    Δ: +s.avgDelta.toFixed(1),
    completions: s.completions,
  }))

  // Per-agent drilldown: build line chart from training records ordered by date
  function buildAgentTrend(detail: TrainingAgentDetail) {
    return detail.records.map((r, i) => ({
      index: i + 1,
      label: format(r.completedAt, "dd MMM"),
      module: r.module,
      "QA Before": +r.qaScoreBefore.toFixed(1),
      "QA After": +r.qaScoreAfter.toFixed(1),
    }))
  }

  if (drilldown) {
    const detail = agentDetails[drilldown.agentId]
    const trendData = detail ? buildAgentTrend(detail) : []

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrilldown(null)}
            className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-xs text-muted-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
          >
            <ChevronLeft className="size-3" aria-hidden />
            Back
          </button>
          <span className="text-sm font-medium text-foreground">{drilldown.agentName} — Training History</span>
        </div>

        {trendData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No training records.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="QA Before"
                  stroke="var(--muted-foreground)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  strokeDasharray="4 2"
                />
                <Line
                  type="monotone"
                  dataKey="QA After"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs min-w-[360px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="py-2 ps-3 text-start font-medium text-muted-foreground">Module</th>
                    <th className="py-2 px-2 text-start font-medium text-muted-foreground">Completed</th>
                    <th className="py-2 px-2 text-end font-medium text-muted-foreground tabular-nums">Before</th>
                    <th className="py-2 px-2 text-end font-medium text-muted-foreground tabular-nums">After</th>
                    <th className="py-2 pe-3 text-end font-medium text-muted-foreground tabular-nums">Δ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {drilldown.records.map((r, i) => {
                    const delta = r.qaScoreAfter - r.qaScoreBefore
                    return (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2 ps-3 text-foreground">{r.module}</td>
                        <td className="py-2 px-2 text-muted-foreground tabular-nums">{format(r.completedAt, "dd MMM yyyy")}</td>
                        <td className="py-2 px-2 text-end tabular-nums text-muted-foreground">{r.qaScoreBefore.toFixed(1)}</td>
                        <td className="py-2 px-2 text-end tabular-nums text-foreground">{r.qaScoreAfter.toFixed(1)}</td>
                        <td className={`py-2 pe-3 text-end tabular-nums font-medium ${delta >= 0 ? "text-[var(--status-green-fg)]" : "text-[var(--status-red-fg)]"}`}>
                          {delta >= 0 ? "+" : ""}{delta.toFixed(1)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Module filter */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground shrink-0">Module</label>
        <select
          value={selectedModule}
          onChange={(e) => onModuleChange(e.target.value)}
          className="h-8 rounded-md border border-border bg-card text-sm text-foreground px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Filter by training module"
        >
          <option value="">All modules</option>
          {moduleList.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground ms-auto tabular-nums">
          {summaries.reduce((s, m) => s + m.completions, 0)} completions
        </span>
      </div>

      {summaries.length === 0 ? (
        <div className="flex items-center justify-center min-h-[160px]">
          <p className="text-sm text-muted-foreground">No training records for this selection.</p>
        </div>
      ) : (
        <>
          {/* Grouped bar chart */}
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar
                dataKey="Avg Before"
                fill="var(--muted-foreground)"
                radius={[3, 3, 0, 0]}
                opacity={0.6}
              />
              <Bar
                dataKey="Avg After"
                fill="var(--primary)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Module summary table with agent drill-in */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="py-2 ps-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide">Module</th>
                  <th className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide tabular-nums">Completions</th>
                  <th className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide tabular-nums">Before</th>
                  <th className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide tabular-nums">After</th>
                  <th className="py-2 pe-3 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide tabular-nums">Δ avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summaries.map((s) => (
                  <tr key={s.module} className="hover:bg-muted/30 transition-colors duration-150">
                    <td className="py-2.5 ps-3 text-sm text-foreground">{s.module}</td>
                    <td className="py-2.5 px-2 text-end text-sm tabular-nums text-muted-foreground">{s.completions}</td>
                    <td className="py-2.5 px-2 text-end text-sm tabular-nums text-muted-foreground">{s.avgBefore.toFixed(1)}</td>
                    <td className="py-2.5 px-2 text-end text-sm tabular-nums text-foreground">{s.avgAfter.toFixed(1)}</td>
                    <td className={`py-2.5 pe-3 text-end text-sm tabular-nums font-medium ${s.avgDelta >= 0 ? "text-[var(--status-green-fg)]" : "text-[var(--status-red-fg)]"}`}>
                      {s.avgDelta >= 0 ? "+" : ""}{s.avgDelta.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Agent-level drilldown: pick from available details */}
          {Object.keys(agentDetails).length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Agent Drilldown</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(agentDetails).map((d) => (
                  <button
                    key={d.agentId}
                    type="button"
                    onClick={() =>
                      setDrilldown({ agentId: d.agentId, agentName: d.agentName, records: d.records })
                    }
                    className="h-7 px-3 rounded-md border border-border text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 cursor-pointer"
                  >
                    {d.agentName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
