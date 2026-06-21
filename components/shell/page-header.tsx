import { cn } from "@/lib/utils"
import type { KpiStatus } from "@/lib/kpi"
import { StatusBadge } from "@/components/ui/status-badge"

interface Crumb {
  labelEn: string
  labelAr: string
}

interface PageHeaderProps {
  titleEn: string
  titleAr: string
  subtitleEn?: string
  subtitleAr?: string
  crumbs?: Crumb[]
  status?: KpiStatus
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  titleAr,
  subtitleAr,
  crumbs,
  status,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0 flex-1 space-y-1">
        {/* Breadcrumbs */}
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="breadcrumb" dir="rtl">
            <ol className="flex items-center gap-1.5 flex-wrap">
              {crumbs.map((crumb, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <span className="text-muted-foreground/40 text-xs select-none" aria-hidden>
                      ‹
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-muted-foreground/50 tracking-wide">
                    {crumb.labelAr}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Title */}
        <div className="flex items-center gap-3 flex-wrap" dir="rtl">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {titleAr}
          </h1>
          {status && <StatusBadge status={status} dot className="shrink-0" />}
        </div>

        {/* Subtitle */}
        {subtitleAr && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl" dir="rtl">
            {subtitleAr}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0 sm:ms-4 mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  )
}
