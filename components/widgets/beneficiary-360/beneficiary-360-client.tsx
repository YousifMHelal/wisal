"use client"

import { useState, useTransition, useCallback } from "react"
import { Search, User, Phone, MapPin, Shield, ChevronRight, CheckCircle, AlertTriangle, XCircle, Clock, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs } from "@/components/ui/tabs"
import { format, formatDistanceToNow, isPast } from "date-fns"
import { searchBeneficiaryAction, getBeneficiary360Action } from "@/lib/actions/operations"
import type { BeneficiarySearchResult, Beneficiary360 } from "@/lib/queries/operations"

// ── Helpers ───────────────────────────────────────────────────────────────────

const CHANNEL_ICONS: Record<string, string> = {
  Voice: "📞", WhatsApp: "💬", LiveChat: "🖥", Email: "✉️",
  SignLanguageVideo: "🤟", Social: "📢",
}

function SentimentDot({ value }: { value: number }) {
  if (value > 0.2) return <span className="size-2 rounded-full bg-[var(--status-green)] inline-block shrink-0" aria-label="Positive" />
  if (value > -0.2) return <span className="size-2 rounded-full bg-[var(--status-amber)] inline-block shrink-0" aria-label="Neutral" />
  return <span className="size-2 rounded-full bg-[var(--status-red)] inline-block shrink-0" aria-label="Negative" />
}

function TicketPriorityBadge({ priority }: { priority: string }) {
  const cls =
    priority === "HIGH" ? "bg-[var(--status-red-bg)] text-[var(--status-red-fg)] border-[var(--status-red)]/30"
    : priority === "MEDIUM" ? "bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border-[var(--status-amber)]/30"
    : "bg-muted text-muted-foreground"
  return <Badge className={`text-[10px] px-1.5 py-0 ${cls}`}>{priority}</Badge>
}

function TicketStatusBadge({ status }: { status: string }) {
  const cls =
    status === "OPEN" ? "bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border-[var(--status-amber)]/30"
    : status === "ESCALATED" ? "bg-[var(--status-red-bg)] text-[var(--status-red-fg)] border-[var(--status-red)]/30"
    : status === "CLOSED" ? "bg-muted text-muted-foreground"
    : "bg-[var(--status-green-bg)] text-[var(--status-green-fg)] border-[var(--status-green)]/30"
  return <Badge className={`text-[10px] px-1.5 py-0 ${cls}`}>{status.replace("_", " ")}</Badge>
}

function ConsentBadge({ status }: { status: string }) {
  if (status === "GIVEN") return (
    <span className="flex items-center gap-1 text-[var(--status-green-fg)] text-xs font-medium">
      <CheckCircle className="size-3.5" aria-hidden="true" /> Consent Given
    </span>
  )
  if (status === "WITHDRAWN") return (
    <span className="flex items-center gap-1 text-[var(--status-red-fg)] text-xs font-medium">
      <XCircle className="size-3.5" aria-hidden="true" /> Consent Withdrawn
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-[var(--status-amber-fg)] text-xs font-medium">
      <AlertTriangle className="size-3.5" aria-hidden="true" /> Pending Consent
    </span>
  )
}

// ── Profile card ──────────────────────────────────────────────────────────────

function ProfileCard({ profile }: { profile: Beneficiary360["profile"] }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4 flex flex-col sm:flex-row gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <User className="size-6 text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{profile.name}</p>
          <p className="text-xs text-muted-foreground" lang="ar">{profile.nameAr}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{profile.nationalId}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 sm:ms-auto items-start sm:items-center">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {profile.clusterName}
        </div>
        {profile.phone && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3.5 shrink-0" aria-hidden="true" />
            {profile.phone}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="size-3.5 shrink-0" aria-hidden="true" />
          {profile.gender} · DOB {format(profile.dateOfBirth, "d MMM yyyy")}
        </div>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{profile.tier}</Badge>
        <ConsentBadge status={profile.consentStatus} />
      </div>
    </div>
  )
}

// ── Interactions tab ──────────────────────────────────────────────────────────

function InteractionsTab({ interactions }: { interactions: Beneficiary360["interactions"] }) {
  if (interactions.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No interactions recorded.</p>
  }
  return (
    <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pe-1">
      {interactions.map((i) => (
        <div
          key={i.id}
          className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
        >
          <SentimentDot value={i.sentiment} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-foreground">
                {i.channelName}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {format(i.startedAt, "d MMM yyyy HH:mm")}
              </span>
              {i.agentName && (
                <span className="text-[10px] text-muted-foreground">· {i.agentName}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{i.intent}</p>
            <p className="text-xs text-foreground/70 mt-0.5 truncate">{i.resolution}</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
            <Clock className="size-3" aria-hidden="true" />
            {Math.round(i.durationSec / 60)}m
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tickets tab ───────────────────────────────────────────────────────────────

function TicketsTab({ tickets }: { tickets: Beneficiary360["tickets"] }) {
  if (tickets.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No tickets found.</p>
  }
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-xs border-collapse min-w-[480px]" aria-label="Tickets">
        <thead>
          <tr className="border-b border-border">
            <th className="text-start py-2 px-2 text-muted-foreground font-medium">Type</th>
            <th className="text-start py-2 px-2 text-muted-foreground font-medium">Priority</th>
            <th className="text-start py-2 px-2 text-muted-foreground font-medium">Status</th>
            <th className="text-start py-2 px-2 text-muted-foreground font-medium">SLA Due</th>
            <th className="text-start py-2 px-2 text-muted-foreground font-medium">Agent</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => {
            const slaBreached = isPast(t.slaDueAt) && t.status !== "CLOSED"
            return (
              <tr
                key={t.id}
                className={[
                  "border-b border-border/50 hover:bg-muted/30 transition-colors",
                  slaBreached ? "bg-[var(--status-red-bg)]/20" : "",
                ].join(" ")}
              >
                <td className="py-2.5 px-2 font-medium text-foreground">{t.type}</td>
                <td className="py-2.5 px-2"><TicketPriorityBadge priority={t.priority} /></td>
                <td className="py-2.5 px-2"><TicketStatusBadge status={t.status} /></td>
                <td className="py-2.5 px-2">
                  <span className={slaBreached ? "text-[var(--status-red-fg)] font-medium" : "text-muted-foreground"}>
                    {format(t.slaDueAt, "d MMM HH:mm")}
                    {slaBreached && " ⚠"}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-muted-foreground">{t.assignedAgentName ?? "—"}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Root client component ─────────────────────────────────────────────────────

interface Props {
  initialBeneficiaryId?: string
}

type TabKey = "interactions" | "tickets"

export function Beneficiary360Client({ initialBeneficiaryId }: Props) {
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<BeneficiarySearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [profile, setProfile] = useState<Beneficiary360 | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("interactions")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoadingProfile, startLoadingProfile] = useTransition()

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (value.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    startTransition(async () => {
      const res = await searchBeneficiaryAction({ query: value })
      if (res.error) { setError(res.error); return }
      setSearchResults(res.results)
      setShowDropdown(true)
      setError(null)
    })
  }, [])

  const handleSelect = useCallback((result: BeneficiarySearchResult) => {
    setQuery(result.name)
    setShowDropdown(false)
    setSearchResults([])
    setError(null)
    startLoadingProfile(async () => {
      const res = await getBeneficiary360Action({ id: result.id })
      if (res.error) { setError(res.error); return }
      setProfile(res.data)
    })
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Search by national ID or name…"
            className="ps-9"
            aria-label="Search beneficiary by national ID or name"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            autoComplete="off"
          />
        </div>

        {/* Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div
            role="listbox"
            aria-label="Search results"
            className="absolute z-20 top-full mt-1 start-0 end-0 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
          >
            {searchResults.map((r) => (
              <button
                key={r.id}
                role="option"
                aria-selected={false}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent text-start transition-colors cursor-pointer"
                onMouseDown={() => handleSelect(r)}
              >
                <User className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{r.nationalId} · {r.clusterName}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-[10px] px-1 py-0">{r.tier}</Badge>
                  <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && searchResults.length === 0 && query.length >= 2 && !isPending && (
          <div className="absolute z-20 top-full mt-1 start-0 end-0 bg-popover border border-border rounded-lg shadow-lg px-3 py-2.5">
            <p className="text-sm text-muted-foreground">No beneficiaries found. Try a different name or ID.</p>
          </div>
        )}
      </div>

      {isPending && (
        <p className="text-xs text-muted-foreground animate-pulse">Searching…</p>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {isLoadingProfile && (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 rounded-lg bg-muted/40" />
          <div className="h-48 rounded-lg bg-muted/40" />
        </div>
      )}

      {/* Profile */}
      {profile && !isLoadingProfile && (
        <div className="flex flex-col gap-4">
          <ProfileCard profile={profile.profile} />

          {/* Tabs — manual impl to avoid base-ui Tabs breaking changes */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-1 border-b border-border" role="tablist">
              {(["interactions", "tickets"] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "px-3 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
                    activeTab === tab
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {tab}
                  <span className="ms-1.5 text-xs text-muted-foreground">
                    {tab === "interactions" ? `(${profile.interactions.length})` : `(${profile.tickets.length})`}
                  </span>
                </button>
              ))}
            </div>

            <div role="tabpanel">
              {activeTab === "interactions" && <InteractionsTab interactions={profile.interactions} />}
              {activeTab === "tickets" && <TicketsTab tickets={profile.tickets} />}
            </div>
          </div>
        </div>
      )}

      {!profile && !isPending && !isLoadingProfile && !error && (
        <div className="flex flex-col items-center justify-center min-h-[140px] text-center gap-2">
          <Search className="size-8 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Search a beneficiary to view their 360 profile</p>
          <p className="text-xs text-muted-foreground">National ID, name (EN or AR)</p>
        </div>
      )}
    </div>
  )
}
