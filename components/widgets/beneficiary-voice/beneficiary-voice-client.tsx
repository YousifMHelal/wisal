"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, MessageSquareQuote } from "lucide-react"
import {
  LineChart, Line, ResponsiveContainer, Tooltip,
} from "recharts"
import type { VoiceTheme } from "@/lib/queries/executive"
import { cn } from "@/lib/utils"

function sentimentColor(s: number): string {
  if (s >= 0.3) return "var(--status-green)"
  if (s >= -0.2) return "var(--status-amber)"
  return "var(--status-red)"
}

function sentimentLabel(s: number): string {
  if (s >= 0.3) return "إيجابي"
  if (s >= -0.2) return "محايد"
  return "سلبي"
}

function sentimentBg(s: number): string {
  if (s >= 0.3) return "bg-[var(--status-green-bg)] border-[var(--status-green)]"
  if (s >= -0.2) return "bg-[var(--status-amber-bg)] border-[var(--status-amber)]"
  return "bg-[var(--status-red-bg)] border-[var(--status-red)]"
}

function SentimentBar({ value }: { value: number }) {
  // value: -1 to 1; map to 0–100% fill
  const pct = ((value + 1) / 2) * 100
  const color = sentimentColor(value)
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden" aria-hidden="true">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

interface SparklineProps { trend: number[] }

function Sparkline({ trend }: SparklineProps) {
  if (!trend.length) return null
  const data = trend.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            fontSize: 10,
            padding: "2px 6px",
          }}
          formatter={(v) => [(v as number).toFixed(2), "sentiment"]}
          labelFormatter={() => ""}
        />
        <Line
          type="monotone"
          dataKey="v"
          stroke="var(--color-primary)"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface ThemeCardProps { theme: VoiceTheme }

function ThemeCard({ theme }: ThemeCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex flex-col gap-2 transition-all duration-150",
        sentimentBg(theme.sentiment)
      )}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            <span className="[html[dir=rtl]_&]:hidden">{theme.theme}</span>
            <span className="hidden [html[dir=rtl]_&]:inline">{theme.themeAr}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sentimentLabel(theme.sentiment)} · {(theme.sentiment * 100).toFixed(0)}%
          </p>
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label={expanded ? "طي" : "توسيع"}
          aria-expanded={expanded}
        >
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {/* summary */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        <span className="[html[dir=rtl]_&]:hidden">{theme.plainSummary}</span>
        <span className="hidden [html[dir=rtl]_&]:inline">{theme.plainSummaryAr}</span>
      </p>

      {/* sentiment bar */}
      <SentimentBar value={theme.sentiment} />

      {/* expanded: examples + sparkline */}
      {expanded && (
        <div className="mt-1 space-y-3 border-t border-border/40 pt-3">
          {/* trend sparkline */}
          {theme.weekTrend.length > 1 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">اتجاه الشعور لـ ٤ أسابيع</p>
              <Sparkline trend={theme.weekTrend} />
            </div>
          )}

          {/* anonymized examples */}
          {theme.examples.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">أمثلة مجهولة الهوية</p>
              {theme.examples.slice(0, 3).map((ex, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                  <MessageSquareQuote className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                  <span className="leading-relaxed italic">&ldquo;{ex}&rdquo;</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface Props { themes: VoiceTheme[] }

export function BeneficiaryVoiceClient({ themes }: Props) {
  if (!themes.length) {
    return (
      <div className="flex items-center justify-center min-h-30">
        <p className="text-sm text-muted-foreground">لا توجد موضوعات صوت المستفيدين.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {themes.map((t) => (
        <ThemeCard key={t.id} theme={t} />
      ))}
    </div>
  )
}
