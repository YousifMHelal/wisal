"use client"

import {
  Activity,
  BrainCircuit,
  ShieldCheck,
  Users,
  LineChart,
  Layers,
  Phone,
  AlertTriangle,
  TrendingUp,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/ui/status-badge"
import { cn } from "@/lib/utils"
import type { OverviewHeroStats } from "@/lib/queries/overview"

// ── Hero KPI Cards ─────────────────────────────────────────────────────────────

interface HeroStatsProps {
  stats: OverviewHeroStats
}

export function OverviewHeroStats({ stats }: HeroStatsProps) {
  const cards = [
    {
      key: "sl",
      label: "Service Level",
      labelAr: "مستوى الخدمة",
      value: `${stats.serviceLevel.value.toFixed(1)}%`,
      target: "≥ 80%",
      status: stats.serviceLevel.status,
      icon: <TrendingUp className="size-4" />,
    },
    {
      key: "abn",
      label: "Abandoned Calls",
      labelAr: "المكالمات المتروكة",
      value: `${stats.abandonedCalls.value.toFixed(1)}%`,
      target: "≤ 5%",
      status: stats.abandonedCalls.status,
      icon: <Phone className="size-4" />,
    },
    {
      key: "fcr",
      label: "First Contact Resolution",
      labelAr: "الحل من أول اتصال",
      value: `${stats.fcr.value.toFixed(1)}%`,
      target: "≥ 90%",
      status: stats.fcr.status,
      icon: <Zap className="size-4" />,
    },
    {
      key: "incidents",
      label: "Active Incidents",
      labelAr: "الحوادث النشطة",
      value: String(stats.activeIncidents.total),
      target: `${stats.activeIncidents.critical}C · ${stats.activeIncidents.warning}W`,
      status: stats.activeIncidents.status,
      icon: <AlertTriangle className="size-4" />,
    },
  ] as const

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className={cn(
            "rounded-xl border bg-card p-4 flex flex-col gap-3",
            "shadow-[0_1px_3px_rgba(0,0,0,0.12)] dark:shadow-none",
            "relative overflow-hidden",
            // status stripe on inline-start edge
            card.status === "green" && "border-s-2 border-s-status-green",
            card.status === "amber" && "border-s-2 border-s-status-amber",
            card.status === "red"   && "border-s-2 border-s-status-red",
          )}
        >
          {/* Icon + status badge row */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "p-1.5 rounded-lg",
                card.status === "green" && "bg-status-green-bg text-status-green-fg",
                card.status === "amber" && "bg-status-amber-bg text-status-amber-fg",
                card.status === "red"   && "bg-status-red-bg text-status-red-fg",
              )}
            >
              {card.icon}
            </span>
            <StatusBadge status={card.status} />
          </div>

          {/* Big metric */}
          <div>
            <p className="text-3xl font-semibold tabular-nums text-foreground leading-none">
              {card.value}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              <span lang="en" className="[html[dir=rtl]_&]:hidden">{card.label}</span>
              <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">{card.labelAr}</span>
            </p>
          </div>

          {/* Target */}
          <p className="text-[10px] text-muted-foreground border-t border-border/60 pt-2 tabular-nums">
            {card.target}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── Module Quick Links ─────────────────────────────────────────────────────────

const MODULES = [
  {
    id: "live-operations",
    href: "/live-operations",
    label: "Live Operations",
    labelAr: "العمليات الحية",
    desc: "SLA, incidents, channels",
    descAr: "مستوى الخدمة والحوادث والقنوات",
    icon: <Activity className="size-5" />,
    color: "text-primary",
    bg: "bg-primary/10 hover:bg-primary/20",
  },
  {
    id: "intelligence",
    href: "/intelligence",
    label: "Wisal Intelligence",
    labelAr: "ذكاء وصال",
    desc: "AI tiers, drift, kill switch",
    descAr: "طبقات الذكاء الاصطناعي والانجراف",
    icon: <BrainCircuit className="size-5" />,
    color: "text-violet-400",
    bg: "bg-violet-500/10 hover:bg-violet-500/20",
  },
  {
    id: "governance",
    href: "/governance",
    label: "Governance",
    labelAr: "الحوكمة والامتثال",
    desc: "Compliance, approvals, consent",
    descAr: "الامتثال والموافقات والموافقة",
    icon: <ShieldCheck className="size-5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20",
  },
  {
    id: "workforce",
    href: "/workforce",
    label: "Workforce & Quality",
    labelAr: "القوى العاملة والجودة",
    desc: "Agents, schedules, QA",
    descAr: "الوكلاء والجداول والجودة",
    icon: <Users className="size-5" />,
    color: "text-sky-400",
    bg: "bg-sky-500/10 hover:bg-sky-500/20",
  },
  {
    id: "executive",
    href: "/executive",
    label: "Executive Rollup",
    labelAr: "ملخص تنفيذي",
    desc: "KPIs, ranking, savings",
    descAr: "المؤشرات والترتيب والمدخرات",
    icon: <LineChart className="size-5" />,
    color: "text-amber-400",
    bg: "bg-amber-500/10 hover:bg-amber-500/20",
  },
  {
    id: "operations",
    href: "/operations",
    label: "Operations",
    labelAr: "العمليات والتكاملات",
    desc: "Integrations, health, 360",
    descAr: "التكاملات والصحة و360",
    icon: <Layers className="size-5" />,
    color: "text-rose-400",
    bg: "bg-rose-500/10 hover:bg-rose-500/20",
  },
]

export function ModuleQuickLinks() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {MODULES.map((mod) => (
        <Link
          key={mod.id}
          href={mod.href}
          className={cn(
            "rounded-xl border bg-card p-4 flex flex-col gap-3 min-h-11",
            "transition-colors duration-150 cursor-pointer",
            "shadow-[0_1px_3px_rgba(0,0,0,0.12)] dark:shadow-none",
            "hover:border-primary/30",
            "group focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
          )}
        >
          <span className={cn("p-2 rounded-lg w-fit", mod.bg, mod.color, "transition-colors duration-150")}>
            {mod.icon}
          </span>
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate leading-snug group-hover:text-primary transition-colors">
              <span lang="en" className="[html[dir=rtl]_&]:hidden">{mod.label}</span>
              <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">{mod.labelAr}</span>
            </p>
            <p className="text-[10px] text-muted-foreground leading-snug truncate">
              <span lang="en" className="[html[dir=rtl]_&]:hidden">{mod.desc}</span>
              <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">{mod.descAr}</span>
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
