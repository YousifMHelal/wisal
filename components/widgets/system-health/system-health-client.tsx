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
    <div className="flex flex-col gap-4">
      {/* Availability — full width */}
      <div className={[
        "rounded-lg border p-4 flex flex-col gap-1",
        onTarget ? "border-s-4 border-s-[var(--status-green)]" : "border-s-4 border-s-[var(--status-red)]",
      ].join(" ")}>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">الإتاحة</span>
        <div className="flex items-end gap-3 flex-wrap">
          <span className="text-2xl font-bold tabular-nums text-foreground leading-tight">
            {data.availabilityPct.toFixed(4)}%
          </span>
          <span className="text-xs text-muted-foreground mb-0.5">
            الهدف: {AVAILABILITY_TARGET}%
          </span>
        </div>
        <AvailabilityStatus pct={data.availabilityPct} />
      </div>

      {/* Meta cards row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Region */}
        <div className="rounded-lg border bg-muted/30 p-3 flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
            <p className="text-xs text-muted-foreground truncate">إقامة البيانات</p>
          </div>
          <p className="text-sm font-medium text-foreground truncate">منطقة {data.region}</p>
          <Badge className="self-start text-[10px] bg-primary/20 text-primary border-primary/30 mt-0.5">
            Sovereign
          </Badge>
        </div>

        {/* Last DR test */}
        <div className="rounded-lg border bg-muted/30 p-3 flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <CalendarCheck className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <p className="text-xs text-muted-foreground truncate">آخر اختبار DR</p>
          </div>
          <p className="text-sm font-medium text-foreground truncate">
            {data.lastDrTestAt
              ? format(data.lastDrTestAt, "d MMM yyyy")
              : "لم يُختبر مطلقًا"}
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
