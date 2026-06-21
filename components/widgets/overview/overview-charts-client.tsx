"use client"

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { SlaTrendPoint, AiResolutionMini, ChannelVolumeRow, ClusterHealthRow } from "@/lib/queries/overview"
import { StatusBadge } from "@/components/ui/status-badge"
import { cn } from "@/lib/utils"

// ── SLA 7-day Trend Chart ─────────────────────────────────────────────────────

interface SlaTrendProps {
  data: SlaTrendPoint[]
}

export function SlaTrendChart({ data }: SlaTrendProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-36 text-sm text-muted-foreground">
        لا توجد بيانات
      </div>
    )
  }

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en", { weekday: "short", month: "numeric", day: "numeric" }),
    sl: Math.round(d.serviceLevel * 10) / 10,
  }))

  return (
    <div className="h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="slaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[60, 100]}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: unknown) => [`${(v as number).toFixed(1)}%`, "Service Level"]}
          />
          {/* Target reference line at 80% */}
          <ReferenceLine
            y={80}
            stroke="var(--status-green)"
            strokeDasharray="3 3"
            strokeOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="sl"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#slaGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--primary)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── AI Resolution Mini Donut ───────────────────────────────────────────────────

interface AiDonutProps {
  data: AiResolutionMini
}

const DONUT_COLORS = [
  "var(--primary)",
  "var(--status-amber)",
  "var(--status-red)",
]

export function AiResolutionDonut({ data }: AiDonutProps) {
  const slices = [
    { name: "AI Full", nameAr: "ذكاء كامل", value: Math.round(data.aiFullPct * 10) / 10 },
    { name: "AI Partial", nameAr: "ذكاء جزئي", value: Math.round(data.aiPartialPct * 10) / 10 },
    { name: "Human", nameAr: "بشري", value: Math.round(data.humanPct * 10) / 10 },
  ].filter((s) => s.value > 0)

  return (
    <div className="flex items-center gap-4">
      {/* Donut */}
      <div className="size-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={52}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {slices.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(v: unknown, name: unknown) => [`${(v as number).toFixed(1)}%`, name as string]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + AI total */}
      <div className="flex-1 space-y-2 min-w-0">
        {/* AI total callout */}
        <div>
          <span
            className="text-2xl font-semibold tabular-nums"
            style={{ color: "var(--primary)" }}
          >
            {data.aiTotalPct.toFixed(1)}%
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span lang="en" className="[html[dir=rtl]_&]:hidden">AI-resolved</span>
            <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">محلول بذكاء اصطناعي</span>
          </p>
        </div>

        <div className="space-y-1.5 border-t pt-2">
          {slices.map((s, i) => (
            <div key={s.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ background: DONUT_COLORS[i] }}
                />
                <span className="text-xs text-muted-foreground truncate">
                  <span lang="en" className="[html[dir=rtl]_&]:hidden">{s.name}</span>
                  <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">{s.nameAr}</span>
                </span>
              </div>
              <span className="text-xs font-medium tabular-nums text-foreground shrink-0">
                {s.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Channel Volume Bar Chart ───────────────────────────────────────────────────

const CHANNEL_LABELS: Record<string, { en: string; ar: string }> = {
  VOICE: { en: "Voice", ar: "صوتي" },
  WHATSAPP: { en: "WhatsApp", ar: "واتساب" },
  LIVECHAT: { en: "Live Chat", ar: "دردشة مباشرة" },
  EMAIL: { en: "Email", ar: "بريد" },
  SIGN_LANGUAGE_VIDEO: { en: "Sign Lang", ar: "لغة الإشارة" },
  SOCIAL: { en: "Social", ar: "تواصل اجتماعي" },
}

interface ChannelBarProps {
  data: ChannelVolumeRow[]
  isAr?: boolean
}

export function ChannelVolumeBar({ data, isAr }: ChannelBarProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-28 text-sm text-muted-foreground">
        لا توجد بيانات
      </div>
    )
  }

  const formatted = data.map((d) => ({
    name: isAr
      ? (CHANNEL_LABELS[d.channelType]?.ar ?? d.channelType)
      : (CHANNEL_LABELS[d.channelType]?.en ?? d.channelType),
    volume: d.volume,
    status: d.status,
  }))

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={20}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: unknown) => [(v as number).toLocaleString(), isAr ? "الحجم" : "Volume"]}
          />
          <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
            {formatted.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.status === "green"
                    ? "var(--primary)"
                    : entry.status === "amber"
                    ? "var(--status-amber)"
                    : "var(--status-red)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Cluster Health List ────────────────────────────────────────────────────────

interface ClusterHealthListProps {
  top5: ClusterHealthRow[]
  bottom5: ClusterHealthRow[]
  total: number
}

export function ClusterHealthList({ top5, bottom5, total }: ClusterHealthListProps) {
  return (
    <div className="space-y-3">
      {top5.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            <span lang="en" className="[html[dir=rtl]_&]:hidden">Top Performers</span>
            <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">الأفضل أداءً</span>
          </p>
          <div className="space-y-1">
            {top5.map((row) => (
              <ClusterHealthRow key={row.clusterId} row={row} type="top" />
            ))}
          </div>
        </div>
      )}

      {bottom5.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            <span lang="en" className="[html[dir=rtl]_&]:hidden">Needs Attention</span>
            <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">تحتاج اهتمام</span>
          </p>
          <div className="space-y-1">
            {bottom5.map((row) => (
              <ClusterHealthRow key={row.clusterId} row={row} type="bottom" />
            ))}
          </div>
        </div>
      )}

      {total > 10 && (
        <p className="text-[10px] text-muted-foreground text-center pt-1">
          <span lang="en" className="[html[dir=rtl]_&]:hidden">Showing 10 of {total} clusters</span>
          <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">عرض 10 من {total} تجمع</span>
        </p>
      )}
    </div>
  )
}

function ClusterHealthRow({ row, type }: { row: ClusterHealthRow; type: "top" | "bottom" }) {
  const scorePct = Math.round(row.compositeScore * 100)
  const barWidth = Math.max(4, scorePct)

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] tabular-nums text-muted-foreground w-4 text-center shrink-0">
        {row.rank}
      </span>
      <span className="text-xs text-foreground truncate flex-1 min-w-0">
        <span lang="en" className="[html[dir=rtl]_&]:hidden">{row.clusterName}</span>
        <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">{row.clusterNameAr}</span>
      </span>
      {/* Progress bar */}
      <div
        className="w-16 h-1.5 rounded-full bg-muted overflow-hidden shrink-0"
        aria-hidden="true"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            row.status === "green" && "bg-status-green",
            row.status === "amber" && "bg-status-amber",
            row.status === "red" && "bg-status-red",
          )}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <span
        className={cn(
          "text-[10px] tabular-nums font-semibold shrink-0 w-7 text-end",
          row.status === "green" && "text-status-green-fg",
          row.status === "amber" && "text-status-amber-fg",
          row.status === "red" && "text-status-red-fg",
        )}
      >
        {scorePct}
      </span>
    </div>
  )
}
