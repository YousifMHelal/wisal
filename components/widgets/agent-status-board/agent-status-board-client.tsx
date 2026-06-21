"use client"

import { StatusBadge } from "@/components/ui/status-badge"
import type { AgentStatusCluster } from "@/lib/queries/live-operations"
import { cn } from "@/lib/utils"

interface Props {
  data: AgentStatusCluster[]
  locale?: string
}

interface StatPillProps {
  label: string
  count: number
  colorVar: string
}

function StatPill({ label, count, colorVar }: StatPillProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="text-lg font-semibold tabular leading-none"
        style={{ color: colorVar }}
      >
        {count}
      </span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">
        {label}
      </span>
    </div>
  )
}

export function AgentStatusBoardClient({ data, locale = "en" }: Props) {
  const isAr = locale === "ar"

  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات حالة الموظفين.</p>
    )
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
      role="list"
      aria-label={isAr ? "حالة الوكلاء حسب المجموعة" : "Agent status by cluster"}
    >
      {data.map((cluster) => (
        <div
          key={cluster.clusterId}
          className={cn(
            "rounded-xl border bg-card p-3 flex flex-col gap-3",
            cluster.overallStatus === "red" && "border-[var(--status-red)]/40",
            cluster.overallStatus === "amber" && "border-[var(--status-amber)]/30"
          )}
          role="listitem"
        >
          {/* Cluster header */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {isAr ? cluster.clusterNameAr : cluster.clusterName}
              </p>
              <p className="text-[10px] text-muted-foreground tabular">{cluster.total} موظف</p>
            </div>
            <StatusBadge status={cluster.overallStatus} dot />
          </div>

          {/* State breakdown */}
          <div className="grid grid-cols-5 gap-1 text-center">
            <StatPill
              label={isAr ? "متاح" : "Avail"}
              count={cluster.available}
              colorVar="var(--status-green)"
            />
            <StatPill
              label={isAr ? "مكالمة" : "On Call"}
              count={cluster.onCall}
              colorVar="var(--primary)"
            />
            <StatPill
              label={isAr ? "تسوية" : "Wrap"}
              count={cluster.wrap + cluster.afterCall}
              colorVar="var(--status-amber)"
            />
            <StatPill
              label={isAr ? "استراحة" : "Break"}
              count={cluster.onBreak}
              colorVar="var(--muted-foreground)"
            />
            <StatPill
              label={isAr ? "غائب" : "Offline"}
              count={cluster.offline}
              colorVar="var(--status-red)"
            />
          </div>

          {/* Utilisation bar */}
          <div
            className="h-1.5 rounded-full bg-muted overflow-hidden"
            aria-label={`Utilisation: ${Math.round(((cluster.available + cluster.onCall) / Math.max(cluster.total, 1)) * 100)}%`}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.round(((cluster.available + cluster.onCall) / Math.max(cluster.total, 1)) * 100)}%`,
                background: `var(--status-${cluster.overallStatus})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
