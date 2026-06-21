import { cn } from "@/lib/utils"
import type { KpiStatus } from "@/lib/kpi"

const ICON: Record<KpiStatus, React.ReactNode> = {
  green: <span aria-hidden="true">●</span>,
  amber: <span aria-hidden="true">▲</span>,
  red:   <span aria-hidden="true">■</span>,
}

const LABEL: Record<KpiStatus, { en: string; ar: string }> = {
  green: { en: "On target",    ar: "في الهدف" },
  amber: { en: "At tolerance", ar: "عند الحد" },
  red:   { en: "Breaching",    ar: "خرق" },
}

const DOT_CLASS: Record<KpiStatus, string> = {
  green: "bg-status-green",
  amber: "bg-status-amber",
  red:   "bg-status-red",
}

const BADGE_CLASS: Record<KpiStatus, string> = {
  green: "status-green",
  amber: "status-amber",
  red:   "status-red",
}

interface StatusBadgeProps {
  status: KpiStatus
  label?: string
  dot?: boolean
  className?: string
}

export function StatusBadge({ status, label, dot = false, className }: StatusBadgeProps) {
  const enText = label ?? LABEL[status].en
  const arText = LABEL[status].ar

  if (dot) {
    return (
      <span
        className={cn("inline-flex size-2.5 rounded-full shrink-0", DOT_CLASS[status], className)}
        aria-label={enText}
        role="img"
      />
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium tabular",
        BADGE_CLASS[status],
        className
      )}
      role="status"
    >
      <span className="text-[10px] leading-none" aria-hidden="true">{ICON[status]}</span>
      <span lang="en" className="[html[dir=rtl]_&]:hidden">{enText}</span>
      <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">{arText}</span>
    </span>
  )
}
