import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Lock } from "lucide-react"

interface WidgetProps {
  title: string
  titleAr?: string
  children: React.ReactNode
  actions?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  "aria-label"?: string
}

export function Widget({
  title,
  titleAr,
  children,
  actions,
  footer,
  className,
  "aria-label": ariaLabel,
}: WidgetProps) {
  return (
    <section
      className={cn("rounded-xl border bg-card p-4 md:p-6 flex flex-col gap-4", className)}
      aria-label={ariaLabel ?? title}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide truncate">
          <span lang="en" className="[html[dir=rtl]_&]:hidden">{title}</span>
          {titleAr && (
            <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">{titleAr}</span>
          )}
        </h2>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
      {footer && (
        <div className="text-xs text-muted-foreground border-t pt-3 mt-0">{footer}</div>
      )}
    </section>
  )
}

export function WidgetSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-4 md:p-6 flex flex-col gap-4", className)}>
      <Skeleton className="h-4 w-32" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    </section>
  )
}

export function WidgetError({ message, className }: { message?: string; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-4 md:p-6 flex items-center justify-center min-h-[160px]", className)}>
      <p className="text-sm text-destructive text-center">
        {message ?? "Failed to load data. Try refreshing."}
      </p>
    </section>
  )
}

export function WidgetEmpty({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center min-h-[120px]", className)}>
      <p className="text-sm text-muted-foreground text-center">
        {message ?? "No data available."}
      </p>
    </div>
  )
}

export function WidgetLocked({
  requiredRole,
  className,
}: {
  requiredRole: string
  className?: string
}) {
  return (
    <section className={cn("rounded-xl border bg-card p-4 md:p-6 flex flex-col items-center justify-center gap-3 min-h-[160px]", className)}>
      <Lock className="size-8 text-muted-foreground" aria-hidden="true" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">Elevated permission required</p>
        <p className="text-xs text-muted-foreground">Requires: {requiredRole}</p>
      </div>
    </section>
  )
}
