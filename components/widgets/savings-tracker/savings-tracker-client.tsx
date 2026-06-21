"use client"

import { useState, useTransition } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"
import { Download, Loader2 } from "lucide-react"
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
}

function SavingsTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const agentHrs = payload.find((p) => p.name === "agentHoursSaved")?.value ?? 0
  const volume = payload.find((p) => p.name === "aiResolvedVolume")?.value ?? 0
  const ahtSaved = payload.find((p) => p.name === "estimatedHoursSaved")?.value ?? 0

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl text-xs space-y-1.5 min-w-[200px]">
      <p className="font-medium text-foreground">{label}</p>
      <div className="space-y-1 text-muted-foreground">
        <p>ساعات الموظفين الموفرة: <span className="tabular-nums text-foreground font-medium">{agentHrs.toFixed(1)} ساعة</span></p>
        <p>حجم ما حله الذكاء الاصطناعي: <span className="tabular-nums text-foreground font-medium">{volume.toLocaleString()}</span></p>
        <p>الساعات المقدرة الموفرة (حجم × AHT): <span className="tabular-nums text-foreground font-medium">{ahtSaved.toFixed(1)} ساعة</span></p>
      </div>
      <p className="text-[10px] text-muted-foreground border-t border-border pt-1">
        الحساب: حجم ما حله الذكاء الاصطناعي × متوسط وقت المعالجة الموفر ÷ 3600
      </p>
    </div>
  )
}

interface Props {
  data: SavingsPoint[]
  filters: Filters
}

export function SavingsTrackerClient({ data, filters }: Props) {
  const [isPending, startTransition] = useTransition()

  const chartData = data.map((d) => ({
    date: d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date).slice(0, 10),
    agentHoursSaved: +d.agentHoursSaved.toFixed(1),
    aiResolvedVolume: d.aiResolvedVolume,
    estimatedHoursSaved: +d.estimatedHoursSaved.toFixed(1),
  }))

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
        <p className="text-sm text-muted-foreground">لا توجد بيانات توفير لهذه الفترة.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* export button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isPending}
          className="gap-2 cursor-pointer"
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          تصدير للمجلس
        </Button>
      </div>

      {/* chart */}
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="grad-agent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-est" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--status-green)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--status-green)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<SavingsTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }}
            formatter={(value) =>
              value === "agentHoursSaved"
                ? "ساعات الموظفين الموفرة"
                : value === "estimatedHoursSaved"
                ? "الساعات المقدرة (حجم × AHT)"
                : value
            }
          />
          <Area
            type="monotone"
            dataKey="agentHoursSaved"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#grad-agent)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="estimatedHoursSaved"
            stroke="var(--status-green)"
            strokeWidth={2}
            fill="url(#grad-est)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
