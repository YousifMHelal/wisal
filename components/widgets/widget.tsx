import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Lock, AlertCircle, InboxIcon } from "lucide-react"

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
      className={cn(
        "rounded-xl border bg-card p-4 md:p-6 flex flex-col gap-4",
        "shadow-[0_1px_3px_rgba(0,0,0,0.12)] dark:shadow-none",
        className
      )}
      aria-label={ariaLabel ?? title}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest truncate leading-none">
          <span lang="en" className="[html[dir=rtl]_&]:hidden">{title}</span>
          {titleAr && (
            <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">{titleAr}</span>
          )}
        </h2>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
      {footer && (
        <div className="text-xs text-muted-foreground border-t border-border/60 pt-3 mt-0">{footer}</div>
      )}
    </section>
  )
}

export function WidgetSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-4 md:p-6 flex flex-col gap-4", className)}>
      {/* Title row */}
      <Skeleton className="h-3 w-28 rounded" />
      {/* Body — mimics a chart area + row list */}
      <div className="flex-1 space-y-3">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-5 w-5/6 rounded" />
          <Skeleton className="h-5 w-4/6 rounded" />
        </div>
      </div>
    </section>
  )
}

export function WidgetError({ message, className }: { message?: string; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-destructive/20 bg-card p-4 md:p-6 flex flex-col items-center justify-center gap-3 min-h-45", className)}>
      <AlertCircle className="size-8 text-destructive/60" aria-hidden="true" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">تعذّر تحميل البيانات</p>
        <p className="text-xs text-muted-foreground">
          {message ?? "حدث خطأ. حاول تحديث الصفحة."}
        </p>
      </div>
    </section>
  )
}

export function WidgetEmpty({ message, messageAr, className }: { message?: string; messageAr?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 min-h-35 py-8", className)}>
      <InboxIcon className="size-8 text-muted-foreground/40" aria-hidden="true" />
      <p className="text-sm text-muted-foreground text-center max-w-50 leading-snug">
        <span lang="en" className="[html[dir=rtl]_&]:hidden">
          {message ?? "No data available for the selected filters."}
        </span>
        <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">
          {messageAr ?? "لا توجد بيانات للفلاتر المحددة."}
        </span>
      </p>
    </div>
  )
}

export function WidgetLocked({
  requiredRole,
  requiredRoleAr,
  className,
}: {
  requiredRole: string
  requiredRoleAr?: string
  className?: string
}) {
  return (
    <section className={cn("rounded-xl border bg-card p-4 md:p-6 flex flex-col items-center justify-center gap-4 min-h-45", className)}>
      <div className="size-12 rounded-full bg-muted flex items-center justify-center">
        <Lock className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="text-center space-y-1.5">
        <p className="text-sm font-medium text-foreground">
          <span lang="en" className="[html[dir=rtl]_&]:hidden">Elevated permission required</span>
          <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">صلاحية متقدمة مطلوبة</span>
        </p>
        <p className="text-xs text-muted-foreground">
          <span lang="en" className="[html[dir=rtl]_&]:hidden">Requires: {requiredRole}</span>
          {requiredRoleAr ? (
            <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">مطلوب: {requiredRoleAr}</span>
          ) : (
            <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">مطلوب: {requiredRole}</span>
          )}
        </p>
      </div>
    </section>
  )
}
