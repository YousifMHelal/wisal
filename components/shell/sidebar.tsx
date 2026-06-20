"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  BrainCircuit,
  ShieldCheck,
  Users,
  LineChart,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/status-badge"
import type { KpiStatus } from "@/lib/kpi"
import type { ModuleId } from "@/lib/module-status"

interface NavItem {
  id: ModuleId
  href: string
  labelKey: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: "live-operations", href: "/live-operations", labelKey: "liveOperations", icon: <Activity className="size-5 flex-shrink-0" /> },
  { id: "intelligence", href: "/intelligence", labelKey: "intelligence", icon: <BrainCircuit className="size-5 flex-shrink-0" /> },
  { id: "governance", href: "/governance", labelKey: "governance", icon: <ShieldCheck className="size-5 flex-shrink-0" /> },
  { id: "workforce", href: "/workforce", labelKey: "workforce", icon: <Users className="size-5 flex-shrink-0" /> },
  { id: "executive", href: "/executive", labelKey: "executive", icon: <LineChart className="size-5 flex-shrink-0" /> },
  { id: "operations", href: "/operations", labelKey: "operations", icon: <Layers className="size-5 flex-shrink-0" /> },
]

const NAV_LABELS: Record<string, { en: string; ar: string }> = {
  liveOperations: { en: "Live Operations", ar: "العمليات الحية" },
  intelligence: { en: "Wisal Intelligence", ar: "ذكاء وصال" },
  governance: { en: "Governance & Compliance", ar: "الحوكمة والامتثال" },
  workforce: { en: "Workforce & Quality", ar: "القوى العاملة والجودة" },
  executive: { en: "Executive Rollup", ar: "ملخص تنفيذي" },
  operations: { en: "Operations & Integrations", ar: "العمليات والتكاملات" },
}

interface SidebarRailProps {
  statuses: Record<ModuleId, KpiStatus>
  locale: string
  collapsed: boolean
  onToggle: () => void
}

export function SidebarRail({ statuses, locale, collapsed, onToggle }: SidebarRailProps) {
  const pathname = usePathname()
  const isAr = locale === "ar"

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-full bg-sidebar border-e border-sidebar-border transition-all duration-200 ease-out",
        collapsed ? "w-16" : "w-64"
      )}
      aria-label={isAr ? "القائمة الجانبية" : "Sidebar navigation"}
    >
      {/* Brand */}
      <div className={cn(
        "flex items-center h-14 border-b border-sidebar-border flex-shrink-0",
        collapsed ? "justify-center px-0" : "px-4 gap-2"
      )}>
        <div className="size-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground text-xs font-bold">W</span>
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground truncate">
            {isAr ? "مركز وصال" : "Wisal CC"}
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          const label = NAV_LABELS[item.labelKey][isAr ? "ar" : "en"]
          const dotStatus = statuses[item.id]

          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors duration-150 cursor-pointer min-h-[44px]",
                active
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center"
              )}
            >
              <span className="relative flex-shrink-0">
                {item.icon}
                {/* status dot overlaid on icon when collapsed */}
                {collapsed && (
                  <StatusBadge
                    status={dotStatus}
                    dot
                    className="absolute -top-0.5 -end-0.5 size-2"
                  />
                )}
              </span>

              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{label}</span>
                  <StatusBadge status={dotStatus} dot />
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2 flex-shrink-0">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-2 w-full rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150 cursor-pointer min-h-[44px]",
            collapsed && "justify-center"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />
              <span>{isAr ? "طي" : "Collapse"}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

/* ─── Mobile drawer nav (rendered inside Sheet from layout) ─── */
interface MobileNavProps {
  statuses: Record<ModuleId, KpiStatus>
  locale: string
  onClose?: () => void
}

export function MobileNav({ statuses, locale, onClose }: MobileNavProps) {
  const pathname = usePathname()
  const isAr = locale === "ar"

  return (
    <nav className="flex flex-col gap-1 py-4 px-3" aria-label={isAr ? "التنقل" : "Navigation"}>
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href)
        const label = NAV_LABELS[item.labelKey][isAr ? "ar" : "en"]
        const dotStatus = statuses[item.id]

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onClose}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 min-h-[44px]",
              active
                ? "bg-accent text-primary font-medium"
                : "text-foreground hover:bg-accent"
            )}
          >
            {item.icon}
            <span className="flex-1">{label}</span>
            <StatusBadge status={dotStatus} dot />
          </Link>
        )
      })}
    </nav>
  )
}
