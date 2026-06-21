"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { WidgetEmpty } from "@/components/widgets/widget"
import type { CaregiverCaseRow } from "@/lib/queries/intelligence"

const PROXY_LABELS: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: "Confirmed", color: "var(--status-green-fg)" },
  DENIED: { label: "Denied", color: "var(--status-red-fg)" },
  AMBIGUOUS: { label: "Ambiguous", color: "var(--status-amber-fg)" },
}

const ACTION_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  COMPLETED_WITH_CONSENT: { label: "Completed w/ Consent", variant: "outline" },
  FAILCLOSED_HANDOFF: { label: "Fail-Closed Handoff", variant: "destructive" },
}

interface Props {
  rows: CaregiverCaseRow[]
}

export function CaregiverAuditClient({ rows }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const filtered = rows.filter(
    (r) =>
      !search ||
      r.caseId.toLowerCase().includes(search.toLowerCase()) ||
      r.clusterName.toLowerCase().includes(search.toLowerCase())
  )

  if (!rows.length) return <WidgetEmpty message="No caregiver audit cases for this period." />

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        type="search"
        placeholder="Search case ID or cluster…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        aria-label="Search caregiver cases"
      />

      {/* Table — scrollable on mobile */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm min-w-[540px]">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-start py-2 ps-3 pe-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Case ID
              </th>
              <th className="text-start py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cluster
              </th>
              <th className="text-start py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Proxy
              </th>
              <th className="text-start py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Action
              </th>
              <th className="text-start py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Time
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">
                  No results match your search.
                </td>
              </tr>
            )}
            {filtered.map((row) => {
              const isExpanded = expandedId === row.id
              const proxy = PROXY_LABELS[row.proxyConfirmed] ?? { label: row.proxyConfirmed, color: "var(--muted-foreground)" }
              const action = ACTION_LABELS[row.action]

              return (
                <>
                  <tr
                    key={row.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : row.id)}
                    aria-expanded={isExpanded}
                  >
                    <td className="py-2.5 ps-3 pe-2 font-mono text-xs tabular-nums text-foreground">
                      {row.caseId}
                    </td>
                    <td className="py-2.5 px-2 text-xs text-muted-foreground whitespace-nowrap">
                      {row.clusterName}
                    </td>
                    <td className="py-2.5 px-2">
                      <span
                        className="text-xs font-medium"
                        style={{ color: proxy.color }}
                      >
                        {proxy.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      {action ? (
                        <Badge variant={action.variant} className="text-xs whitespace-nowrap">
                          {action.label}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">{row.action}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {row.timestamp.toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 pe-3 ps-1">
                      {isExpanded ? (
                        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                      )}
                    </td>
                  </tr>

                  {/* Inline audit trail */}
                  {isExpanded && (
                    <tr key={`${row.id}-expand`} className="border-b last:border-0 bg-muted/20">
                      <td colSpan={6} className="py-3 ps-6 pe-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                          <ShieldCheck className="size-3.5" aria-hidden />
                          Audit Trail
                        </div>
                        {row.auditTrail.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No audit trail recorded.</p>
                        ) : (
                          <ol className="space-y-1.5 border-s-2 border-[var(--border)] ps-3">
                            {row.auditTrail.map((step, idx) => (
                              <li key={idx} className="text-xs">
                                <span className="font-medium text-foreground">{step.step}</span>
                                {" · "}
                                <span className="text-muted-foreground">{step.actor}</span>
                                {" · "}
                                <span className="text-muted-foreground tabular-nums">
                                  {new Date(step.at).toLocaleString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {step.note && (
                                  <span className="text-muted-foreground"> — {step.note}</span>
                                )}
                              </li>
                            ))}
                          </ol>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {rows.length} cases · Click row to expand audit trail
      </p>
    </div>
  )
}
