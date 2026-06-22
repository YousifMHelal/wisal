"use client"

import { useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts"
import { WidgetEmpty } from "@/components/widgets/widget"
import type { AiHumanSplitData } from "@/lib/queries/intelligence"

interface Props {
  data: AiHumanSplitData
  locale?: string
}

type ViewMode = "donut" | "funnel"
type Segment = "channel" | "cluster"

const SPLIT_COLORS = [
  "var(--primary)",
  "var(--status-amber)",
  "var(--status-green)",
  "var(--status-red)",
  "#a78bfa",
  "#60a5fa",
]

const DONUT_SLICE_KEYS = {
  full: { ar: "ذكاء اصطناعي كامل", en: "Full AI", color: "var(--primary)" },
  partial: { ar: "ذكاء اصطناعي جزئي", en: "Partial AI", color: "var(--status-amber)" },
  human: { ar: "بشري", en: "Human", color: "var(--status-red)" },
}

export function AiHumanSplitClient({ data, locale = "ar" }: Props) {
  const isAr = locale === "ar"
  const [viewMode, setViewMode] = useState<ViewMode>("donut")
  const [segment, setSegment] = useState<Segment>("channel")

  const { overall, byChannel, byCluster } = data

  const hasData = byChannel.length > 0 || byCluster.length > 0

  if (!hasData) return <WidgetEmpty message="No resolution split data for this period." messageAr="لا توجد بيانات توزيع الحلول لهذه الفترة." />

  const donutData = [
    { name: isAr ? DONUT_SLICE_KEYS.full.ar : DONUT_SLICE_KEYS.full.en, color: DONUT_SLICE_KEYS.full.color, value: overall.aiFullPct },
    { name: isAr ? DONUT_SLICE_KEYS.partial.ar : DONUT_SLICE_KEYS.partial.en, color: DONUT_SLICE_KEYS.partial.color, value: overall.aiPartialPct },
    { name: isAr ? DONUT_SLICE_KEYS.human.ar : DONUT_SLICE_KEYS.human.en, color: DONUT_SLICE_KEYS.human.color, value: overall.humanPct },
  ].filter((d) => d.value > 0)

  const segmentRows = segment === "channel" ? byChannel : byCluster

  const funnelData = [
    {
      name: isAr ? "إجمالي التفاعلات" : "Total interactions",
      value: segmentRows.reduce((s, r) => s + r.volume, 0),
      fill: "var(--primary)",
    },
    {
      name: isAr ? "حُل بالذكاء الاصطناعي" : "Resolved by AI",
      value: segmentRows.reduce((s, r) => s + Math.round((r.aiFullPct / 100) * r.volume), 0),
      fill: "var(--status-green)",
    },
    {
      name: isAr ? "حُل جزئياً" : "Partially resolved",
      value: segmentRows.reduce((s, r) => s + Math.round((r.aiPartialPct / 100) * r.volume), 0),
      fill: "var(--status-amber)",
    },
    {
      name: isAr ? "حُل بشرياً" : "Resolved by human",
      value: segmentRows.reduce((s, r) => s + Math.round((r.humanPct / 100) * r.volume), 0),
      fill: "var(--status-red)",
    },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* View toggle */}
        <div className="flex rounded-md border overflow-hidden">
          {(["donut", "funnel"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={[
                "px-3 py-1 text-xs font-medium transition-colors cursor-pointer capitalize",
                viewMode === mode
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
              ].join(" ")}
              aria-pressed={viewMode === mode}
            >
              {mode === "donut" ? (isAr ? "دائري" : "Donut") : (isAr ? "قمعي" : "Funnel")}
            </button>
          ))}
        </div>

        {/* Segment toggle */}
        <div className="flex rounded-md border overflow-hidden">
          {(["channel", "cluster"] as Segment[]).map((s) => (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className={[
                "px-3 py-1 text-xs font-medium transition-colors cursor-pointer capitalize",
                segment === s
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
              ].join(" ")}
              aria-pressed={segment === s}
            >
              {s === "channel" ? (isAr ? "قناة" : "Channel") : (isAr ? "تجمع" : "Cluster")}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {viewMode === "donut" ? (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="h-44 w-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color ?? "var(--muted)"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v, name) => [`${(v as number).toFixed(1)}%`, name as string]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend + breakdown */}
          <div className="flex-1 space-y-2 w-full">
            {/* Overall legend */}
            <div className="space-y-1.5">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-sm flex-shrink-0"
                      style={{ background: d.color ?? "var(--muted)" }}
                    />
                    <span className="text-xs text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    {d.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>

            {/* AI total callout */}
            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isAr ? "إجمالي الذكاء الاصطناعي" : "Total AI"}</span>
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: "var(--primary)" }}
                >
                  {overall.aiTotalPct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Per-segment breakdown */}
            <div className="border-t pt-2 space-y-1 max-h-28 overflow-y-auto">
              {segmentRows.slice(0, 8).map((row, i) => (
                <div key={row.label} className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full flex-shrink-0"
                    style={{ background: SPLIT_COLORS[i % SPLIT_COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {row.label}
                  </span>
                  <span className="text-xs tabular-nums text-foreground flex-shrink-0">
                    {row.aiTotalPct.toFixed(0)}% {isAr ? "ذكاء" : "AI"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v, name) => [(v as number).toLocaleString(), name as string]}
              />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList
                  position="right"
                  fill="var(--foreground)"
                  fontSize={11}
                  dataKey="name"
                />
                {funnelData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
