"use client"

import { useState, useMemo, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { assignTicketAgent } from "@/lib/actions/workforce"
import type { TicketRow, AgentOption } from "@/lib/queries/workforce"

const PRIORITY_CONFIG: Record<string, { labelAr: string; labelEn: string; className: string; order: number }> = {
  CRITICAL: { labelAr: "حرج", labelEn: "Critical", className: "bg-[var(--status-red-bg)] text-[var(--status-red-fg)] border-[var(--status-red)]", order: 0 },
  HIGH: { labelAr: "عالٍ", labelEn: "High", className: "bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border-[var(--status-amber)]", order: 1 },
  MEDIUM: { labelAr: "متوسط", labelEn: "Medium", className: "bg-muted text-foreground border-border", order: 2 },
  LOW: { labelAr: "منخفض", labelEn: "Low", className: "bg-muted text-muted-foreground border-border", order: 3 },
}

const STATUS_CONFIG: Record<string, { labelAr: string; labelEn: string; className: string }> = {
  OPEN: { labelAr: "مفتوح", labelEn: "Open", className: "bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border-[var(--status-amber)]" },
  IN_PROGRESS: { labelAr: "قيد التنفيذ", labelEn: "In Progress", className: "bg-primary/10 text-primary border-primary/40" },
  ESCALATED: { labelAr: "مُصعَّد", labelEn: "Escalated", className: "bg-[var(--status-red-bg)] text-[var(--status-red-fg)] border-[var(--status-red)]" },
  RESOLVED: { labelAr: "محلول", labelEn: "Resolved", className: "bg-[var(--status-green-bg)] text-[var(--status-green-fg)] border-[var(--status-green)]" },
  CLOSED: { labelAr: "مغلق", labelEn: "Closed", className: "bg-muted text-muted-foreground border-border" },
}

interface AssignCellProps {
  ticket: TicketRow
  agents: AgentOption[]
  isAr: boolean
}

function AssignCell({ ticket, agents, isAr }: AssignCellProps) {
  const [isPending, startTransition] = useTransition()
  const [localAgent, setLocalAgent] = useState(ticket.assignedAgentId ?? "")
  const [saved, setSaved] = useState(false)

  const clusterAgents = agents.filter(
    (a) => !ticket.clusterName || a.clusterId === agents.find((x) => x.id === ticket.assignedAgentId)?.clusterId || true
  )

  function handleAssign(agentId: string) {
    setLocalAgent(agentId)
    setSaved(false)
    startTransition(async () => {
      const fd = new FormData()
      fd.set("ticketId", ticket.id)
      fd.set("agentId", agentId)
      await assignTicketAgent(fd)
      setSaved(true)
    })
  }

  return (
    <div className="flex items-center gap-1.5 min-w-[140px]">
      <select
        value={localAgent}
        onChange={(e) => handleAssign(e.target.value)}
        disabled={isPending}
        className="h-7 flex-1 min-w-0 rounded-md border border-border bg-card text-xs text-foreground px-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        aria-label={`Assign agent to ticket ${ticket.id}`}
      >
        <option value="">{isAr ? "غير مُعيَّن" : "Unassigned"}</option>
        {clusterAgents.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
      {saved && <span className="text-[var(--status-green-fg)] text-xs shrink-0">✓</span>}
    </div>
  )
}

interface Props {
  tickets: TicketRow[]
  agents: AgentOption[]
  locale?: string
}

export function TicketQueueClient({ tickets, agents, locale = "ar" }: Props) {
  const isAr = locale === "ar"
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"" | "COMPLAINT" | "REQUEST">("")
  const [priorityFilter, setPriorityFilter] = useState("")

  const filtered = useMemo(() => {
    let rows = tickets
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.beneficiaryName.toLowerCase().includes(q) ||
          t.clusterName.toLowerCase().includes(q) ||
          (t.assignedAgentName ?? "").toLowerCase().includes(q)
      )
    }
    if (typeFilter) rows = rows.filter((t) => t.type === typeFilter)
    if (priorityFilter) rows = rows.filter((t) => t.priority === priorityFilter)
    return rows
  }, [tickets, search, typeFilter, priorityFilter])

  const breachedCount = filtered.filter((t) => t.slaBreached).length

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "ابحث عن تذكرة أو مستفيد…" : "Search ticket or beneficiary…"}
            className="ps-9 h-8 text-sm"
            aria-label="Search tickets"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "" | "COMPLAINT" | "REQUEST")}
          className="h-8 rounded-md border border-border bg-card text-sm text-foreground px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Filter by type"
        >
          <option value="">{isAr ? "كل الأنواع" : "All types"}</option>
          <option value="COMPLAINT">{isAr ? "شكوى" : "Complaint"}</option>
          <option value="REQUEST">{isAr ? "طلب" : "Request"}</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-8 rounded-md border border-border bg-card text-sm text-foreground px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Filter by priority"
        >
          <option value="">{isAr ? "كل الأولويات" : "All priorities"}</option>
          <option value="CRITICAL">{isAr ? "حرج" : "Critical"}</option>
          <option value="HIGH">{isAr ? "عالٍ" : "High"}</option>
          <option value="MEDIUM">{isAr ? "متوسط" : "Medium"}</option>
          <option value="LOW">{isAr ? "منخفض" : "Low"}</option>
        </select>
        <div className="flex items-center gap-1.5 ms-auto shrink-0 text-xs text-muted-foreground">
          {breachedCount > 0 && (
            <span className="flex items-center gap-1 text-[var(--status-red-fg)]">
              <AlertCircle className="size-3.5" aria-hidden />
              {isAr ? `${breachedCount} خرق SLA` : `${breachedCount} SLA breach${breachedCount !== 1 ? "es" : ""}`}
            </span>
          )}
          <span className="tabular-nums">{isAr ? `${filtered.length} تذكرة` : `${filtered.length} ticket${filtered.length !== 1 ? "s" : ""}`}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-120 rounded-lg border border-border">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-muted">
              <th className="py-2 ps-3 pe-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{isAr ? "التذكرة" : "Ticket"}</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden md:table-cell">{isAr ? "المستفيد" : "Beneficiary"}</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{isAr ? "النوع" : "Type"}</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{isAr ? "الأولوية" : "Priority"}</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{isAr ? "الحالة" : "Status"}</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{isAr ? "موعد SLA" : "SLA Due"}</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{isAr ? "تعيين موظف" : "Assign Agent"}</th>
              <th className="py-2 ps-2 pe-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">{isAr ? "التصعيد" : "Escalation"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  {isAr ? "لا توجد تذاكر تطابق بحثك." : "No tickets match your search."}
                </td>
              </tr>
            ) : (
              filtered.map((ticket) => {
                const priCfg = PRIORITY_CONFIG[ticket.priority]
                const stsCfg = STATUS_CONFIG[ticket.status]
                const slaClass = ticket.slaBreached
                  ? "text-[var(--status-red-fg)] font-medium"
                  : "text-muted-foreground"

                return (
                  <tr
                    key={ticket.id}
                    className={`hover:bg-muted/30 transition-colors duration-150 ${ticket.slaBreached ? "bg-[var(--status-red-bg)]/30" : ""}`}
                  >
                    <td className="py-2.5 ps-3 pe-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs tabular-nums text-foreground">{ticket.id.slice(-8)}</span>
                        <a
                          href={`/operations?beneficiaryId=${ticket.beneficiaryId}`}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title={isAr ? "عرض الملف الشامل للمستفيد" : "View beneficiary 360 profile"}
                          aria-label={isAr ? "فتح الملف الشامل للمستفيد" : "Open beneficiary 360 profile"}
                        >
                          <ExternalLink className="size-3" aria-hidden />
                        </a>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-xs text-muted-foreground whitespace-nowrap hidden md:table-cell">
                      {ticket.beneficiaryName}
                    </td>
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">
                        {ticket.type === "COMPLAINT" ? (isAr ? "شكوى" : "Complaint") : (isAr ? "طلب" : "Request")}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      <Badge variant="outline" className={`text-xs ${priCfg.className}`}>
                        {isAr ? priCfg.labelAr : priCfg.labelEn}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      <Badge variant="outline" className={`text-xs ${stsCfg.className}`}>
                        {isAr ? stsCfg.labelAr : stsCfg.labelEn}
                      </Badge>
                    </td>
                    <td className={`py-2.5 px-2 text-xs tabular-nums whitespace-nowrap ${slaClass}`}>
                      {format(ticket.slaDueAt, "dd MMM HH:mm")}
                      {ticket.slaBreached && (
                        <AlertCircle className="inline size-3 ms-1" aria-label="SLA breached" />
                      )}
                    </td>
                    <td className="py-2.5 px-2">
                      <AssignCell ticket={ticket} agents={agents} isAr={isAr} />
                    </td>
                    <td className="py-2.5 ps-2 pe-3 text-xs text-muted-foreground hidden lg:table-cell max-w-[140px] truncate">
                      {ticket.escalationPath ?? "—"}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground text-end tabular-nums">
        {isAr
          ? `${filtered.length} من ${tickets.length} تذكرة · مرتب حسب الأولوية + موعد SLA`
          : `${filtered.length} of ${tickets.length} tickets · sorted by priority + SLA due`}
      </p>
    </div>
  )
}
