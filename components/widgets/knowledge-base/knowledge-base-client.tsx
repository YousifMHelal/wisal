"use client"

import { useState, useMemo, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, ChevronRight, Globe } from "lucide-react"
import { format } from "date-fns"
import { setArticleStatus } from "@/lib/actions/governance"
import type { KnowledgeArticleRow } from "@/lib/queries/governance"

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
  PUBLISHED: { label: "Published", className: "bg-status-green/15 text-status-green-fg border-status-green/30" },
  UNPUBLISHED: { label: "Unpublished", className: "bg-status-amber/15 text-status-amber-fg border-status-amber/30" },
} as const

interface Props {
  rows: KnowledgeArticleRow[]
  canPublish: boolean
}

export function KnowledgeBaseClient({ rows, canPublish }: Props) {
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [previewLang, setPreviewLang] = useState<Record<string, "en" | "ar">>({})
  const [pending, startTransition] = useTransition()
  const [actionResult, setActionResult] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.titleEn.toLowerCase().includes(q) ||
        r.titleAr.includes(q) ||
        r.status.toLowerCase().includes(q)
    )
  }, [rows, search])

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleLang = (id: string) => {
    setPreviewLang((prev) => ({ ...prev, [id]: prev[id] === "ar" ? "en" : "ar" }))
  }

  const handleAction = (articleId: string, action: "PUBLISH" | "UNPUBLISH" | "DRAFT") => {
    const fd = new FormData()
    fd.set("articleId", articleId)
    fd.set("action", action)
    startTransition(async () => {
      const result = await setArticleStatus(fd)
      setActionResult((prev) => ({
        ...prev,
        [articleId]: result.error ?? (result.success ? "ok" : ""),
      }))
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles (EN or AR)…"
          className="ps-9 h-8 text-sm"
          aria-label="Search knowledge base articles"
        />
      </div>

      {/* Article list */}
      <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No articles found.</p>
        )}
        {filtered.map((article) => {
          const isExpanded = expanded.has(article.id)
          const lang = previewLang[article.id] ?? "en"
          const cfg = STATUS_CONFIG[article.status]
          const result = actionResult[article.id]

          return (
            <div key={article.id} className="bg-card">
              {/* Row */}
              <div className="flex items-center gap-2 px-3 py-2.5 min-w-0">
                <button
                  onClick={() => toggleExpand(article.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label={isExpanded ? "Collapse article" : "Expand article"}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <ChevronDown className="size-4" aria-hidden />
                  ) : (
                    <ChevronRight className="size-4" aria-hidden />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate" lang="en">{article.titleEn}</p>
                  <p className="text-xs text-muted-foreground truncate" lang="ar" dir="rtl">{article.titleAr}</p>
                </div>

                {/* Meta */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground tabular-nums">v{article.version}</span>
                  <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
                    {cfg.label}
                  </Badge>
                  {article.publishAt && article.status === "DRAFT" && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Scheduled {format(article.publishAt, "dd MMM")}
                    </span>
                  )}
                </div>

                {/* Actions */}
                {canPublish && (
                  <div className="flex items-center gap-1 shrink-0">
                    {article.status !== "PUBLISHED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs gap-1"
                        onClick={() => handleAction(article.id, "PUBLISH")}
                        disabled={pending}
                        aria-label={`Publish ${article.titleEn}`}
                      >
                        Publish
                      </Button>
                    )}
                    {article.status === "PUBLISHED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-muted-foreground"
                        onClick={() => handleAction(article.id, "UNPUBLISH")}
                        disabled={pending}
                        aria-label={`Unpublish ${article.titleEn}`}
                      >
                        Unpublish
                      </Button>
                    )}
                    {result && result !== "ok" && (
                      <span className="text-xs text-status-red-fg">{result}</span>
                    )}
                    {result === "ok" && (
                      <span className="text-xs text-status-green-fg">Saved</span>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded preview */}
              {isExpanded && (
                <div className="border-t border-border bg-muted/20 px-4 py-3 flex flex-col gap-2">
                  {/* Metadata row */}
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground flex-wrap gap-y-1">
                    <div className="flex items-center gap-3">
                      <span>v{article.version}</span>
                      <Badge variant="outline" className={`${cfg.className} sm:hidden`}>{cfg.label}</Badge>
                      {article.publisherName && <span>Published by {article.publisherName}</span>}
                      <span>Updated {format(article.updatedAt, "dd MMM yyyy")}</span>
                    </div>
                    <button
                      onClick={() => toggleLang(article.id)}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                      aria-label={`Switch preview to ${lang === "en" ? "Arabic" : "English"}`}
                    >
                      <Globe className="size-3" aria-hidden />
                      {lang === "en" ? "عربي" : "English"}
                    </button>
                  </div>

                  {/* Body preview */}
                  <div
                    className="text-sm text-foreground/80 line-clamp-6 leading-relaxed whitespace-pre-wrap"
                    lang={lang}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    {lang === "en" ? article.bodyEn : article.bodyAr}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground text-end tabular-nums">
        {filtered.length} of {rows.length} articles
        {!canPublish && " · Read-only (publish requires COMPLIANCE role)"}
      </p>
    </div>
  )
}
