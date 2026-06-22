"use client";

import * as React from "react";
import type { KpiStatus } from "@/lib/kpi";
import type { ModuleId } from "@/lib/module-status";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  Award,
  Ban,
  BarChart2,
  BookOpen,
  BrainCircuit,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  GraduationCap,
  Heart,
  Layers,
  LayoutDashboard,
  LineChart,
  Map,
  MonitorPlay,
  Network,
  Search,
  ShieldCheck,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SubNavItem {
  href: string;
  labelEn: string;
  labelAr: string;
  icon: React.ReactNode;
}

interface NavModule {
  id: ModuleId | "overview";
  labelEn: string;
  labelAr: string;
  icon: React.ReactNode;
  noStatusDot?: boolean;
  /** If set, module itself is a link (no children) */
  href?: string;
  children?: SubNavItem[];
}

const NAV_MODULES: NavModule[] = [
  {
    id: "overview",
    href: "/overview",
    labelEn: "Overview",
    labelAr: "نظرة عامة",
    icon: <LayoutDashboard className="size-4 shrink-0" />,
    noStatusDot: true,
  },
  {
    id: "live-operations",
    labelEn: "Live Operations",
    labelAr: "العمليات الحية",
    icon: <Activity className="size-4 shrink-0" />,
    children: [
      {
        href: "/live-operations",
        labelEn: "Operations Overview",
        labelAr: "نظرة عامة",
        icon: <Flame className="size-3.5 shrink-0" />,
      },
      {
        href: "/live-operations/sla-heatmap",
        labelEn: "SLA & Targets",
        labelAr: "مستوى الخدمة والأهداف",
        icon: <Map className="size-3.5 shrink-0" />,
      },
      {
        href: "/live-operations/agent-status",
        labelEn: "Agent Status Board",
        labelAr: "لوحة حالة الوكلاء",
        icon: <MonitorPlay className="size-3.5 shrink-0" />,
      },
    ],
  },
  {
    id: "intelligence",
    labelEn: "Wisal Intelligence",
    labelAr: "ذكاء وصال",
    icon: <BrainCircuit className="size-4 shrink-0" />,
    children: [
      {
        href: "/intelligence",
        labelEn: "AI Performance",
        labelAr: "أداء الذكاء الاصطناعي",
        icon: <TrendingUp className="size-3.5 shrink-0" />,
      },
      {
        href: "/intelligence/risk-safety",
        labelEn: "Risk & Safety",
        labelAr: "المخاطر والسلامة",
        icon: <AlertTriangle className="size-3.5 shrink-0" />,
      },
      {
        href: "/intelligence/caregiver-audit",
        labelEn: "Caregiver Audit",
        labelAr: "تدقيق مقدم الرعاية",
        icon: <UserCheck className="size-3.5 shrink-0" />,
      },
    ],
  },
  {
    id: "governance",
    labelEn: "Governance",
    labelAr: "الحوكمة والامتثال",
    icon: <ShieldCheck className="size-4 shrink-0" />,
    children: [
      {
        href: "/governance",
        labelEn: "Compliance & Audit",
        labelAr: "الامتثال والتدقيق",
        icon: <Award className="size-3.5 shrink-0" />,
      },
      {
        href: "/governance/forbidden-intent",
        labelEn: "Forbidden Intent",
        labelAr: "النوايا المحظورة",
        icon: <Ban className="size-3.5 shrink-0" />,
      },
      {
        href: "/governance/knowledge-base",
        labelEn: "Knowledge Base",
        labelAr: "قاعدة المعرفة",
        icon: <BookOpen className="size-3.5 shrink-0" />,
      },
    ],
  },
  {
    id: "workforce",
    labelEn: "Workforce & Quality",
    labelAr: "القوى العاملة والجودة",
    icon: <Users className="size-4 shrink-0" />,
    children: [
      {
        href: "/workforce",
        labelEn: "Tickets & Agents",
        labelAr: "التذاكر والوكلاء",
        icon: <Ticket className="size-3.5 shrink-0" />,
      },
      {
        href: "/workforce/scheduling",
        labelEn: "Scheduling & QA",
        labelAr: "الجدولة والجودة",
        icon: <Calendar className="size-3.5 shrink-0" />,
      },
      {
        href: "/workforce/training-impact",
        labelEn: "Training Impact",
        labelAr: "أثر التدريب",
        icon: <GraduationCap className="size-3.5 shrink-0" />,
      },
    ],
  },
  {
    id: "executive",
    labelEn: "Executive Rollup",
    labelAr: "ملخص تنفيذي",
    icon: <LineChart className="size-4 shrink-0" />,
    children: [
      {
        href: "/executive",
        labelEn: "KPIs & Rankings",
        labelAr: "المؤشرات والتصنيفات",
        icon: <BarChart2 className="size-3.5 shrink-0" />,
      },
      {
        href: "/executive/insights",
        labelEn: "Voice & Campaigns",
        labelAr: "الصوت والحملات",
        icon: <Heart className="size-3.5 shrink-0" />,
      },
    ],
  },
  {
    id: "operations",
    labelEn: "Operations",
    labelAr: "العمليات والتكاملات",
    icon: <Layers className="size-4 shrink-0" />,
    children: [
      {
        href: "/operations",
        labelEn: "Integration & Health",
        labelAr: "التكاملات وصحة النظام",
        icon: <Network className="size-3.5 shrink-0" />,
      },
      {
        href: "/operations/beneficiary-360",
        labelEn: "Beneficiary 360",
        labelAr: "المستفيد 360",
        icon: <Search className="size-3.5 shrink-0" />,
      },
    ],
  },
];

function NavModuleItem({
  mod,
  pathname,
  isAr,
  collapsed,
  statuses,
}: {
  mod: NavModule
  pathname: string
  isAr: boolean
  collapsed: boolean
  statuses: Record<ModuleId, KpiStatus>
}) {
  const isModuleActive = mod.href
    ? pathname === mod.href || pathname.startsWith(mod.href + "/")
    : mod.children?.some((c) => pathname === c.href)
  const label = isAr ? mod.labelAr : mod.labelEn
  const dotStatus = mod.noStatusDot ? undefined : statuses[mod.id as ModuleId]

  if (mod.href && !mod.children) {
    return (
      <Link
        href={mod.href}
        title={collapsed ? label : undefined}
        aria-current={isModuleActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors duration-150 cursor-pointer min-h-10",
          isModuleActive
            ? "bg-sidebar-accent text-sidebar-primary font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          collapsed && "justify-center",
        )}
      >
        <span className="relative shrink-0">{mod.icon}</span>
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
      </Link>
    )
  }

  return (
    <div className="space-y-0.5">
      {collapsed ? (
        <div className="flex flex-col items-center gap-0.5">
          {/* parent icon — non-clickable section divider */}
          <span
            title={label}
            className="flex items-center justify-center rounded-md px-2 py-1.5 w-full text-primary/60">
            {mod.icon}
          </span>
          {/* child icon links */}
          {mod.children!.map((child) => {
            const childActive = pathname === child.href;
            const childLabel = isAr ? child.labelAr : child.labelEn;
            return (
              <Link
                key={child.href}
                href={child.href}
                title={childLabel}
                aria-current={childActive ? "page" : undefined}
                className={cn(
                  "flex items-center justify-center rounded-md px-2 py-1.5 transition-colors duration-150 w-full min-h-8",
                  childActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}>
                {child.icon}
              </Link>
            );
          })}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 px-2 pt-1 pb-1.5">
            <span
              className={cn(
                "shrink-0 p-1 rounded-md bg-primary/10 text-primary",
              )}>
              {mod.icon}
            </span>
            <span
              className={cn(
                "text-[13px] font-bold tracking-widest uppercase truncate text-primary",
              )}>
              {label}
            </span>
          </div>
          <div className="space-y-0.5 ms-2 border-s border-sidebar-border/60 ps-2">
            {mod.children!.map((child) => {
              const childActive = pathname === child.href;
              const childLabel = isAr ? child.labelAr : child.labelEn;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  aria-current={childActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors duration-150 min-h-8",
                    childActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}>
                  <span
                    className={cn(
                      "shrink-0",
                      childActive
                        ? "text-primary"
                        : "text-sidebar-foreground/40",
                    )}>
                    {child.icon}
                  </span>
                  <span className="flex-1 truncate">{childLabel}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

interface SidebarRailProps {
  statuses: Record<ModuleId, KpiStatus>;
  locale: string;
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarRail({
  statuses,
  locale,
  collapsed,
  onToggle,
}: SidebarRailProps) {
  const pathname = usePathname();
  const isAr = locale === "ar";

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-full bg-sidebar border-e border-sidebar-border transition-all duration-200 ease-out",
        collapsed ? "w-16" : "w-64",
      )}
      aria-label={isAr ? "القائمة الجانبية" : "Sidebar navigation"}>
      {/* Brand */}
      <div
        className={cn(
          "flex items-center h-14 border-b border-sidebar-border shrink-0",
          collapsed ? "justify-center px-0" : "px-4 gap-2.5",
        )}>
        <div className="size-8 rounded-lg overflow-hidden shrink-0">
          <img src="/logo.png" alt="Wisal" className="size-8 object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="block text-sm font-semibold text-sidebar-foreground truncate leading-tight">
              {isAr ? " وصال" : "Wisal CC"}
            </span>
            <span className="block text-[10px] text-sidebar-foreground/40 truncate leading-tight tracking-wide uppercase">
              {isAr ? "لوحة تحكم" : "Command Center"}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
        {NAV_MODULES.map((mod) => (
          <NavModuleItem
            key={mod.id}
            mod={mod}
            pathname={pathname}
            isAr={isAr}
            collapsed={collapsed}
            statuses={statuses}
          />
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2 shrink-0">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-2 w-full rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150 cursor-pointer min-h-10",
            collapsed && "justify-center",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? (
            <ChevronLeft className="size-4" />
          ) : (
            <>
              <ChevronRight className="size-4" />
              <span>{isAr ? "طي القائمة" : "Collapse"}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/* ─── Mobile drawer nav ─── */
interface MobileNavProps {
  statuses: Record<ModuleId, KpiStatus>;
  locale: string;
  onClose?: () => void;
}

export function MobileNav({ statuses, locale, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const isAr = locale === "ar";

  return (
    <nav
      className="flex flex-col gap-3 py-4 px-3"
      aria-label={isAr ? "التنقل" : "Navigation"}>
      {NAV_MODULES.map((mod) => {
        const label = isAr ? mod.labelAr : mod.labelEn;
        const dotStatus = mod.noStatusDot
          ? undefined
          : statuses[mod.id as ModuleId];
        const isModuleActive = mod.href
          ? pathname === mod.href || pathname.startsWith(mod.href + "/")
          : mod.children?.some((c) => pathname === c.href);

        if (mod.href && !mod.children) {
          return (
            <Link
              key={mod.id}
              href={mod.href}
              onClick={onClose}
              aria-current={isModuleActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 min-h-11",
                isModuleActive
                  ? "bg-accent text-primary font-medium"
                  : "text-foreground hover:bg-accent",
              )}>
              {mod.icon}
              <span className="flex-1">{label}</span>
            </Link>
          );
        }

        return (
          <div key={mod.id} className="space-y-0.5">
            {/* Section header */}
            <div className="flex items-center gap-2 px-2 pb-1">
              <span
                className={cn(
                  "shrink-0 p-0.5 rounded",
                  isModuleActive ? "text-primary" : "text-muted-foreground",
                )}>
                {mod.icon}
              </span>
              <span
                className={cn(
                  "text-[11px] font-bold tracking-widest uppercase",
                  isModuleActive ? "text-primary" : "text-muted-foreground",
                )}>
                {label}
              </span>
            </div>
            <div className="ms-3 border-s border-border ps-2 space-y-0.5">
              {mod.children!.map((child) => {
                const childActive = pathname === child.href;
                const childLabel = isAr ? child.labelAr : child.labelEn;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    aria-current={childActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] transition-colors duration-150 min-h-9",
                      childActive
                        ? "bg-accent text-primary font-medium"
                        : "text-foreground/70 hover:bg-accent",
                    )}>
                    <span className="text-muted-foreground">{child.icon}</span>
                    <span className="flex-1">{childLabel}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
