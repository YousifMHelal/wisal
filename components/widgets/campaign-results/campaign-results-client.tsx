"use client"

import { useState, useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"
import { StatusBadge } from "@/components/ui/status-badge"
import type { CampaignRow } from "@/lib/queries/executive"
import { cn } from "@/lib/utils"

const CAMPAIGN_TYPES = ["REMINDER", "SURVEY", "AWARENESS", "RESCHEDULE"] as const
type CampaignType = (typeof CAMPAIGN_TYPES)[number]

const TYPE_LABELS: Record<CampaignType, { label: string; labelAr: string }> = {
  REMINDER: { label: "Reminder", labelAr: "تذكير" },
  SURVEY: { label: "Survey", labelAr: "استبيان" },
  AWARENESS: { label: "Awareness", labelAr: "توعية" },
  RESCHEDULE: { label: "Reschedule", labelAr: "إعادة جدولة" },
}

const STATUS_MAP: Record<string, "green" | "amber" | "red"> = {
  COMPLETED: "green",
  ACTIVE: "amber",
  PAUSED: "amber",
  DRAFT: "red",
}

function aggregateByType(campaigns: CampaignRow[], isAr: boolean): Array<{
  type: string
  label: string
  sent: number
  delivered: number
  responded: number
  deliveryRate: number
  responseRate: number
}> {
  const map = new Map<string, { sent: number; delivered: number; responded: number }>()
  for (const c of campaigns) {
    const existing = map.get(c.type) ?? { sent: 0, delivered: 0, responded: 0 }
    existing.sent += c.sent
    existing.delivered += c.delivered
    existing.responded += c.responded
    map.set(c.type, existing)
  }

  return CAMPAIGN_TYPES.filter((t) => map.has(t)).map((t) => {
    const agg = map.get(t)!
    return {
      type: t,
      label: isAr ? (TYPE_LABELS[t]?.labelAr ?? t) : (TYPE_LABELS[t]?.label ?? t),
      sent: agg.sent,
      delivered: agg.delivered,
      responded: agg.responded,
      deliveryRate: agg.sent > 0 ? (agg.delivered / agg.sent) * 100 : 0,
      responseRate: agg.delivered > 0 ? (agg.responded / agg.delivered) * 100 : 0,
    }
  })
}

interface Props { campaigns: CampaignRow[]; locale?: string }

export function CampaignResultsClient({ campaigns, locale = "ar" }: Props) {
  const isAr = locale === "ar"
  const [activeType, setActiveType] = useState<CampaignType | "ALL">("ALL")

  const filtered = useMemo(
    () => (activeType === "ALL" ? campaigns : campaigns.filter((c) => c.type === activeType)),
    [campaigns, activeType]
  )

  const byType = useMemo(() => aggregateByType(campaigns, isAr), [campaigns, isAr])

  if (!campaigns.length) {
    return (
      <div className="flex items-center justify-center min-h-[120px]">
        <p className="text-sm text-muted-foreground">
          {isAr ? "لا توجد بيانات حملات لهذه الفترة." : "No campaign data for this period."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* type filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveType("ALL")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
            activeType === "ALL"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {isAr ? "الكل" : "All"}
        </button>
        {CAMPAIGN_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
              activeType === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {isAr ? (TYPE_LABELS[t]?.labelAr ?? t) : (TYPE_LABELS[t]?.label ?? t)}
          </button>
        ))}
      </div>

      {/* bar chart: by type aggregation */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={byType} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }} />
          <Bar dataKey="sent" name={isAr ? "مُرسَل" : "Sent"} fill="var(--color-muted-foreground)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="delivered" name={isAr ? "مُستلَم" : "Delivered"} fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="responded" name={isAr ? "استجاب" : "Responded"} fill="var(--status-green)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* campaign list */}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[560px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 ps-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isAr ? "الحملة" : "Campaign"}
              </th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isAr ? "النوع" : "Type"}
              </th>
              <th className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isAr ? "مُرسَل" : "Sent"}
              </th>
              <th className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isAr ? "% التسليم" : "Delivery %"}
              </th>
              <th className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isAr ? "% الاستجابة" : "Response %"}
              </th>
              <th className="py-2 pe-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isAr ? "الحالة" : "Status"}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map((c) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 ps-2 font-medium text-foreground max-w-[160px]">
                  <span className="truncate block [html[dir=rtl]_&]:hidden">{c.name}</span>
                  <span className="truncate hidden [html[dir=rtl]_&]:block">{c.nameAr}</span>
                </td>
                <td className="py-2.5 px-2">
                  <span className="text-xs text-muted-foreground">
                    {isAr
                      ? (TYPE_LABELS[c.type as CampaignType]?.labelAr ?? c.type)
                      : (TYPE_LABELS[c.type as CampaignType]?.label ?? c.type)}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-end tabular-nums text-foreground">{c.sent.toLocaleString()}</td>
                <td className="py-2.5 px-2 text-end tabular-nums text-foreground">{c.deliveryRate.toFixed(1)}%</td>
                <td className="py-2.5 px-2 text-end tabular-nums text-foreground">{c.responseRate.toFixed(1)}%</td>
                <td className="py-2.5 pe-2 text-end">
                  <StatusBadge status={STATUS_MAP[c.status] ?? "amber"} label={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
