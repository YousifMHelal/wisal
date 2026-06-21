"use client"

import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, AlertTriangle, Bot } from "lucide-react"
import { format } from "date-fns"
import { submitQaScore } from "@/lib/actions/workforce"
import type { QaItem } from "@/lib/queries/workforce"

function sentimentColor(score: number): string {
  if (score >= 0.2) return "text-[var(--status-green-fg)]"
  if (score >= -0.2) return "text-[var(--status-amber-fg)]"
  return "text-[var(--status-red-fg)]"
}

function confidenceColor(pct: number): string {
  if (pct >= 75) return "text-[var(--status-green-fg)]"
  if (pct >= 50) return "text-[var(--status-amber-fg)]"
  return "text-[var(--status-red-fg)]"
}

interface QaRowProps {
  item: QaItem
  onReviewed: (id: string) => void
}

function QaRow({ item, onReviewed }: QaRowProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!score) { setError("Select a quality score."); return }
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set("itemId", item.id)
      fd.set("qualityScore", String(score))
      fd.set("notes", notes)
      const result = await submitQaScore(fd)
      if (result.error) { setError(result.error); return }
      onReviewed(item.id)
    })
  }

  return (
    <>
      <tr
        className="hover:bg-muted/30 transition-colors duration-150 cursor-pointer"
        onClick={() => setIsOpen((o) => !o)}
      >
        <td className="py-2.5 ps-3 pe-1">
          {isOpen
            ? <ChevronDown className="size-3.5 text-muted-foreground" />
            : <ChevronRight className="size-3.5 text-muted-foreground" />
          }
        </td>
        <td className="py-2.5 px-2 font-mono text-xs tabular-nums text-foreground whitespace-nowrap">
          {item.interactionId}
        </td>
        <td className="py-2.5 px-2 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">
          {item.clusterName}
        </td>
        <td className={`py-2.5 px-2 text-end text-sm tabular-nums font-medium ${sentimentColor(item.sentimentScore)}`}>
          <span className="flex items-center justify-end gap-1">
            <AlertTriangle className="size-3" aria-hidden />
            {item.sentimentScore.toFixed(2)}
          </span>
        </td>
        <td className={`py-2.5 px-2 text-end text-sm tabular-nums font-medium ${confidenceColor(item.botConfidence)}`}>
          <span className="flex items-center justify-end gap-1">
            <Bot className="size-3" aria-hidden />
            {item.botConfidence.toFixed(0)}%
          </span>
        </td>
        <td className="py-2.5 px-2 text-end hidden md:table-cell">
          <Badge variant="outline" className="text-xs tabular-nums">{item.priority}</Badge>
        </td>
        <td className="py-2.5 ps-2 pe-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap hidden lg:table-cell">
          {format(item.createdAt, "dd MMM HH:mm")}
        </td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={7} className="px-4 py-4 bg-muted/20">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-lg">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Score Interaction — {item.interactionId}
              </p>

              {/* Quality score 1–5 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Quality Score</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setScore(v)}
                      className={`size-9 rounded-md border text-sm font-medium transition-colors duration-150 cursor-pointer ${
                        score === v
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground"
                      }`}
                      aria-label={`Score ${v}`}
                      aria-pressed={score === v}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`notes-${item.id}`} className="text-xs text-muted-foreground">
                  Notes (optional)
                </label>
                <textarea
                  id={`notes-${item.id}`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  maxLength={1000}
                  placeholder="Add reviewer notes…"
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>

              {error && <p className="text-xs text-[var(--status-red-fg)]">{error}</p>}

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isPending || !score}
                  className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Submitting…" : "Submit Score"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-8 px-3 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </td>
        </tr>
      )}
    </>
  )
}

interface Props {
  items: QaItem[]
}

export function QaQueueClient({ items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems)

  function handleReviewed(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[120px]">
        <p className="text-sm text-muted-foreground">QA queue empty — all items reviewed.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground tabular-nums">
          {items.length} item{items.length !== 1 ? "s" : ""} pending review
        </p>
        <p className="text-xs text-muted-foreground">Sorted by priority · worst sentiment first</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="py-2 ps-3 pe-1 w-8" />
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Interaction</th>
              <th className="py-2 px-2 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">Cluster</th>
              <th className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Sentiment</th>
              <th className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Confidence</th>
              <th className="py-2 px-2 text-end text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Priority</th>
              <th className="py-2 ps-2 pe-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <QaRow key={item.id} item={item} onReviewed={handleReviewed} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
