"use client"

import { useState, useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Info } from "lucide-react"
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { WidgetEmpty } from "@/components/widgets/widget"
import type { TierMonitorData } from "@/lib/queries/intelligence"

interface Props {
  data: TierMonitorData
}

type TierFilter = "T1" | "T2" | "T3" | null

const TIER_COLORS = {
  T1: "var(--primary)",
  T2: "var(--status-amber)",
  T3: "var(--status-red)",
}

const TIER_LABELS: Record<string, string> = {
  T1: "Tier 1 (AI)",
  T2: "Tier 2 (Copilot)",
  T3: "Tier 3 (Caregiver)",
}

export function AdaptiveTierMonitorClient({ data }: Props) {
  const [activeTier, setActiveTier] = useState<TierFilter>(null)

  const { trend, latest } = data

  const chartData = useMemo(
    () =>
      trend.map((p) => ({
        time: new Date(p.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        T1: p.tier1Pct,
        T2: p.tier2Pct,
        T3: p.tier3Pct,
        autocorrect: p.tier1AutocorrectRate,
      })),
    [trend]
  )

  if (!trend.length) return <WidgetEmpty message="No tier data for this period." />

  const filteredData = activeTier
    ? chartData.map((d) => ({
        ...d,
        T1: activeTier === "T1" ? d.T1 : 0,
        T2: activeTier === "T2" ? d.T2 : 0,
        T3: activeTier === "T3" ? d.T3 : 0,
      }))
    : chartData

  return (
    <div className="space-y-4">
      {/* Tier band filter buttons */}
      <div className="flex flex-wrap gap-2">
        {(["T1", "T2", "T3"] as TierFilter[]).map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveTier((prev) => (prev === tier ? null : tier))}
            className={[
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 cursor-pointer border",
              activeTier === tier
                ? "bg-primary text-primary-foreground border-primary"
                : activeTier !== null
                ? "opacity-40 border-border text-muted-foreground hover:opacity-70"
                : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
            ].join(" ")}
            aria-pressed={activeTier === tier}
          >
            <span
              className="size-2 rounded-full shrink-0"
              style={{ background: TIER_COLORS[tier!] }}
            />
            {TIER_LABELS[tier!]}
          </button>
        ))}
        {activeTier && (
          <button
            onClick={() => setActiveTier(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Stacked area chart */}
      <div className="h-48 md:h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradT1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={TIER_COLORS.T1} stopOpacity={0.25} />
                <stop offset="95%" stopColor={TIER_COLORS.T1} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradT2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={TIER_COLORS.T2} stopOpacity={0.25} />
                <stop offset="95%" stopColor={TIER_COLORS.T2} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradT3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={TIER_COLORS.T3} stopOpacity={0.25} />
                <stop offset="95%" stopColor={TIER_COLORS.T3} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--foreground)" }}
              formatter={(value, name) => [
                `${(value as number).toFixed(1)}%`,
                TIER_LABELS[name as string] ?? name,
              ]}
            />
            <Area
              type="monotone"
              dataKey="T1"
              stackId="1"
              stroke={TIER_COLORS.T1}
              fill="url(#gradT1)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="T2"
              stackId="1"
              stroke={TIER_COLORS.T2}
              fill="url(#gradT2)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="T3"
              stackId="1"
              stroke={TIER_COLORS.T3}
              fill="url(#gradT3)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tier-1 autocorrect mini-trend */}
      <div className="border-t pt-3 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Tier-1 Autocorrect Rate</span>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <Info className="size-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-50">
                  % of Tier-1 interactions where AI self-corrected before final response.
                  Target ≥ 80%.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          {latest && (
            <span
              className="ms-auto font-semibold tabular-nums"
              style={{
                color:
                  latest.autocorrectStatus === "green"
                    ? "var(--status-green-fg)"
                    : latest.autocorrectStatus === "amber"
                    ? "var(--status-amber-fg)"
                    : "var(--status-red-fg)",
              }}
            >
              {latest.tier1AutocorrectRate.toFixed(1)}%
            </span>
          )}
        </div>
        <div className="h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 2, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(v) => [`${(v as number).toFixed(1)}%`, "Autocorrect"]}
              />
              <Line
                type="monotone"
                dataKey="autocorrect"
                stroke={TIER_COLORS.T1}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latest snapshot summary */}
      {latest && (
        <div className="grid grid-cols-3 gap-2 border-t pt-3">
          {[
            { label: "T1 (AI)", value: latest.tier1Pct, color: TIER_COLORS.T1 },
            { label: "T2 (Copilot)", value: latest.tier2Pct, color: TIER_COLORS.T2 },
            { label: "T3 (Caregiver)", value: latest.tier3Pct, color: TIER_COLORS.T3 },
          ].map((item) => (
            <div key={item.label} className="text-center space-y-0.5">
              <div
                className="text-xl font-semibold tabular-nums"
                style={{ color: item.color }}
              >
                {item.value.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
