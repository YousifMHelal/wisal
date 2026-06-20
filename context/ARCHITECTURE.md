# Wisal Command Center — Architecture

> The CRM **dashboard** (Wisal Command Center) only. Not the full call-center platform, telephony, or AI runtime. This is the governance/analytics admin dashboard that *reports on* that platform.

---

## 1. Scope

Build the **Wisal Command Center** admin dashboard as a full-stack, production-ready app.

**In scope**
- 5 modules + ~21 sub-module widgets (see §6).
- Persistent sidebar + persistent top bar shell.
- Full Prisma/Postgres schema for every entity the dashboard reports on.
- Seeded realistic mock data (20 clusters, agents, cases, incidents, AI metrics, audit logs, KPIs).
- **Real authentication via NextAuth (Auth.js)** — sign-in page, session, role on session.
- RBAC (some widgets need elevated permissions — Caregiver Audit, Kill Switch).
- Bilingual EN/AR + RTL, dark/light theme toggle.
- Fully responsive (mobile/tablet/desktop) — see UI rules §5b.
- Filtering (cluster selector, date range) wired through every widget.
- Export (compliance packs, board reports) — CSV/print to start.

**Out of scope (mocked or stubbed)**
- Live telephony / IVR / ACD.
- Real AI inference, STT/TTS, NLU.
- Real external integrations (Nafath, Mawid, Sehhaty, HR). Modeled as data + an integration-status surface only.

**Auth (in scope, real):** **NextAuth (Auth.js)** with Credentials provider (email/password against `User`, hashed) for this build; pluggable to national SSO/OIDC later. Session carries `role`. `lib/auth.ts` wraps `auth()` + `requireRole()`. Protected via middleware + per-page/data-layer checks. Sign-in route outside the `(dashboard)` group.

---

## 2. Tech Stack (locked)

| Concern | Choice |
|---|---|
| Framework | **Next.js (App Router)**, **NO `src/` folder** — `app/` at root |
| Language | TypeScript, strict |
| Styling | **Tailwind CSS** (v4) |
| Components | **shadcn/ui** (Radix under the hood) |
| ORM | **Prisma** |
| DB | **PostgreSQL** |
| Validation | **Zod** (all inputs, all server-action boundaries, env) |
| Auth | **NextAuth (Auth.js)** — real sign-in, session → role for RBAC |
| Design tooling | **`ui-ux-pro-max` skill** + **`21st.dev` MCP** (+ shadcn MCP) for all UI |
| Theme | `next-themes` (dark default) via CSS variables |
| i18n / RTL | lightweight dictionary + `dir` flip, logical CSS props |
| Charts | Recharts (via shadcn chart wrapper) |
| Maps | SVG choropleth of Saudi Arabia (20 cluster regions) — no external map tile dep |
| Tables | TanStack Table (sort/filter) under shadcn DataTable |
| State (client) | URL search params first; React state for ephemeral UI |
| Dates | `date-fns` |

Rule: **server-first**. React Server Components fetch from Prisma. Client components only for interactivity (charts, toggles, dialogs, tables). Mutations via **server actions** validated with Zod.

---

## 3. Folder Structure (no `src/`)

```
/
├── app/
│   ├── layout.tsx                 # root: html, theme, dir, fonts
│   ├── globals.css                # tailwind + CSS vars (light/dark tokens)
│   ├── page.tsx                   # redirect -> /live-operations
│   ├── (auth)/                    # public, outside dashboard shell
│   │   └── signin/page.tsx        # NextAuth credentials sign-in
│   ├── (dashboard)/               # route group: shared shell (auth-protected)
│   │   ├── layout.tsx             # sidebar + topbar wrapper (checks session)
│   │   ├── live-operations/page.tsx
│   │   ├── intelligence/page.tsx
│   │   ├── governance/page.tsx
│   │   ├── workforce/page.tsx
│   │   ├── executive/page.tsx
│   │   └── operations/page.tsx    # Module 06: integrations/NMR, system health, 360 lookup
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth handler
│       ├── stream/route.ts        # SSE mock live updates (optional)
│       └── export/[kind]/route.ts # CSV/report export
├── middleware.ts                  # NextAuth: redirect unauth -> /signin
├── auth.ts                        # NextAuth (Auth.js) config (providers, callbacks, role on session)
├── components/
│   ├── ui/                        # shadcn primitives (generated)
│   ├── shell/                     # sidebar, topbar, cluster-selector, date-range, theme/lang toggles
│   ├── widgets/                   # one folder per sub-module widget
│   └── charts/                    # reusable chart wrappers
├── lib/
│   ├── prisma.ts                  # singleton client
│   ├── auth.ts                    # wraps NextAuth auth() + requireRole() RBAC helpers
│   ├── i18n/                      # dictionaries en.ts ar.ts + helper
│   ├── filters.ts                 # parse cluster/date-range from searchParams
│   ├── kpi.ts                     # KPI targets + status (green/amber/red) logic
│   └── zod/                       # shared schemas
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── context/                       # THESE DOCS (architecture, build plan, ui rules, tracker, memory)
├── AGENT.md
├── components.json                # shadcn config
└── ...config files
```

---

## 4. Layered Model (mirrors the Technical File's 6 layers — but only the *dashboard* slice)

The platform has 6 layers (Channels → Integration → Intelligence → Core Data → Governance Dashboard → Sovereign Infra). **We build the Governance Dashboard layer and the read-model of the Core Data layer.** Everything else is represented as seeded data the dashboard reads.

```
┌─────────────────────────────────────────────┐
│  PRESENTATION  app/ + components/            │  RSC pages, client widgets
├─────────────────────────────────────────────┤
│  ACCESS / RBAC  lib/auth.ts                  │  role gates per widget
├─────────────────────────────────────────────┤
│  DOMAIN / READ-MODEL  lib/*.ts queries       │  KPI calc, filters, aggregation
├─────────────────────────────────────────────┤
│  DATA  prisma/ + Postgres                    │  system of record (seeded)
└─────────────────────────────────────────────┘
```

---

## 5. Data Model (Prisma entities — full list)

Core reference:
- **Cluster** — 20 HHC clusters. name, region, catchmentPopulation, agentEstimate, lat/lng/svgRegionId.
- **Channel** — Voice, WhatsApp, LiveChat, Email, SignLanguageVideo, Social (enum + per-cluster metrics).
- **Agent** — name, team, clusterId, AHT, FCR, qaScore, csat, absenteeism, status.
- **User** — dashboard user. role enum: `OPERATOR | SUPERVISOR | COMPLIANCE | PLATFORM_ADMIN | EXECUTIVE`. (drives RBAC)

Live Operations:
- **SlaSnapshot** — per cluster, timestamped: serviceLevelPct, callVolume, abandonedPct, aht, fcr, status.
- **ChannelPulse** — per channel snapshot: volume, avgWaitSec, status.
- **Incident** — severity (CRITICAL|WARNING), type, clusterId?, channelId?, triggeredAt, acknowledgedAt?, metricTrend (json).

Wisal Intelligence:
- **TierSnapshot** — per timestamp: tier1Pct, tier2Pct, tier3Pct, tier1AutocorrectRate.
- **CaregiverCase** — Tier 3 audit: caseId, clusterId, timestamp, proxyConfirmed (bool|null=ambiguous), action (COMPLETED_WITH_CONSENT|FAILCLOSED_HANDOFF), auditTrail (json). **RBAC: elevated.**
- **ResolutionSplit** — per cluster/channel: aiFullPct, aiPartialPct, humanPct, volume.
- **DriftSnapshot** — clusterId, dialect, date, nluConfidence, intentConfidence, flagged (bool), message.
- **KillSwitch** — singleton-ish: state (ARMED|ACTIVE), lastTriggeredAt?, scope (ALL|CHANNEL|CLUSTER), scopeRef?. **RBAC: PLATFORM_ADMIN.**

Governance & Compliance:
- **MedicalContentApproval** — caseId, content, status (APPROVED|PENDING|REJECTED), approvedBy, timestamp.
- **ConsentDisclosure** — caseId (-> CaregiverCase), tier3DecisionRef, consentOnFile (bool), timestamp.
- **ForbiddenIntentEvent** — caseId, pattern, wisalResponse, timestamp.
- **ComplianceScore** — framework (NCA|PDPL|DGA|NDMO), status, score, refreshedAt, evidenceRefs (json).

Workforce & Quality:
- **ShiftCoverage** — clusterId, hour, forecastDemand, staffed.
- **ShiftSwapRequest** — agentId, fromShift, toShift, status (PENDING|APPROVED|REJECTED).
- **QaSampleItem** — interactionId, clusterId, sentimentScore, botConfidence, priority, reviewed (bool).
- **TrainingRecord** — agentId, module, completedAt, qaScoreBefore, qaScoreAfter.

Executive Rollup:
- **KpiScorecard** — metric (enum of 7 committed KPIs), thisWeek, target, lastWeek, ownerModule.
- **ClusterRanking** — clusterId, compositeScore, perKpi (json).
- **SavingsPoint** — date, agentHoursSaved, aiResolvedVolume, avgHandleTimeSaved.
- **BeneficiaryVoiceTheme** — theme, plainSummary, sentiment, weekTrend (json), examples (json).

RFP-coverage entities (close gaps the 5 spec modules don't fully surface — see §6b):
- **Beneficiary** — 360 profile: name, iqama/nationalId, demographics, clusterId, consentStatus, tier. (`Beneficiary 360`, `Demographic Data`, `Beneficiary insight`)
- **Interaction** — beneficiaryId, channelId, clusterId, agentId?, startedAt, durationSec, intent, sentiment, resolution. Cross-channel single case identity. Powers 360 history + analytics.
- **Ticket** — beneficiaryId, clusterId, type (COMPLAINT|REQUEST), status, priority, slaDueAt, escalationPath, assignedAgentId. (`Case/Ticket management system`)
- **KnowledgeArticle** — title, body (AR/EN), version, status (DRAFT|PUBLISHED|UNPUBLISHED), publishAt, role-based publish rights. (`Knowledge base`, versioned bilingual)
- **AgentStatus** — agentId, state (AVAILABLE|ON_CALL|WRAP|AFTER_CALL|BREAK|OFFLINE), since, clusterId. Live agent state. (`Agent Status & performance dashboard`)
- **Campaign** — name, type (REMINDER|SURVEY|AWARENESS|RESCHEDULE), clusterId, status, sent, delivered, responded, outcomeMetrics (json). (`Outbound campaign results measurement`)
- **PenaltyRecord** — clusterId, period, kpi, failurePct, permissibleTolerance, breached (bool), penaltyAmount, basis. RFP §6 غرامات — penalties = avg failure % × operating cost. (`SLA penalties/financial impact`)
- **IntegrationStatus** — system (NAFATH|MAWID|SEHHATY|HR|NMR), state (UP|DEGRADED|DOWN), lastSyncAt, latencyMs, pattern (SYNC|EVENT). Integration matrix health + **NMR live Open-API feed**. (`Dashboard integration with NMR (Live)`, no point-to-point)
- **SystemHealth** — availabilityPct (target 99.9999%), dr (RTO/RPO per channel json), lastDrTestAt, region (KSA). (`BCP/DR`, `High Availability`, data residency)

Cross-cutting:
- **AuditLog** — actor, action, entity, entityId, timestamp, meta (json). Written on every mutation.

> Status color (green/amber/red) is **derived** from metric vs target in `lib/kpi.ts`, not stored — single source of truth for thresholds.

---

## 6. Module ⇄ Widget Map (what gets built)

5 spec modules + 1 operations module (06) added to fully cover the RFP. Spec-defined widgets are the core; **+ RFP-gap** widgets are additions traced in §6b.

| # | Module (route) | Sub-module widgets | RBAC |
|---|---|---|---|
| 01 | Live Operations `/live-operations` | National SLA Heatmap (map) · Channel Pulse (status strip) · Active Incidents Feed (ranked list) · Today vs Target (composite gauge) · **+ Live Agent Status board** (RFP gap) | all |
| 02 | Wisal Intelligence `/intelligence` | Adaptive Tier Monitor (stacked trend) · Caregiver Mode Audit (table) **elevated** · AI vs Human Split (donut/funnel) · Drift Watch (multi-line + alerts) · Kill Switch Panel **admin** | mixed |
| 03 | Governance & Compliance `/governance` | Medical Content Approval Log (table) · Consent & Disclosure Audit (table) · Forbidden-Intent Triggers (log+trend) · Compliance Scorecard (card grid) · **+ Knowledge Base manager** (versioned bilingual, RFP gap) | COMPLIANCE+ |
| 04 | Workforce & Quality `/workforce` | Agent Performance Grid (sortable table) · Schedule & Coverage (calendar/gantt) · QA Sampling Queue (prioritized list) · Training Impact Tracker (before/after) · **+ Ticket / Case queue** (complaints+requests SLA, RFP gap) | SUPERVISOR+ |
| 05 | Executive Rollup `/executive` | National KPI Scorecard (card grid) · Cluster Ranking (leaderboard) · Savings & Efficiency (trend) · Beneficiary Voice (theme cards) · **+ Campaign Results** · **+ SLA Penalty / Financial Impact** (RFP §6, gaps) | EXECUTIVE+ |
| 06 | Operations & Integrations `/operations` | **Integration & NMR Live status** (Open-API feed, integration matrix health) · **System Health / Availability** (99.9999%, DR RTO/RPO) · **Beneficiary 360 lookup** (search → full profile + cross-channel history) — all RFP gaps | PLATFORM_ADMIN / SUPERVISOR+ |

> Beneficiary 360 is also reachable as a **drill-in** from agent rows, tickets, and global search — not only Module 06.

---

## 6b. RFP Coverage Matrix (nothing dropped)

Every dashboard-relevant RFP/Technical requirement → where it lives. Source: `requirement/RFP.md` (Appendix 2 CRM/IVR/AI capabilities, §6 penalties, Appendix 1 SLA) + Technical File.

| RFP / Technical requirement | Covered by |
|---|---|
| 360 Beneficiary profile / demographics / insight | Beneficiary 360 (Mod 06 + drill-ins), `Beneficiary`/`Interaction` |
| Beneficiary voice | Beneficiary Voice cards (Mod 05) |
| Case & Ticket management, SLA, escalation | Ticket/Case queue (Mod 04), `Ticket` |
| Knowledge base (versioned, bilingual) | Knowledge Base manager (Mod 03), `KnowledgeArticle` |
| Service Level / Abandoned / AHT / ASA / FCR | SLA Heatmap + Today vs Target (Mod 01), `lib/kpi.ts` |
| Agent Status & performance dashboard | Live Agent Status (Mod 01) + Agent Grid (Mod 04) |
| Quality management | QA Sampling Queue + Training Impact (Mod 04) |
| Workforce management (staffing vs demand, swaps) | Schedule & Coverage (Mod 04) |
| AI: completion/error, resolution split | KPI Scorecard (Mod 05) + AI vs Human Split (Mod 02) |
| AI: drift, sentiment, predictive, guardrails, kill switch | Drift Watch + Kill Switch (Mod 02), sentiment in QA |
| Chatbot/Voicebot/Agent copilot/coaching | reflected in AI-vs-Human + Tier Monitor (Mod 02); runtime is platform, dashboard reports it |
| Adaptive tiers (T1/T2/T3 caregiver, fail-closed) | Tier Monitor + Caregiver Audit (Mod 02) |
| Forbidden-intent, medical-content approval, consent | Governance logs (Mod 03) |
| Compliance NCA/PDPL/DGA/NDMO + audit trail | Compliance Scorecard + AuditLog (Mod 03) |
| Outbound campaign results measurement | Campaign Results (Mod 05), `Campaign` |
| Savings realization methodology + KPIs | Savings & Efficiency (Mod 05) |
| SLA penalties / غرامات §6 (avg failure % × cost) | SLA Penalty / Financial Impact (Mod 05), `PenaltyRecord` |
| Dashboard integration with NMR (Live) Open API | Integration & NMR Live status (Mod 06), `IntegrationStatus` |
| Integration matrix, no point-to-point | Integration status (Mod 06) |
| Multi-tenant / multi-queue per cluster | Cluster selector + tenant-scoped queries (cross-cutting) |
| BCP/DR, RTO/RPO, High Availability 99.9999% | System Health (Mod 06), `SystemHealth` |
| KSA data residency / sovereignty | System Health region flag (Mod 06) |
| 24/7 monitoring across 20 clusters | Live Operations (Mod 01) |

---

## 7. Cross-Cutting Behaviors

- **Cluster selector** (top bar) → writes `?cluster=` to URL → every server query filters by it. "All Clusters" = national.
- **Date range** (Live/Today/7d/30d/Custom) → `?range=` / `?from=&to=` → scopes time-series queries.
- **Heatmap / leaderboard cluster click** = same as selecting that cluster in top bar (sets `?cluster=`).
- **Sidebar status dots** = each module's current worst condition, computed server-side per module.
- **Global search** — case IDs, agent names, cluster names. Server action over indexed columns.
- **RBAC** — `lib/auth.ts` `requireRole()` gates pages + widget data. Elevated widgets render a locked state if role insufficient.
- **Export** — `/api/export/[kind]` streams CSV; compliance scorecard supports "compliance pack" multi-table export.
- **Live feel** — Live Operations widgets refresh via SSE (`/api/stream`) or short polling against the mock service.

---

## 8. KPI Source of Truth (`lib/kpi.ts`)

From RFP Appendix 1.ii + Technical File committed targets:

| KPI | Target | Tolerance / amber |
|---|---|---|
| Service Level | 80% in 20s | 78% |
| Abandoned Calls | ≤ 5% | ≤ 8% |
| AHT | 5 min | — |
| ASA | ≤ 20s | — |
| FCR | ≥ 90% | ≥ 85% |
| CSAT | ≥ 95% (DGA) / ≥90% | ≥ 85% |
| AI Completion Rate | ≥ 80% | phased |
| AI Error Rate | < 1% | — |
| Agent Recruitment Time | 10 working days | — |
| Availability | 99.9999% | — |

`status(metric, value) -> 'green'|'amber'|'red'` is the only place thresholds live.

---

## 9. Non-Negotiables

1. No `src/` folder. `app/` at repo root.
2. Every server-action / route input validated with Zod.
3. Status colors derived, never hardcoded per widget.
4. RBAC enforced on the **server** (data layer), not just hidden in UI.
5. RTL-safe: logical CSS props only (`ps/pe/ms/me`, `start/end`), no hardcoded `left/right`.
6. Every mutation writes an `AuditLog` row.
7. **Real auth via NextAuth** — every dashboard route protected; session role drives RBAC.
8. **Fully responsive** — every page/widget works mobile/tablet/desktop (UI rules §5b).
9. **UI built with `ui-ux-pro-max` skill + `21st.dev` MCP**; project design rules override imported snippets.
10. Read `context/` docs + this file before any change (see `AGENT.md`).
