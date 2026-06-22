"use client"

import { useState, useTransition } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts"
import { Download, Loader2, Clock, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportSavingsReport } from "@/lib/actions/executive"
import type { SavingsPoint } from "@/lib/queries/executive"
import type { Filters } from "@/lib/filters"

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  isAr: boolean
}

function SavingsTooltip({ active, payload, label, isAr }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl text-xs space-y-1.5 min-w-48">
      <p className="font-medium text-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((p) => {
          const labelText = isAr
            ? p.name === "agentHoursSaved"
              ? "ساعات الموظفين الموفرة"
              : "الساعات المقدرة (حجم × AHT)"
            : p.name === "agentHoursSaved"
              ? "Agent hours saved"
              : "Est. hours (vol × AHT)"
          return (
            <p key={p.name} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{labelText}</span>
              <span className="tabular-nums font-medium text-foreground">
                {p.value.toFixed(1)} {isAr ? "س" : "h"}
              </span>
            </p>
          )
        })}
      </div>
    </div>
  )
}

interface Props {
  data: SavingsPoint[]
  filters: Filters
  locale?: string
}

export function SavingsTrackerClient({ data, filters, locale = "ar" }: Props) {
  const isAr = locale === "ar"
  const [isPending, startTransition] = useTransition()
  const [activeBar, setActiveBar] = useState<string | null>(null)

  const chartData = data.map((d) => ({
    date: d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date).slice(0, 10),
    agentHoursSaved: +d.agentHoursSaved.toFixed(1),
    aiResolvedVolume: d.aiResolvedVolume,
    estimatedHoursSaved: +d.estimatedHoursSaved.toFixed(1),
  }))

  // Totals for KPI cards
  const totalAgentHrs = chartData.reduce((s, d) => s + d.agentHoursSaved, 0)
  const totalEstHrs = chartData.reduce((s, d) => s + d.estimatedHoursSaved, 0)
  const totalAiVolume = chartData.reduce((s, d) => s + d.aiResolvedVolume, 0)

  function handleExport() {
    startTransition(async () => {
      const fd = new FormData()
      if (filters.cluster) fd.set("cluster", filters.cluster)
      fd.set("range", filters.range)
      if (filters.from) fd.set("from", filters.from.toISOString().slice(0, 10))
      if (filters.to) fd.set("to", filters.to.toISOString().slice(0, 10))
      const result = await exportSavingsReport(fd)
      if (result?.csv) {
        downloadCsv(result.csv, `savings-report-${new Date().toISOString().slice(0, 10)}.csv`)
      }
    })
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-muted-foreground">
          {isAr ? "لا توجد بيانات توفير لهذه الفترة." : "No savings data for this period."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* KPI summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            {isAr ? "ساعات موظفين موفرة" : "Agent hrs saved"}
          </div>
          <p className="text-xl font-semibold tabular-nums text-primary">
            {totalAgentHrs.toFixed(0)}
            <span className="text-xs font-normal text-muted-foreground ms-1">{isAr ? "س" : "h"}</span>
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            {isAr ? "ساعات مقدرة (×AHT)" : "Est. hrs (×AHT)"}
          </div>
          <p className="text-xl font-semibold tabular-nums text-status-green-fg">
            {totalEstHrs.toFixed(0)}
            <span className="text-xs font-normal text-muted-foreground ms-1">{isAr ? "س" : "h"}</span>
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Bot className="size-3.5 shrink-0" />
            {isAr ? "حجم ذكاء اصطناعي" : "AI resolved"}
          </div>
          <p className="text-xl font-semibold tabular-nums text-foreground">
            {totalAiVolume.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Grouped bar chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, bottom: 0, left: -8 }}
          barCategoryGap="30%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
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
            width={36}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          />
          <Tooltip
            content={<SavingsTooltip isAr={isAr} />}
            cursor={{ fill: "var(--muted-foreground)", opacity: 0.08 }}
          />
          <Bar
            dataKey="agentHoursSaved"
            name="agentHoursSaved"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            onMouseEnter={() => setActiveBar("agent")}
            onMouseLeave={() => setActiveBar(null)}
            opacity={activeBar === "est" ? 0.35 : 1}
          />
          <Bar
            dataKey="estimatedHoursSaved"
            name="estimatedHoursSaved"
            fill="var(--status-green)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            onMouseEnter={() => setActiveBar("est")}
            onMouseLeave={() => setActiveBar(null)}
            opacity={activeBar === "agent" ? 0.35 : 1}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend + export */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm shrink-0" style={{ background: "var(--primary)" }} />
            {isAr ? "ساعات الموظفين" : "Agent Hours"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm shrink-0" style={{ background: "var(--status-green)" }} />
            {isAr ? "الساعات المقدرة (×AHT)" : "Est. Hours (×AHT)"}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isPending}
          className="gap-2 cursor-pointer h-7 text-xs"
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          {isAr ? "تصدير للمجلس" : "Export for Board"}
        </Button>
      </div>
    </div>
  )
}
