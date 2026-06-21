"use client"

import { useState, useMemo, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { assignTicketAgent } from "@/lib/actions/workforce"
import type { TicketRow, AgentOption } from "@/lib/queries/workforce"

const PRIORITY_CONFIG: Record<string, { label: string; className: string; order: number }> = {
  CRITICAL: { label: "حرج", className: "bg-[var(--status-red-bg)] text-[var(--status-red-fg)] border-[var(--status-red)]", order: 0 },
  HIGH: { label: "عالٍ", className: "bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border-[var(--status-amber)]", order: 1 },
  MEDIUM: { label: "متوسط", className: "bg-muted text-foreground border-border", order: 2 },
  LOW: { label: "منخفض", className: "bg-muted text-muted-foreground border-border", order: 3 },
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  OPEN: { label: "مفتوح", className: "bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border-[var(--status-amber)]" },
  IN_PROGRESS: { label: "قيد التنفيذ", className: "bg-primary/10 text-primary border-primary/40" },
  ESCALATED: { label: "مُصعَّد", className: "bg-[var(--status-red-bg)] text-[var(--status-red-fg)] border-[var(--status-red)]" },
  RESOLVED: { label: "محلول", className: "bg-[var(--status-green-bg)] text-[var(--status-green-fg)] border-[var(--status-green)]" },
  CLOSED: { label: "مغلق", className: "bg-muted text-muted-foreground border-border" },
}

interface AssignCellProps {
  ticket: TicketRow
  agents: AgentOption[]
}

function AssignCell({ ticket, agents }: AssignCellProps) {
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
        <option value="">غير مُعيَّن</option>
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
}

export function TicketQueueClient({ tickets, agents }: Props) {
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
            placeholder="ابحث عن تذكرة أو مستفيد…"
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
          <option value="">كل الأنواع</option>
          <option value="COMPLAINT">شكوى</option>
          <option value="REQUEST">طلب</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-8 rounded-md border border-border bg-card text-sm text-foreground px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Filter by priority"
        >
          <option value="">كل الأولويات</option>
          <option value="CRITICAL">حرج</option>
          <option value="HIGH">عالٍ</option>
          <option value="MEDIUM">متوسط</option>
          <option value="LOW">منخفض</option>
        </select>
        <div className="flex items-center gap-1.5 ms-auto shrink-0 text-xs text-muted-foreground">
          {breachedCount > 0 && (
            <span className="flex items-center gap-1 text-[var(--status-red-fg)]">
              <AlertCircle className="size-3.5" aria-hidden />
              {breachedCount} خرق SLA
            </span>
          )}
          <span className="tabular-nums">{filtered.length} تذكرة</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="py-2 ps-3 pe-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">التذكرة</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden md:table-cell">المستفيد</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">النوع</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">الأولوية</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">الحالة</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">موعد SLA</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">تعيين موظف</th>
              <th className="py-2 ps-2 pe-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">التصعيد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  لا توجد تذاكر تطابق بحثك.
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
                          title="عرض الملف الشامل للمستفيد"
                          aria-label="فتح الملف الشامل للمستفيد"
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
                        {ticket.type === "COMPLAINT" ? "شكوى" : "طلب"}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      <Badge variant="outline" className={`text-xs ${priCfg.className}`}>
                        {priCfg.label}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      <Badge variant="outline" className={`text-xs ${stsCfg.className}`}>
                        {stsCfg.label}
                      </Badge>
                    </td>
                    <td className={`py-2.5 px-2 text-xs tabular-nums whitespace-nowrap ${slaClass}`}>
                      {format(ticket.slaDueAt, "dd MMM HH:mm")}
                      {ticket.slaBreached && (
                        <AlertCircle className="inline size-3 ms-1" aria-label="SLA breached" />
                      )}
                    </td>
                    <td className="py-2.5 px-2">
                      <AssignCell ticket={ticket} agents={agents} />
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
        {filtered.length} من {tickets.length} تذكرة · مرتب حسب الأولوية + موعد SLA
      </p>
    </div>
  )
}
