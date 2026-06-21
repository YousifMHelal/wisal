"use client"

import { Badge } from "@/components/ui/badge"
import { Download, ExternalLink, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import type { ComplianceCard } from "@/lib/queries/governance"

const FRAMEWORK_META: Record<string, { label: string; description: string; logLink: string }> = {
  NCA: {
    label: "NCA",
    description: "الهيئة الوطنية للأمن السيبراني",
    logLink: "/governance?filter=nca",
  },
  PDPL: {
    label: "PDPL",
    description: "نظام حماية البيانات الشخصية",
    logLink: "/governance?filter=pdpl",
  },
  DGA: {
    label: "DGA",
    description: "هيئة الحكومة الرقمية",
    logLink: "/governance?filter=dga",
  },
  NDMO: {
    label: "NDMO",
    description: "المكتب الوطني لإدارة البيانات",
    logLink: "/governance?filter=ndmo",
  },
}

const STATUS_CONFIG = {
  COMPLIANT: {
    label: "ملتزم",
    icon: CheckCircle2,
    className: "bg-status-green/15 text-status-green-fg border-status-green/30",
    ringClass: "ring-status-green/20",
    scoreClass: "text-status-green-fg",
  },
  PARTIAL: {
    label: "جزئي",
    icon: AlertTriangle,
    className: "bg-status-amber/15 text-status-amber-fg border-status-amber/30",
    ringClass: "ring-status-amber/20",
    scoreClass: "text-status-amber-fg",
  },
  NON_COMPLIANT: {
    label: "غير ملتزم",
    icon: XCircle,
    className: "bg-status-red/15 text-status-red-fg border-status-red/30",
    ringClass: "ring-status-red/20",
    scoreClass: "text-status-red-fg",
  },
} as const

interface Props {
  cards: ComplianceCard[]
  packExportUrl: string
}

export function ComplianceScorecardClient({ cards, packExportUrl }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Export full pack */}
      <div className="flex justify-end">
        <a
          href={packExportUrl}
          download
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-transparent text-sm font-medium text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
        >
          <Download className="size-3.5" aria-hidden />
          حزمة الامتثال
        </a>
      </div>

      {/* Card grid: 1 col mobile, 2 col sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((card) => {
          const meta = FRAMEWORK_META[card.framework]
          const cfg = STATUS_CONFIG[card.status]
          const Icon = cfg.icon

          return (
            <div
              key={card.id}
              className={`rounded-xl border bg-card p-4 flex flex-col gap-3 ring-2 ${cfg.ringClass} transition-shadow duration-150 hover:shadow-md`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground">{meta?.label ?? card.framework}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{meta?.description ?? ""}</p>
                </div>
                <Badge variant="outline" className={`shrink-0 text-xs font-medium gap-1 ${cfg.className}`}>
                  <Icon className="size-3" aria-hidden />
                  {cfg.label}
                </Badge>
              </div>

              {/* Score */}
              <div className="flex items-end gap-2">
                <p className={`text-3xl font-semibold tabular-nums ${cfg.scoreClass}`}>
                  {Math.round(card.score)}
                  <span className="text-lg font-normal text-muted-foreground">%</span>
                </p>
                {/* Score bar */}
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${card.score}%`,
                      background:
                        card.status === "COMPLIANT"
                          ? "var(--color-status-green)"
                          : card.status === "PARTIAL"
                          ? "var(--color-status-amber)"
                          : "var(--color-status-red)",
                    }}
                    role="progressbar"
                    aria-valuenow={Math.round(card.score)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${card.framework} compliance score: ${Math.round(card.score)}%`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  تحديث {format(card.refreshedAt, "dd MMM yyyy")}
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/export/compliance-pack?framework=${card.framework}`}
                    download
                    aria-label={`Export ${card.framework} compliance data`}
                    className="inline-flex items-center gap-1 h-6 px-2 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
                  >
                    <Download className="size-3" aria-hidden />
                    تصدير
                  </a>
                  {meta?.logLink && (
                    <Link
                      href={meta.logLink}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      aria-label={`View ${card.framework} supporting logs`}
                    >
                      <ExternalLink className="size-3" aria-hidden />
                      السجلات
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {cards.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات امتثال متاحة.</p>
      )}
    </div>
  )
}
