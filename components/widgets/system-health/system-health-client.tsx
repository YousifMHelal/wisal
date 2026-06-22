"use client"

import { CheckCircle, AlertTriangle, MapPin, CalendarCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, format } from "date-fns"
import type { SystemHealthData } from "@/lib/queries/operations"

const AVAILABILITY_TARGET = 99.9999

function AvailabilityStatus({ pct, isAr }: { pct: number; isAr: boolean }) {
  const onTarget = pct >= AVAILABILITY_TARGET
  const nearTarget = pct >= 99.99

  if (onTarget) {
    return (
      <span className="flex items-center gap-1.5 text-status-green-fg">
        <CheckCircle className="size-4 shrink-0" aria-hidden="true" />
        {isAr ? "في الهدف" : "On target"}
      </span>
    )
  }
  if (nearTarget) {
    return (
      <span className="flex items-center gap-1.5 text-status-amber-fg">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        {isAr ? "عند الحد المسموح" : "Near limit"}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-status-red-fg">
      <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
      {isAr ? "خرق" : "Breach"}
    </span>
  )
}

interface Props {
  data: SystemHealthData
  locale?: string
}

export function SystemHealthClient({ data, locale = "ar" }: Props) {
  const isAr = locale === "ar"
  const onTarget = data.availabilityPct >= AVAILABILITY_TARGET

  return (
    <div className="flex flex-col gap-4">
      {/* Availability — full width */}
      <div className={[
        "rounded-lg border p-4 flex flex-col gap-1",
        onTarget ? "border-s-4 border-s-[var(--status-green)]" : "border-s-4 border-s-[var(--status-red)]",
      ].join(" ")}>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {isAr ? "الإتاحة" : "Availability"}
        </span>
        <div className="flex items-end gap-3 flex-wrap">
          <span className="text-2xl font-bold tabular-nums text-foreground leading-tight">
            {data.availabilityPct.toFixed(4)}%
          </span>
          <span className="text-xs text-muted-foreground mb-0.5">
            {isAr ? `الهدف: ${AVAILABILITY_TARGET}%` : `Target: ${AVAILABILITY_TARGET}%`}
          </span>
        </div>
        <AvailabilityStatus pct={data.availabilityPct} isAr={isAr} />
      </div>

      {/* Meta cards row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Region */}
        <div className="rounded-lg border bg-muted/30 p-3 flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
            <p className="text-xs text-muted-foreground truncate">
              {isAr ? "إقامة البيانات" : "Data Residency"}
            </p>
          </div>
          <p className="text-sm font-medium text-foreground truncate">
            {isAr ? `منطقة ${data.region}` : `Region: ${data.region}`}
          </p>
          <Badge className="self-start text-[10px] bg-primary/20 text-primary border-primary/30 mt-0.5">
            Sovereign
          </Badge>
        </div>

        {/* Last DR test */}
        <div className="rounded-lg border bg-muted/30 p-3 flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <CalendarCheck className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <p className="text-xs text-muted-foreground truncate">
              {isAr ? "آخر اختبار DR" : "Last DR Test"}
            </p>
          </div>
          <p className="text-sm font-medium text-foreground truncate">
            {data.lastDrTestAt
              ? format(data.lastDrTestAt, "d MMM yyyy")
              : (isAr ? "لم يُختبر مطلقًا" : "Never tested")}
          </p>
          {data.lastDrTestAt && (
            <p className="text-xs text-muted-foreground truncate">
              {formatDistanceToNow(data.lastDrTestAt, { addSuffix: true })}
            </p>
          )}
        </div>
      </div>

      {/* DR RTO/RPO table */}
      {data.drChannels.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" role="table" aria-label="DR RTO/RPO by channel">
            <thead>
              <tr className="border-b border-border">
                <th className="text-start py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {isAr ? "القناة" : "Channel"}
                </th>
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
        <p className="text-xs text-muted-foreground text-center py-2">
          {isAr ? "لا توجد بيانات قنوات DR مضبوطة." : "No DR channel data configured."}
        </p>
      )}
    </div>
  )
}
