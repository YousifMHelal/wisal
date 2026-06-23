"use client"

import { useState, useMemo, useCallback } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, Search, X } from "lucide-react"
import { format, parseISO } from "date-fns"
import type { ForbiddenIntentData } from "@/lib/queries/governance"

interface Props {
  data: ForbiddenIntentData
  exportUrl: string
  locale?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name?: string }>
  label?: string
  isAr?: boolean
}

function ChartTooltip({ active, payload, label, isAr }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-semibold tabular-nums text-foreground">
        {payload[0].value}{" "}
        <span className="[html[dir=rtl]_&]:hidden">{payload[0].value !== 1 ? "events" : "event"}</span>
        <span className="hidden [html[dir=rtl]_&]:inline">حدث</span>
      </p>
    </div>
  )
}


export function ForbiddenIntentClient({ data, exportUrl, locale = "ar" }: Props) {
  const isAr = locale === "ar"
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

  // Pattern frequency breakdown — top 8 by count
  const patternData = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of data.events) {
      map.set(e.pattern, (map.get(e.pattern) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([pattern, count]) => ({ pattern, count }))
  }, [data.events])

  return (
    <div className="flex flex-col gap-4">
      {/* Summary row */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-3xl font-semibold tabular-nums text-foreground">{totalEvents}</p>
          <p className="text-xs text-muted-foreground">{isAr ? "إجمالي الأحداث في الفترة" : "Total events in period"}</p>
        </div>
        {selectedDate && (
          <Button
            variant="outline"
            size="sm"
            className="ms-auto gap-1.5 h-7 text-xs"
            onClick={() => setSelectedDate(null)}
          >
            <X className="size-3" aria-hidden />
            {isAr ? "مسح الفلتر:" : "Clear filter:"} {format(parseISO(selectedDate), "dd MMM")}
          </Button>
        )}
      </div>

      {/* Daily volume — bar chart, click to filter */}
      <div className="h-36 sm:h-44 w-full" role="img" aria-label="Forbidden intent daily volume">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            onClick={handleChartClick as never}
            style={{ cursor: "pointer" }}
            barCategoryGap="30%"
          >
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
            <Tooltip content={<ChartTooltip isAr={isAr} />} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.rawDate}
                  fill={entry.rawDate === selectedDate ? "var(--color-status-red)" : "color-mix(in srgb, var(--color-status-red) 45%, transparent)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pattern breakdown — horizontal bars, top 8 */}
      {patternData.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            {isAr ? "تكرار الأنماط" : "Pattern frequency"}
          </p>
          <div className="flex flex-col gap-1.5">
            {patternData.map(({ pattern, count }) => {
              const pct = Math.round((count / patternData[0].count) * 100)
              const isSelected = filteredEvents.length > 0 && filteredEvents.some((e) => e.pattern === pattern)
              return (
                <div key={pattern} className="flex items-center gap-2 text-xs">
                  <span className="w-36 sm:w-48 shrink-0 truncate text-muted-foreground" title={pattern}>{pattern}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        background: isSelected
                          ? "var(--color-status-red)"
                          : "color-mix(in srgb, var(--color-status-red) 50%, transparent)",
                      }}
                    />
                  </div>
                  <span className="w-6 text-end tabular-nums text-foreground font-medium shrink-0">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selectedDate && (
        <p className="text-xs text-primary font-medium">
          {isAr
            ? `مفلتر إلى ${format(parseISO(selectedDate), "dd MMM yyyy")} — ${filteredEvents.length} حدث`
            : `Filtered to ${format(parseISO(selectedDate), "dd MMM yyyy")} — ${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Log toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "ابحث في الحالة أو النمط أو الرد…" : "Search by case, pattern, or response…"}
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
          <span className="hidden sm:inline">{isAr ? "تصدير" : "Export"}</span>
        </a>
      </div>

      {/* Event log */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[580px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="py-2 ps-3 pe-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{isAr ? "رقم الحالة" : "Case ID"}</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{isAr ? "النمط" : "Pattern"}</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">{isAr ? "رد وصال" : "Wisal response"}</th>
              <th className="py-2 ps-2 pe-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{isAr ? "الوقت" : "Time"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  {isAr
                    ? `لا توجد أحداث${selectedDate ? " في هذا التاريخ" : " تطابق بحثك"}.`
                    : selectedDate ? "No events on this date." : "No events match your search."}
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
        {isAr
          ? filteredEvents.length > 100
            ? `عرض ١٠٠ من ${filteredEvents.length} حدث`
            : `${filteredEvents.length} حدث`
          : filteredEvents.length > 100
            ? `Showing 100 of ${filteredEvents.length} events`
            : `${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""}`}
        {!selectedDate && (isAr ? " · انقر على عمود للفلترة بالتاريخ" : " · click a bar to filter by date")}
      </p>
    </div>
  )
}
