"use client"

import { useState, useMemo, useTransition } from "react"
import { AlertTriangle, CheckCircle2, Download, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportPenaltyReport } from "@/lib/actions/executive"
import type { PenaltyRow } from "@/lib/queries/executive"
import type { Filters } from "@/lib/filters"
import { cn } from "@/lib/utils"

type SortKey = "clusterName" | "kpi" | "failurePct" | "permissibleTolerance" | "penaltyAmount"

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="size-3 opacity-40" />
  if (dir === "asc") return <ArrowUp className="size-3" />
  return <ArrowDown className="size-3" />
}

interface Props {
  rows: PenaltyRow[]
  filters: Filters
}

export function PenaltyImpactClient({ rows, filters }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("penaltyAmount")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [showBreachedOnly, setShowBreachedOnly] = useState(false)
  const [isPending, startTransition] = useTransition()

  const sorted = useMemo(() => {
    const base = showBreachedOnly ? rows.filter((r) => r.breached) : rows
    return [...base].sort((a, b) => {
      let va: string | number, vb: string | number
      if (sortKey === "clusterName") { va = a.clusterName; vb = b.clusterName }
      else if (sortKey === "kpi") { va = a.kpi; vb = b.kpi }
      else if (sortKey === "failurePct") { va = a.failurePct; vb = b.failurePct }
      else if (sortKey === "permissibleTolerance") { va = a.permissibleTolerance; vb = b.permissibleTolerance }
      else { va = a.penaltyAmount; vb = b.penaltyAmount }

      if (typeof va === "string") {
        return sortDir === "asc" ? va.localeCompare(vb as string) : (vb as string).localeCompare(va)
      }
      return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number)
    })
  }, [rows, sortKey, sortDir, showBreachedOnly])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    else { setSortKey(key); setSortDir("desc") }
  }

  function handleExport() {
    startTransition(async () => {
      const fd = new FormData()
      if (filters.cluster) fd.set("cluster", filters.cluster)
      fd.set("range", filters.range)
      if (filters.from) fd.set("from", filters.from.toISOString().slice(0, 10))
      if (filters.to) fd.set("to", filters.to.toISOString().slice(0, 10))
      const result = await exportPenaltyReport(fd)
      if (result?.csv) {
        downloadCsv(result.csv, `penalty-report-${new Date().toISOString().slice(0, 10)}.csv`)
      }
    })
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center min-h-[120px]">
        <p className="text-sm text-muted-foreground">No penalty records for this period.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => setShowBreachedOnly((v) => !v)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
            showBreachedOnly
              ? "bg-[var(--status-red-bg)] text-[var(--status-red-fg)]"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {showBreachedOnly ? "Showing breaches only" : "Show breaches only"}
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isPending}
          className="gap-2 cursor-pointer"
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          Export
        </Button>
      </div>

      {/* table */}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[620px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 ps-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button onClick={() => toggleSort("clusterName")} className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
                  Cluster <SortIcon active={sortKey === "clusterName"} dir={sortDir} />
                </button>
              </th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button onClick={() => toggleSort("kpi")} className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
                  KPI <SortIcon active={sortKey === "kpi"} dir={sortDir} />
                </button>
              </th>
              <th className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button onClick={() => toggleSort("failurePct")} className="flex items-center gap-1 ms-auto hover:text-foreground transition-colors cursor-pointer">
                  Failure % <SortIcon active={sortKey === "failurePct"} dir={sortDir} />
                </button>
              </th>
              <th className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                <button onClick={() => toggleSort("permissibleTolerance")} className="flex items-center gap-1 ms-auto hover:text-foreground transition-colors cursor-pointer">
                  Tolerance <SortIcon active={sortKey === "permissibleTolerance"} dir={sortDir} />
                </button>
              </th>
              <th className="py-2 px-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">Breach</th>
              <th className="py-2 pe-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button onClick={() => toggleSort("penaltyAmount")} className="flex items-center gap-1 ms-auto hover:text-foreground transition-colors cursor-pointer">
                  Penalty (SAR) <SortIcon active={sortKey === "penaltyAmount"} dir={sortDir} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 50).map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border/50 transition-colors",
                  row.breached ? "bg-[var(--status-red-bg)]/30 hover:bg-[var(--status-red-bg)]/50" : "hover:bg-muted/30"
                )}
              >
                <td className="py-2.5 ps-2 font-medium text-foreground">
                  <span className="[html[dir=rtl]_&]:hidden">{row.clusterName}</span>
                  <span className="hidden [html[dir=rtl]_&]:inline">{row.clusterNameAr}</span>
                </td>
                <td className="py-2.5 px-2 text-xs text-muted-foreground">{row.kpi.replace(/_/g, " ")}</td>
                <td className={cn(
                  "py-2.5 px-2 text-end tabular-nums font-medium",
                  row.breached ? "text-[var(--status-red-fg)]" : "text-foreground"
                )}>
                  {row.failurePct.toFixed(2)}%
                </td>
                <td className="py-2.5 px-2 text-end tabular-nums text-muted-foreground hidden md:table-cell">
                  {row.permissibleTolerance.toFixed(2)}%
                </td>
                <td className="py-2.5 px-2 text-center">
                  {row.breached ? (
                    <AlertTriangle
                      className="size-4 text-[var(--status-red-fg)] mx-auto"
                      aria-label="Breached"
                    />
                  ) : (
                    <CheckCircle2
                      className="size-4 text-[var(--status-green-fg)] mx-auto"
                      aria-label="Within tolerance"
                    />
                  )}
                </td>
                <td className={cn(
                  "py-2.5 pe-2 text-end tabular-nums font-semibold",
                  row.breached ? "text-[var(--status-red-fg)]" : "text-muted-foreground"
                )}>
                  {row.breached
                    ? row.penaltyAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length > 50 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Showing 50 of {sorted.length} records · export for full dataset
          </p>
        )}
      </div>
    </div>
  )
}
