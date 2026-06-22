"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Search } from "lucide-react"
import { format } from "date-fns"
import { status as kpiStatus } from "@/lib/kpi"
import type { AgentRow, AgentTrainingRecord } from "@/lib/queries/workforce"

const STATE_CONFIG: Record<string, { labelAr: string; labelEn: string; className: string }> = {
  AVAILABLE: { labelAr: "متاح", labelEn: "Available", className: "bg-[var(--status-green-bg)] text-[var(--status-green-fg)] border-[var(--status-green)]" },
  ON_CALL: { labelAr: "في مكالمة", labelEn: "On Call", className: "bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border-[var(--status-amber)]" },
  WRAP: { labelAr: "تسوية", labelEn: "Wrap", className: "bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border-[var(--status-amber)]" },
  AFTER_CALL: { labelAr: "ما بعد المكالمة", labelEn: "After Call", className: "bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border-[var(--status-amber)]" },
  BREAK: { labelAr: "استراحة", labelEn: "Break", className: "bg-muted text-muted-foreground border-border" },
  OFFLINE: { labelAr: "غير متصل", labelEn: "Offline", className: "bg-[var(--status-red-bg)] text-[var(--status-red-fg)] border-[var(--status-red)]" },
}

function statusClass(s: "green" | "amber" | "red") {
  if (s === "green") return "text-[var(--status-green-fg)]"
  if (s === "amber") return "text-[var(--status-amber-fg)]"
  return "text-[var(--status-red-fg)]"
}

interface ExpandedRowProps {
  agentId: string
  agentName: string
  training: AgentTrainingRecord[]
  loadTraining: (id: string) => Promise<AgentTrainingRecord[]>
  isAr: boolean
}

function ExpandedRow({ agentId, agentName, training, loadTraining: _load, isAr }: ExpandedRowProps) {
  if (training.length === 0) {
    return (
      <tr>
        <td colSpan={8} className="px-4 py-4 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            {isAr ? `لا توجد سجلات تدريب لـ ${agentName}.` : `No training records for ${agentName}.`}
          </p>
        </td>
      </tr>
    )
  }
  return (
    <tr>
      <td colSpan={8} className="px-4 py-4 bg-muted/20">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          {isAr ? "سجل التدريب" : "Training History"}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[360px]">
            <thead>
              <tr className="border-b border-border">
                <th className="py-1.5 pe-3 text-start font-medium text-muted-foreground">{isAr ? "الوحدة" : "Module"}</th>
                <th className="py-1.5 px-3 text-start font-medium text-muted-foreground">{isAr ? "تاريخ الإتمام" : "Completed"}</th>
                <th className="py-1.5 px-3 text-end font-medium text-muted-foreground tabular-nums">{isAr ? "قبل" : "Before"}</th>
                <th className="py-1.5 px-3 text-end font-medium text-muted-foreground tabular-nums">{isAr ? "بعد" : "After"}</th>
                <th className="py-1.5 ps-3 text-end font-medium text-muted-foreground tabular-nums">Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {training.map((t) => {
                const delta = t.qaScoreAfter - t.qaScoreBefore
                return (
                  <tr key={t.id}>
                    <td className="py-1.5 pe-3 text-foreground">{t.module}</td>
                    <td className="py-1.5 px-3 text-muted-foreground tabular-nums">{format(t.completedAt, "dd MMM yyyy")}</td>
                    <td className="py-1.5 px-3 text-end tabular-nums text-muted-foreground">{t.qaScoreBefore.toFixed(1)}</td>
                    <td className="py-1.5 px-3 text-end tabular-nums text-foreground">{t.qaScoreAfter.toFixed(1)}</td>
                    <td className={`py-1.5 ps-3 text-end tabular-nums font-medium ${delta >= 0 ? "text-[var(--status-green-fg)]" : "text-[var(--status-red-fg)]"}`}>
                      {delta >= 0 ? "+" : ""}{delta.toFixed(1)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  )
}

interface Props {
  agents: AgentRow[]
  trainingMap: Record<string, AgentTrainingRecord[]>
  locale?: string
}

type SortKey = "name" | "aht" | "fcr" | "qaScore" | "csat"
type SortDir = "asc" | "desc"

export function AgentGridClient({ agents, trainingMap, locale = "ar" }: Props) {
  const isAr = locale === "ar"
  const [search, setSearch] = useState("")
  const [teamFilter, setTeamFilter] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const teams = useMemo(() => Array.from(new Set(agents.map((a) => a.team))).sort(), [agents])

  const filtered = useMemo(() => {
    let rows = agents
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.team.toLowerCase().includes(q) ||
          a.clusterName.toLowerCase().includes(q)
      )
    }
    if (teamFilter) rows = rows.filter((a) => a.team === teamFilter)
    return [...rows].sort((a, b) => {
      const aVal = sortKey === "name" ? a.name : (a[sortKey] as number)
      const bVal = sortKey === "name" ? b.name : (b[sortKey] as number)
      const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number)
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [agents, search, teamFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="opacity-30 ms-1">↕</span>
    return <span className="ms-1">{sortDir === "asc" ? "↑" : "↓"}</span>
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "ابحث عن موظف أو فريق أو تجمع…" : "Search agent, team, or cluster…"}
            className="ps-9 h-8 text-sm"
            aria-label="Search agents"
          />
        </div>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="h-8 rounded-md border border-border bg-card text-sm text-foreground px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Filter by team"
        >
          <option value="">{isAr ? "كل الفرق" : "All teams"}</option>
          {teams.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground tabular-nums ms-auto shrink-0">
          {isAr ? `${filtered.length} موظف` : `${filtered.length} agent${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-120 rounded-lg border border-border">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-muted">
              <th className="py-2 ps-3 pe-2 w-8" />
              <th
                className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap"
                onClick={() => toggleSort("name")}
              >
                {isAr ? "الموظف" : "Agent"} <SortIcon k="name" />
              </th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden md:table-cell">{isAr ? "الفريق" : "Team"}</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">{isAr ? "التجمع" : "Cluster"}</th>
              <th
                className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap"
                onClick={() => toggleSort("aht")}
              >
                AHT(s) <SortIcon k="aht" />
              </th>
              <th
                className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap"
                onClick={() => toggleSort("fcr")}
              >
                FCR% <SortIcon k="fcr" />
              </th>
              <th
                className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap"
                onClick={() => toggleSort("qaScore")}
              >
                QA <SortIcon k="qaScore" />
              </th>
              <th
                className="py-2 ps-2 pe-3 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap"
                onClick={() => toggleSort("csat")}
              >
                CSAT% <SortIcon k="csat" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  {isAr ? "لا يوجد موظفون يطابقون بحثك." : "No agents match your search."}
                </td>
              </tr>
            ) : (
              filtered.flatMap((agent) => {
                const isOpen = expanded.has(agent.id)
                const ahtStatus = kpiStatus("AHT", agent.aht)
                const fcrStatus = kpiStatus("FCR", agent.fcr)
                const csatStatus = kpiStatus("CSAT", agent.csat)
                const stateCfg = agent.state ? STATE_CONFIG[agent.state] : null
                const training = trainingMap[agent.id] ?? []

                return [
                  <tr
                    key={agent.id}
                    className="hover:bg-muted/30 transition-colors duration-150 cursor-pointer"
                    onClick={() => toggleExpand(agent.id)}
                  >
                    <td className="py-2.5 ps-3 pe-1">
                      {isOpen
                        ? <ChevronDown className="size-3.5 text-muted-foreground" />
                        : <ChevronRight className="size-3.5 text-muted-foreground" />
                      }
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{agent.name}</span>
                        {stateCfg && (
                          <Badge variant="outline" className={`text-xs shrink-0 ${stateCfg.className}`}>
                            {isAr ? stateCfg.labelAr : stateCfg.labelEn}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-xs text-muted-foreground hidden md:table-cell">{agent.team}</td>
                    <td className="py-2.5 px-2 text-xs text-muted-foreground hidden lg:table-cell">{isAr ? agent.clusterNameAr : agent.clusterName}</td>
                    <td className={`py-2.5 px-2 text-end text-sm tabular-nums font-medium ${statusClass(ahtStatus)}`}>
                      {Math.round(agent.aht)}
                    </td>
                    <td className={`py-2.5 px-2 text-end text-sm tabular-nums font-medium ${statusClass(fcrStatus)}`}>
                      {agent.fcr.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-2 text-end text-sm tabular-nums text-foreground">
                      {agent.qaScore.toFixed(1)}
                    </td>
                    <td className={`py-2.5 ps-2 pe-3 text-end text-sm tabular-nums font-medium ${statusClass(csatStatus)}`}>
                      {agent.csat.toFixed(1)}
                    </td>
                  </tr>,
                  isOpen && (
                    <ExpandedRow
                      key={`${agent.id}-expanded`}
                      agentId={agent.id}
                      agentName={agent.name}
                      training={training}
                      loadTraining={async () => []}
                      isAr={isAr}
                    />
                  ),
                ].filter(Boolean)
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
