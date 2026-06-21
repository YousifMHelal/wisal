"use client"

import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowUpDown, ArrowUp, ArrowDown, Medal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { status as deriveStatus, type KpiKey } from "@/lib/kpi"
import type { ClusterRankingRow } from "@/lib/queries/executive"
import { cn } from "@/lib/utils"

type SortKey = "rank" | "compositeScore" | string

const KPI_COLUMNS: { key: string; label: string; kpiKey: KpiKey; unit: string }[] = [
  { key: "SERVICE_LEVEL", label: "SL", kpiKey: "SERVICE_LEVEL", unit: "%" },
  { key: "FCR", label: "FCR", kpiKey: "FCR", unit: "%" },
  { key: "CSAT", label: "CSAT", kpiKey: "CSAT", unit: "%" },
  { key: "AHT", label: "AHT", kpiKey: "AHT", unit: "s" },
  { key: "ABANDONED_CALLS", label: "Abn", kpiKey: "ABANDONED_CALLS", unit: "%" },
]

function formatKpi(key: KpiKey, value: number | undefined): string {
  if (value == null) return "—"
  if (key === "AHT") return value >= 60 ? `${(value / 60).toFixed(1)}m` : `${value.toFixed(0)}s`
  return `${value.toFixed(1)}%`
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="size-3 opacity-40" />
  if (dir === "asc") return <ArrowUp className="size-3" />
  return <ArrowDown className="size-3" />
}

interface Props {
  rows: ClusterRankingRow[]
}

export function ClusterRankingClient({ rows }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sortKey, setSortKey] = useState<SortKey>("compositeScore")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let va: number, vb: number
      if (sortKey === "compositeScore") {
        va = a.compositeScore; vb = b.compositeScore
      } else {
        va = (a.perKpi[sortKey] as number) ?? 0
        vb = (b.perKpi[sortKey] as number) ?? 0
      }
      return sortDir === "desc" ? vb - va : va - vb
    })
  }, [rows, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  function handleClusterClick(clusterId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("cluster", clusterId)
    router.push(`?${params.toString()}`)
  }

  function rankBadge(rank: number) {
    if (rank === 1) return <Medal className="size-4 text-yellow-500" aria-label="1st" />
    if (rank === 2) return <Medal className="size-4 text-slate-400" aria-label="2nd" />
    if (rank === 3) return <Medal className="size-4 text-amber-700" aria-label="3rd" />
    return <span className="text-xs tabular-nums text-muted-foreground w-4 text-center">{rank}</span>
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[540px] text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 ps-2 pe-1 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide w-8">#</th>
            <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <button
                onClick={() => toggleSort("compositeScore")}
                className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
              >
                Cluster <SortIcon active={sortKey === "compositeScore"} dir={sortDir} />
              </button>
            </th>
            <th className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <button
                onClick={() => toggleSort("compositeScore")}
                className="flex items-center gap-1 ms-auto hover:text-foreground transition-colors cursor-pointer"
              >
                Score <SortIcon active={sortKey === "compositeScore"} dir={sortDir} />
              </button>
            </th>
            {KPI_COLUMNS.map((col) => (
              <th key={col.key} className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                <button
                  onClick={() => toggleSort(col.key)}
                  className="flex items-center gap-1 ms-auto hover:text-foreground transition-colors cursor-pointer"
                >
                  {col.label} <SortIcon active={sortKey === col.key} dir={sortDir} />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.id}
              onClick={() => handleClusterClick(row.clusterId)}
              className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
            >
              <td className="py-2.5 ps-2 pe-1">
                {rankBadge(i + 1)}
              </td>
              <td className="py-2.5 px-2 font-medium text-foreground group-hover:text-primary transition-colors">
                <span className="[html[dir=rtl]_&]:hidden">{row.clusterName}</span>
                <span className="hidden [html[dir=rtl]_&]:inline">{row.clusterNameAr}</span>
              </td>
              <td className="py-2.5 px-2 text-end tabular-nums font-semibold text-foreground">
                {(row.compositeScore * 100).toFixed(1)}
              </td>
              {KPI_COLUMNS.map((col) => {
                const val = row.perKpi[col.key] as number | undefined
                const st = val != null ? deriveStatus(col.kpiKey, val) : null
                return (
                  <td key={col.key} className="py-2.5 px-2 text-end tabular-nums hidden md:table-cell">
                    {st ? (
                      <span className={cn(
                        "text-xs",
                        st === "green" && "text-status-green-fg",
                        st === "amber" && "text-status-amber-fg",
                        st === "red"   && "text-status-red-fg",
                      )}>
                        {formatKpi(col.kpiKey, val)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
