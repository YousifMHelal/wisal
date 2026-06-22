"use client"

import { useState, useMemo, useCallback } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, Search, X } from "lucide-react"
import { format, parseISO } from "date-fns"
import type { ForbiddenIntentData } from "@/lib/queries/governance"

interface Props {
  data: ForbiddenIntentData
  exportUrl: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-semibold tabular-nums text-foreground">
        {payload[0].value} حدث{payload[0].value !== 1 ? "" : ""}
      </p>
    </div>
  )
}

export function ForbiddenIntentClient({ data, exportUrl }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const handleChartClick = useCallback((chartData: { activeLabel?: string } | null) => {
    if (!chartData?.activeLabel) return
    setSelectedDate((prev) => (prev === chartData.activeLabel ? null : chartData.activeLabel!))
  }, [])

  const filteredEvents = useMemo(() => {
    let list = data.events
    if (selectedDate) {
      list = list.filter(
        (e) => e.timestamp.toISOString().split("T")[0] === selectedDate
      )
    }
    const q = search.toLowerCase().trim()
    if (q) {
      list = list.filter(
        (e) =>
          e.caseId.toLowerCase().includes(q) ||
          e.pattern.toLowerCase().includes(q) ||
          e.wisalResponse.toLowerCase().includes(q)
      )
    }
    return list
  }, [data.events, selectedDate, search])

  const totalEvents = data.events.length
  const chartData = data.trend.map((p) => ({
    ...p,
    date: format(parseISO(p.date), "dd MMM"),
    rawDate: p.date,
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* Summary row */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-3xl font-semibold tabular-nums text-foreground">{totalEvents}</p>
          <p className="text-xs text-muted-foreground">إجمالي الأحداث في الفترة</p>
        </div>
        {selectedDate && (
          <Button
            variant="outline"
            size="sm"
            className="ms-auto gap-1.5 h-7 text-xs"
            onClick={() => setSelectedDate(null)}
          >
            <X className="size-3" aria-hidden />
            مسح الفلتر: {format(parseISO(selectedDate), "dd MMM")}
          </Button>
        )}
      </div>

      {/* Trend chart */}
      <div className="h-40 sm:h-52 w-full" role="img" aria-label="Forbidden intent events trend">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            onClick={handleChartClick as never}
            style={{ cursor: "pointer" }}
          >
            <defs>
              <linearGradient id="forbiddenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-status-red)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-status-red)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-status-red)"
              strokeWidth={2}
              fill="url(#forbiddenGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-status-red)", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {selectedDate && (
        <p className="text-xs text-primary font-medium">
          مفلتر إلى {format(parseISO(selectedDate), "dd MMM yyyy")} — {filteredEvents.length} حدث
        </p>
      )}

      {/* Log toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في الحالة أو النمط أو الرد…"
            className="ps-9 h-8 text-sm"
            aria-label="Search forbidden intent events"
          />
        </div>
        <a
          href={exportUrl}
          download
          className="inline-flex items-center gap-1.5 h-8 px-3 shrink-0 rounded-md border border-border bg-transparent text-sm font-medium text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
        >
          <Download className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">تصدير</span>
        </a>
      </div>

      {/* Event log */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[580px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="py-2 ps-3 pe-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">رقم الحالة</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">النمط</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">رد وصال</th>
              <th className="py-2 ps-2 pe-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">الوقت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  لا توجد أحداث{selectedDate ? " في هذا التاريخ" : " تطابق بحثك"}.
                </td>
              </tr>
            ) : (
              filteredEvents.slice(0, 100).map((ev) => (
                <tr key={ev.id} className="hover:bg-muted/30 transition-colors duration-150">
                  <td className="py-2.5 ps-3 pe-2 font-mono text-xs tabular-nums text-foreground whitespace-nowrap">{ev.caseId}</td>
                  <td className="py-2.5 px-2 text-xs text-status-red-fg max-w-[180px] truncate">{ev.pattern}</td>
                  <td className="py-2.5 px-2 text-xs text-muted-foreground max-w-[220px] truncate hidden md:table-cell">{ev.wisalResponse}</td>
                  <td className="py-2.5 ps-2 pe-3 text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                    {format(ev.timestamp, "dd MMM yyyy HH:mm")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground text-end tabular-nums">
        {filteredEvents.length > 100
          ? `عرض ١٠٠ من ${filteredEvents.length} حدث`
          : `${filteredEvents.length} حدث`}
        {!selectedDate && " · انقر على شريط الرسم للفلترة بالتاريخ"}
      </p>
    </div>
  )
}
