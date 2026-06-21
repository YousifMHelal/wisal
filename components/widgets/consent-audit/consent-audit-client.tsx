"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Search, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import type { ConsentAuditRow } from "@/lib/queries/governance"

interface Props {
  rows: ConsentAuditRow[]
  exportUrl: string
}

export function ConsentAuditClient({ rows, exportUrl }: Props) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.caseId.toLowerCase().includes(q) ||
        r.caregiverCaseRef.toLowerCase().includes(q)
    )
  }, [rows, search])

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search case ID or caregiver case…"
            className="ps-9 h-8 text-sm"
            aria-label="Search consent records"
          />
        </div>
        <a
          href={exportUrl}
          download
          className="inline-flex items-center gap-1.5 h-8 px-3 shrink-0 rounded-md border border-border bg-transparent text-sm font-medium text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
        >
          <Download className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Export</span>
        </a>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="py-2 ps-3 pe-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Case ID</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Caregiver Case</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Consent on File</th>
              <th className="py-2 ps-2 pe-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Date</th>
              <th className="py-2 ps-2 pe-3 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No records match your search.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors duration-150">
                  <td className="py-2.5 ps-3 pe-2 font-mono text-xs tabular-nums text-foreground whitespace-nowrap">{row.caseId}</td>
                  <td className="py-2.5 px-2 font-mono text-xs tabular-nums text-muted-foreground whitespace-nowrap">{row.caregiverCaseRef}</td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    {row.consentOnFile ? (
                      <Badge variant="outline" className="text-xs font-medium bg-status-green/15 text-status-green-fg border-status-green/30">
                        On file
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs font-medium bg-status-red/15 text-status-red-fg border-status-red/30">
                        Missing
                      </Badge>
                    )}
                  </td>
                  <td className="py-2.5 ps-2 pe-3 text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                    {format(row.timestamp, "dd MMM yyyy HH:mm")}
                  </td>
                  <td className="py-2.5 ps-2 pe-3 text-end">
                    <Link
                      href={`/intelligence?highlight=${row.caregiverCaseId}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                      aria-label={`View caregiver audit for ${row.caregiverCaseRef}`}
                    >
                      <ExternalLink className="size-3" aria-hidden />
                      <span className="hidden sm:inline">Caregiver Audit</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground text-end tabular-nums">
        Showing {filtered.length} of {rows.length} records
      </p>
    </div>
  )
}
