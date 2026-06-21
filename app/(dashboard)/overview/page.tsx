import type { Metadata } from "next"
import { Suspense } from "react"
import { parseFilters } from "@/lib/filters"
import { Widget, WidgetSkeleton } from "@/components/widgets/widget"
import { WidgetErrorBoundary } from "@/components/widgets/widget-error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getOverviewHeroStats,
  getOverviewSlaTrend,
  getOverviewAiResolution,
  getOverviewClusterHealth,
  getOverviewChannelVolume,
} from "@/lib/queries/overview"
import { getActiveIncidents } from "@/lib/queries/live-operations"
import { OverviewHeroStats, ModuleQuickLinks } from "@/components/widgets/overview/overview-hero-client"
import { SlaTrendChart, AiResolutionDonut, ChannelVolumeBar, ClusterHealthList } from "@/components/widgets/overview/overview-charts-client"
import { OverviewIncidentsMini } from "@/components/widgets/overview/overview-incidents-client"

export const metadata: Metadata = { title: "Overview — Wisal Command Center" }

export const revalidate = 30

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// ── Hero Stats ─────────────────────────────────────────────────────────────────

async function HeroSection({ filters }: { filters: ReturnType<typeof parseFilters> }) {
  const stats = await getOverviewHeroStats(filters)
  return <OverviewHeroStats stats={stats} />
}

function HeroSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  )
}

// ── SLA Trend ─────────────────────────────────────────────────────────────────

async function SlaTrendSection({ filters }: { filters: ReturnType<typeof parseFilters> }) {
  const data = await getOverviewSlaTrend(filters)
  return (
    <Widget
      title="National SLA Trend"
      titleAr="اتجاه مستوى الخدمة الوطني"
      footer={
        <span>
          <span lang="en" className="[html[dir=rtl]_&]:hidden">7-day service level · dashed line = 80% target</span>
          <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">مستوى الخدمة لـ 7 أيام · الخط المتقطع = هدف 80%</span>
        </span>
      }
    >
      <SlaTrendChart data={data} />
    </Widget>
  )
}

// ── AI Resolution ─────────────────────────────────────────────────────────────

async function AiResolutionSection({ filters }: { filters: ReturnType<typeof parseFilters> }) {
  const data = await getOverviewAiResolution(filters)
  return (
    <Widget
      title="AI Resolution Split"
      titleAr="توزيع الحل بالذكاء الاصطناعي"
    >
      <AiResolutionDonut data={data} />
    </Widget>
  )
}

// ── Active Incidents Mini ──────────────────────────────────────────────────────

async function IncidentsSection({ filters }: { filters: ReturnType<typeof parseFilters> }) {
  const incidents = await getActiveIncidents(filters)
  const criticalCount = incidents.filter((i) => i.severity === "CRITICAL").length
  const warningCount = incidents.filter((i) => i.severity === "WARNING").length

  return (
    <Widget
      title="Active Incidents"
      titleAr="الحوادث النشطة"
      actions={
        incidents.length > 0 ? (
          <span className="text-xs text-muted-foreground tabular">
            {criticalCount > 0 && (
              <span className="text-status-red-fg me-2">{criticalCount}C</span>
            )}
            {warningCount > 0 && (
              <span className="text-status-amber-fg">{warningCount}W</span>
            )}
          </span>
        ) : undefined
      }
      footer={
        incidents.length > 0 ? (
          <a href="/live-operations" className="text-primary hover:underline text-xs">
            <span lang="en" className="[html[dir=rtl]_&]:hidden">View all in Live Operations →</span>
            <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">عرض الكل في العمليات الحية →</span>
          </a>
        ) : undefined
      }
    >
      <OverviewIncidentsMini incidents={incidents} />
    </Widget>
  )
}

// ── Cluster Health ─────────────────────────────────────────────────────────────

async function ClusterHealthSection({ filters }: { filters: ReturnType<typeof parseFilters> }) {
  const { top5, bottom5, total } = await getOverviewClusterHealth(filters)
  return (
    <Widget
      title="Cluster Health"
      titleAr="صحة التجمعات"
      footer={
        <a href="/executive" className="text-primary hover:underline text-xs">
          <span lang="en" className="[html[dir=rtl]_&]:hidden">Full ranking in Executive →</span>
          <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">الترتيب الكامل في ملخص تنفيذي →</span>
        </a>
      }
    >
      <ClusterHealthList top5={top5} bottom5={bottom5} total={total} />
    </Widget>
  )
}

// ── Channel Volume ─────────────────────────────────────────────────────────────

async function ChannelVolumeSection({ filters }: { filters: ReturnType<typeof parseFilters> }) {
  const data = await getOverviewChannelVolume(filters)
  return (
    <Widget
      title="Channel Volume"
      titleAr="حجم القنوات"
      footer={
        <span>
          <span lang="en" className="[html[dir=rtl]_&]:hidden">Volume by channel type · color = wait time status</span>
          <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">الحجم حسب نوع القناة · اللون = حالة وقت الانتظار</span>
        </span>
      }
    >
      <ChannelVolumeBar data={data} />
    </Widget>
  )
}

// ── Quick Links ────────────────────────────────────────────────────────────────

function QuickLinksSection() {
  return (
    <Widget
      title="Navigate Modules"
      titleAr="التنقل بين الوحدات"
    >
      <ModuleQuickLinks />
    </Widget>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function OverviewPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters = parseFilters(params)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          <span lang="en" className="[html[dir=rtl]_&]:hidden">Dashboard Overview</span>
          <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">نظرة عامة على لوحة التحكم</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          <span lang="en" className="[html[dir=rtl]_&]:hidden">National CRM performance snapshot across all modules</span>
          <span lang="ar" className="hidden [html[dir=rtl]_&]:inline">لقطة أداء الـ CRM الوطني عبر جميع الوحدات</span>
        </p>
      </div>

      {/* Row 1: Hero KPI cards */}
      <WidgetErrorBoundary widgetTitle="Overview Hero Stats">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection filters={filters} />
        </Suspense>
      </WidgetErrorBoundary>

      {/* Row 2: SLA Trend + AI Resolution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <WidgetErrorBoundary widgetTitle="National SLA Trend">
          <Suspense fallback={<WidgetSkeleton />}>
            <SlaTrendSection filters={filters} />
          </Suspense>
        </WidgetErrorBoundary>

        <WidgetErrorBoundary widgetTitle="AI Resolution Split">
          <Suspense fallback={<WidgetSkeleton />}>
            <AiResolutionSection filters={filters} />
          </Suspense>
        </WidgetErrorBoundary>
      </div>

      {/* Row 3: Active Incidents + Cluster Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <WidgetErrorBoundary widgetTitle="Active Incidents">
          <Suspense fallback={<WidgetSkeleton />}>
            <IncidentsSection filters={filters} />
          </Suspense>
        </WidgetErrorBoundary>

        <WidgetErrorBoundary widgetTitle="Cluster Health">
          <Suspense fallback={<WidgetSkeleton />}>
            <ClusterHealthSection filters={filters} />
          </Suspense>
        </WidgetErrorBoundary>
      </div>

      {/* Row 4: Channel Volume — full width */}
      <WidgetErrorBoundary widgetTitle="Channel Volume">
        <Suspense fallback={<WidgetSkeleton />}>
          <ChannelVolumeSection filters={filters} />
        </Suspense>
      </WidgetErrorBoundary>

      {/* Row 5: Module quick links — full width */}
      <QuickLinksSection />
    </div>
  )
}
