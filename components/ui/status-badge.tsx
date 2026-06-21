import { cn } from "@/lib/utils"
import type { KpiStatus } from "@/lib/kpi"

const ICON: Record<KpiStatus, React.ReactNode> = {
  green: <span aria-hidden="true">●</span>,
  amber: <span aria-hidden="true">▲</span>,
  red: <span aria-hidden="true">■</span>,
}

const LABEL: Record<KpiStatus, string> = {
  green: "On target",
  amber: "At tolerance",
  red: "Breaching",
}

const CLASS: Record<KpiStatus, string> = {
  green: "status-green",
  amber: "status-amber",
  red: "status-red",
}

interface StatusBadgeProps {
  status: KpiStatus
  label?: string
  dot?: boolean
  className?: string
}

export function StatusBadge({ status, label, dot = false, className }: StatusBadgeProps) {
  const text = label ?? LABEL[status]

  if (dot) {
    return (
      <span
        className={cn("inline-flex h-2.5 w-2.5 rounded-full shrink-0", {
          "bg-[var(--status-green)]": status === "green",
          "bg-[var(--status-amber)]": status === "amber",
          "bg-[var(--status-red)]": status === "red",
        }, className)}
        aria-label={text}
        role="img"
      />
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium tabular",
        CLASS[status],
        className
      )}
      role="status"
    >
      <span className="text-[10px] leading-none">{ICON[status]}</span>
      <span>{text}</span>
    </span>
  )
}
