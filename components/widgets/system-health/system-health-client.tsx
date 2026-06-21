"use client"

import { CheckCircle, AlertTriangle, MapPin, CalendarCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, format } from "date-fns"
import type { SystemHealthData } from "@/lib/queries/operations"

const AVAILABILITY_TARGET = 99.9999

function AvailabilityStatus({ pct }: { pct: number }) {
  const onTarget = pct >= AVAILABILITY_TARGET
  const nearTarget = pct >= 99.99

  if (onTarget) {
    return (
      <span className="flex items-center gap-1.5 text-[var(--status-green-fg)]">
        <CheckCircle className="size-4 shrink-0" aria-hidden="true" />
        في الهدف
      </span>
    )
  }
  if (nearTarget) {
    return (
      <span className="flex items-center gap-1.5 text-[var(--status-amber-fg)]">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        عند الحد المسموح
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-[var(--status-red-fg)]">
      <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
      خرق
    </span>
  )
}

interface Props {
  data: SystemHealthData
}

export function SystemHealthClient({ data }: Props) {
  const onTarget = data.availabilityPct >= AVAILABILITY_TARGET

  return (
    <div className="flex flex-col gap-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Availability card */}
        <div className={[
          "rounded-lg border p-4 flex flex-col gap-1 col-span-1 sm:col-span-2",
          onTarget ? "border-s-4 border-s-[var(--status-green)]" : "border-s-4 border-s-[var(--status-red)]",
        ].join(" ")}>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">الإتاحة</span>
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {data.availabilityPct.toFixed(4)}%
            </span>
            <span className="text-xs text-muted-foreground mb-1">
              الهدف: {AVAILABILITY_TARGET}%
            </span>
          </div>
          <AvailabilityStatus pct={data.availabilityPct} />
        </div>

        {/* Meta cards */}
        <div className="flex flex-col gap-3">
          {/* Region */}
          <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-2">
            <MapPin className="size-4 text-primary shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">إقامة البيانات</p>
              <p className="text-sm font-medium text-foreground">منطقة {data.region}</p>
            </div>
            <Badge className="ms-auto text-[10px] bg-primary/20 text-primary border-primary/30 shrink-0">
              Sovereign
            </Badge>
          </div>

          {/* Last DR test */}
          <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-2">
            <CalendarCheck className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">آخر اختبار DR</p>
              <p className="text-sm font-medium text-foreground">
                {data.lastDrTestAt
                  ? format(data.lastDrTestAt, "d MMM yyyy")
                  : "لم يُختبر مطلقًا"}
              </p>
              {data.lastDrTestAt && (
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(data.lastDrTestAt, { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DR RTO/RPO table */}
      {data.drChannels.length > 0 && (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm border-collapse" role="table" aria-label="DR RTO/RPO by channel">
            <thead>
              <tr className="border-b border-border">
                <th className="text-start py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">القناة</th>
                <th className="text-start py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">RTO</th>
                <th className="text-start py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">RPO</th>
              </tr>
            </thead>
            <tbody>
              {data.drChannels.map((ch) => (
                <tr key={ch.channel} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-2 font-medium text-foreground capitalize">{ch.channel}</td>
                  <td className="py-2.5 px-2 text-muted-foreground tabular-nums">{ch.rto}</td>
                  <td className="py-2.5 px-2 text-muted-foreground tabular-nums">{ch.rpo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.drChannels.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">لا توجد بيانات قنوات DR مضبوطة.</p>
      )}
    </div>
  )
}
