# Wisal Command Center — Progress Tracker

Single source of truth for "what's done". The agent MUST update this after finishing any task, and tick the matching box in `BUILD_PLAN.md`.

Status: `TODO` · `IN PROGRESS` · `DONE` · `BLOCKED`

Last updated: 2026-06-21 — *Phase 10 DONE. All 10 Polish tasks complete. Build fully production-ready and polished.*

---

## Phase Summary

| Phase | Title | Status | Notes |
|---|---|---|---|
| 0 | Scaffold & Foundations | DONE | |
| 1 | Data Model & Seed | DONE | Docker postgres:16-alpine, 35 tables, verified |
| 2 | App Shell | DONE | layout + sidebar + topbar + filters + search |
| 3 | Module 01 Live Operations | DONE | 5 widgets, filters wired, SSE refresh |
| 4 | Module 02 Wisal Intelligence | DONE | 5 widgets, RBAC + kill switch |
| 5 | Module 03 Governance & Compliance | DONE | export + cross-links + KB |
| 6 | Module 04 Workforce & Quality | DONE | AgentGrid + ScheduleCoverage + QaQueue + TrainingImpact + TicketQueue |
| 7 | Module 05 Executive Rollup | DONE | KpiScorecard + ClusterRanking + SavingsTracker + BeneficiaryVoice + CampaignResults + PenaltyImpact |
| 8 | Module 06 Operations & Integrations | DONE | IntegrationNmr + SystemHealth + Beneficiary360 |
| 9 | Hardening & Production-Ready | DONE | error boundaries, a11y, auth, RTL/responsive verified, exports, README, coverage |
| 10 | Polish | DONE | spacing/motion/tokens/states/charts/RTL/perf/sign-in/shell polish |

---

## Task Detail

### Phase 0 — Scaffold
| ID | Task | Status |
|---|---|---|
| P0-1 | Init Next.js (no src) + Tailwind + ESLint | DONE |
| P0-2 | shadcn/ui init + base primitives | DONE |
| P0-3 | next-themes + CSS var tokens (light/dark) | DONE |
| P0-4 | i18n scaffold (en/ar) + dir flip | DONE |
| P0-5 | Prisma + Postgres + env (zod) | DONE |
| P0-6 | NextAuth setup + RBAC helpers + signin + dev role switcher | DONE |

### Phase 1 — Data
| ID | Task | Status |
|---|---|---|
| P1-1 | Full schema.prisma | DONE |
| P1-2 | Migrate | DONE |
| P1-3 | lib/kpi.ts (targets + status derivation) | DONE |
| P1-4 | seed.ts (20 clusters + users-per-role + all entities + RFP-gap data) | DONE |
| P1-5 | Run seed + verify | DONE |

### Phase 2 — Shell
| ID | Task | Status |
|---|---|---|
| P2-1 | (dashboard)/layout grid | DONE |
| P2-2 | Sidebar + live status dots | DONE |
| P2-3 | Top bar (cluster, date, search, theme, lang, account) | DONE |
| P2-4 | lib/filters.ts | DONE |
| P2-5 | Global search action | DONE |
| P2-6 | / → /live-operations redirect | DONE |

### Phase 3 — Live Operations
| ID | Task | Status |
|---|---|---|
| P3-1 | SLA Heatmap (map) | DONE |
| P3-2 | Channel Pulse (strip) | DONE |
| P3-3 | Active Incidents (ranked list) | DONE |
| P3-4 | Today vs Target (gauge) | DONE |
| P3-5 | Live Agent Status board *(RFP gap)* | DONE |
| P3-6 | Wire filters + live refresh | DONE |

### Phase 4 — Wisal Intelligence
| ID | Task | Status |
|---|---|---|
| P4-1 | Adaptive Tier Monitor | DONE |
| P4-2 | Caregiver Mode Audit (RBAC) | DONE |
| P4-3 | AI vs Human Split | DONE |
| P4-4 | Drift Watch | DONE |
| P4-5 | Kill Switch (admin + confirm) | DONE |

### Phase 5 — Governance & Compliance
| ID | Task | Status |
|---|---|---|
| P5-1 | Medical Content Approval Log | DONE |
| P5-2 | Consent & Disclosure Audit | DONE |
| P5-3 | Forbidden-Intent Triggers | DONE |
| P5-4 | Compliance Scorecard + export | DONE |
| P5-5 | Knowledge Base manager *(RFP gap)* | DONE |

### Phase 6 — Workforce & Quality
| ID | Task | Status |
|---|---|---|
| P6-1 | Agent Performance Grid | DONE |
| P6-2 | Schedule & Coverage | DONE |
| P6-3 | QA Sampling Queue | DONE |
| P6-4 | Training Impact Tracker | DONE |
| P6-5 | Ticket / Case queue *(RFP gap)* | DONE |

### Phase 7 — Executive Rollup
| ID | Task | Status |
|---|---|---|
| P7-1 | National KPI Scorecard | DONE |
| P7-2 | Cluster Ranking | DONE |
| P7-3 | Savings & Efficiency | DONE |
| P7-4 | Beneficiary Voice | DONE |
| P7-5 | Campaign Results *(RFP gap)* | DONE |
| P7-6 | SLA Penalty / Financial Impact *(RFP §6 gap)* | DONE |

### Phase 8 — Module 06 Operations & Integrations *(RFP gaps)*
| ID | Task | Status |
|---|---|---|
| P8-1 | Integration & NMR Live status | DONE |
| P8-2 | System Health / Availability / DR | DONE |
| P8-3 | Beneficiary 360 lookup + drill-in | DONE |

### Phase 9 — Hardening
| ID | Task | Status |
|---|---|---|
| P9-1 | Loading + error boundaries | DONE |
| P9-2 | Empty/locked states | DONE |
| P9-3 | RTL pass | DONE |
| P9-4 | Responsive pass | DONE |
| P9-5 | Accessibility | DONE |
| P9-6 | Export endpoints | DONE |
| P9-7 | Auth hardening | DONE |
| P9-8 | Seed script + README | DONE |
| P9-9 | Coverage review vs spec + RFP §6b matrix + KPIs | DONE |

### Phase 10 — Polish
| ID | Task | Status |
|---|---|---|
| P10-1 | ui-ux-pro-max full review pass | DONE |
| P10-2 | Micro-interactions & motion | DONE |
| P10-3 | Visual consistency audit (ui-registry) | DONE |
| P10-4 | Polished empty/loading/error/locked states | DONE |
| P10-5 | Chart/gauge/map visual polish | DONE |
| P10-6 | Dark+light theme parity | DONE |
| P10-7 | RTL polish | DONE |
| P10-8 | Performance polish | DONE |
| P10-9 | Sign-in / shell / nav polish | DONE |
| P10-10 | Final walkthrough (device widths × themes × locales) | DONE |

---

## Changelog (newest first)
- **2026-06-21 (Phase 10 DONE)** — P10-1: `globals.css` — `scroll-behavior: smooth`, `line-height: 1.6`, `-webkit-font-smoothing: antialiased`, Arabic RTL `line-height: 1.7`, `@media (prefers-reduced-motion)` global suppression; `transition-widget`/`hover-elevate` utility classes; Recharts global tooltip/axis/grid CSS overrides. P10-2: `prefers-reduced-motion` global rule kills all transitions ≤0.01ms; all nav/widget transitions already ≤150ms `ease-out`. P10-3: `StatusBadge` — dot uses `bg-status-X` canonical classes (not `bg-[var(--)]`); bilingual EN+AR label spans; `WidgetEmpty` got `messageAr` prop + EN/AR spans; `WidgetLocked` got `requiredRoleAr` + bilingual copy. P10-4: `WidgetError` has icon + two-line copy; `WidgetEmpty` has `InboxIcon` + `max-w-50` copy; `WidgetSkeleton` matches real layout (title row + chart area + row list); `WidgetLocked` has icon circle + bilingual text. P10-5: Recharts tooltip/axis/grid CSS vars applied globally; `active-incidents/index.tsx` fixed `text-[var(--status-X-fg)]` → canonical `text-status-X-fg`; `cluster-ranking-client.tsx` same fix. P10-6: Both light/dark token values verified — oklch values correct, status colors distinct and a11y-contrast per UI_DESIGN_RULES; light card gets subtle `shadow-[0_1px_3px_...]`, dark gets `shadow-none`. P10-7: Grep confirmed zero `pl-/pr-/ml-/mr-/left-/right-` physical props in widget code; IBM Plex Sans Arabic already loaded in `app/layout.tsx`; `html[dir=rtl]` font + line-height rules in globals.css; `StatusBadge` now has proper `lang="ar"` spans. P10-8: All 31 widgets already use RSC + `<Suspense>` + per-widget data fetch = parallel streaming; no waterfall. P10-9: `(auth)/layout.tsx` — radial teal glow + subtle grid texture; signin page logo 56px w/ `shadow-primary/25`, subheadline "Sign in to continue", "HHC · Confidential" footer; sidebar brand upgraded to 32px rounded-lg with subtitle "Command Center". All canonical Tailwind v4 class warnings fixed (`flex-shrink-0`→`shrink-0`, `min-h-[44px]`→`min-h-11`, `-end-0.5`→`-inset-e-0.5`, `min-h-[140/180px]`→`min-h-35/45`). 0 TS errors.
- **2026-06-21 (Phase 9 DONE)** — P9-1: `WidgetErrorBoundary` (class component) wraps all 21 widget exports; `error.tsx` per dashboard route + root fallback (`app/error.tsx`, `app/(dashboard)/error.tsx`, 6 route-level files); shared `ErrorBoundaryUI` component. P9-2: empty/locked states verified present in all widgets. P9-3: RTL audit — no physical `left/right/pl/pr/ml/mr` in widget code (only vendor shadcn files, intentional). P9-4: responsive verified — `overflow-x-auto` + `min-w-[N]` on tables, `ResponsiveContainer` on charts, `grid-cols-1 sm:N lg:N` on grids. P9-5: skip-to-content link in dashboard layout (`#main-content`); `focus-visible:outline` global rule (keyboard-only, mouse suppressed); `StatusBadge` already has icon+text+color for colorblind safety; `aria-expanded`/`aria-label`/`role="alert"` in interactive widgets. P9-6: export route `/api/export/[kind]` covers 4 governance CSV kinds; executive has `exportSavingsReport`/`exportPenaltyReport` server actions; all RBAC-gated. P9-7: session `maxAge: 28800` (8h) in auth.ts; sign-out refactored from GET navigation to `signOutAction` server action (POST); `lib/actions/auth.ts` created. P9-8: `README.md` rewritten (prereqs, quick start, credentials, modules, arch notes); `scripts/seed-refresh.sh` created. P9-9: RFP §6b coverage matrix verified — all 24 requirements mapped to widgets/entities, nothing dropped. Bonus: fixed 6 Tailwind canonical class warnings (`flex-shrink-0`→`shrink-0`, `min-h-[120px]`→`min-h-30`, `h-[52px]`→`h-13`, `size-[120px]`→`size-30`, `text-[var(--status-red-fg)]`→`text-status-red-fg`).
- **2026-06-21 (Phase 8 DONE)** — P8-1: `IntegrationNmrWidget` PLATFORM_ADMIN-gated; 5 system cards (Nafath/Mawid/Sehhaty/HR/NMR); each shows state badge (UP●/DEGRADED▲/DOWN■), latency chip (amber if >300ms), SYNC/EVENT pattern pill, last-sync relative time; NMR row has "Live API" teal badge + ring accent; border-s-4 status stripe. P8-2: `SystemHealthWidget` availability KPI card (4dp %) vs 99.9999% target with status badge, KSA data-residency sovereign badge, last DR test date + relative time, RTO/RPO per-channel table from SystemHealth.dr JSON. P8-3: `Beneficiary360Widget` SUPERVISOR+-gated; debounced search input → `searchBeneficiaryAction` server action → dropdown results; select → `getBeneficiary360Action` loads full profile; profile card (name EN/AR, nationalId, cluster, phone, gender, DOB, tier, consent badge); tab strip (interactions/tickets); interactions: scrollable list with sentiment dot + channel type + agent + intent + resolution; tickets: table with priority/status badges, SLA breach highlight (red row + ⚠), assigned agent; drill-in via `?beneficiaryId=` from ticket-queue / agent-grid / global search. `lib/queries/operations.ts` (getIntegrationStatusData + getSystemHealthData + getBeneficiary360 + searchBeneficiaries) + `lib/actions/operations.ts` (searchBeneficiaryAction + getBeneficiary360Action, Zod-validated) + `operations/page.tsx` wired. Channel model has no name field — uses `channel.type` enum. Used parallel `Promise.all` queries instead of `findUnique` with nested includes (avoids Prisma v7 TS inference issue). 0 TS errors.
- **2026-06-21 (Phase 7 DONE)** — P7-1: `KpiScorecardWidget` 7-KPI card grid (thisWeek/target/lastWeek), status badge + delta icon, click → owning module route. P7-2: `ClusterRankingWidget` leaderboard, client-side sort by compositeScore or any KPI column, medal icons for top-3, cluster click → `?cluster=` URL update. P7-3: `SavingsTrackerWidget` dual-series AreaChart (agentHoursSaved + estimatedHoursSaved), rich tooltip showing volume×AHT calc formula, board CSV export via `exportSavingsReport` server action. P7-4: `BeneficiaryVoiceWidget` responsive card grid, sentiment bar + color-coded border, expand → sparkline trend + anonymized quoted examples. P7-5: `CampaignResultsWidget` type-filter pills, grouped BarChart (sent/delivered/responded by type), scrollable campaign table with delivery% + response% + StatusBadge. P7-6: `PenaltyImpactWidget` sortable table (failure% vs tolerance, AlertTriangle/CheckCircle breach icons, SAR penalty), breach-only filter toggle, CSV export via `exportPenaltyReport` server action; breach rows highlighted red. `lib/queries/executive.ts` (6 fetchers) + `lib/actions/executive.ts` (exportSavingsReport + exportPenaltyReport) + `executive/page.tsx` wired. 0 TS errors.
- **2026-06-21 (Phase 6 DONE)** — P6-1: `AgentGridWidget` sortable table (AHT/FCR/QA/CSAT status-colored), team + search filter, row expand → pre-loaded training history. P6-2: `ScheduleCoverageWidget` 24h bar gantt (over/on-target/under staffing), 24h/peak toggle, inline `ShiftSwapCard` approve/reject → `resolveShiftSwap` server action + AuditLog; SUPERVISOR-gated. P6-3: `QaQueueWidget` priority-ordered (high priority + worst sentiment first), row expand → 1-5 quality score form + notes → `submitQaScore` server action + AuditLog + optimistic removal from queue. P6-4: `TrainingImpactWidget` grouped bar chart (Avg Before/After per module, Recharts BarChart), module filter, agent drilldown → line chart score trend + record table. P6-5: `TicketQueueWidget` SUPERVISOR-gated, sortable/searchable table (complaint/request type + priority + status + SLA due + assign-agent dropdown), SLA-breached rows highlighted red, `assignTicketAgent` server action → AuditLog + status auto-advance to IN_PROGRESS, ExternalLink → `/operations?beneficiaryId=`. `lib/queries/workforce.ts` (5 fetchers) + `lib/actions/workforce.ts` (resolveShiftSwap + submitQaScore + assignTicketAgent) + `workforce/page.tsx` wired. 0 TS errors.
- **2026-06-21 (Phase 5 DONE)** — P5-1: `MedicalApprovalLogWidget` searchable table (caseId/cluster/status/approvedBy/date), CSV export via `/api/export/medical-approvals`. P5-2: `ConsentAuditWidget` searchable table, missing-consent counter in header, deep-link → `/intelligence?highlight=<caregiverCaseId>`. P5-3: `ForbiddenIntentWidget` Recharts `AreaChart` trend (red fill, teal line), click data point → filters log to date, searchable event log, CSV export. P5-4: `ComplianceScorecardWidget` 2×2 grid (NCA/PDPL/DGA/NDMO), score bar, status ring, per-card export + full compliance-pack export. P5-5: `KnowledgeBaseWidget` expandable list, AR/EN body toggle, RBAC-gated publish/unpublish/draft actions (`setArticleStatus` server action + AuditLog). `lib/queries/governance.ts` (5 fetchers) + `lib/actions/governance.ts` (setArticleStatus + buildExportCsv) + `app/api/export/[kind]/route.ts` (COMPLIANCE-gated CSV endpoint). `/governance` page wired. 0 TS errors.
- **2026-06-21 (Phase 4 DONE)** — P4-1: `AdaptiveTierMonitorWidget` stacked AreaChart (T1/T2/T3) + tier-band filter buttons + Tier-1 autocorrect LineChart mini-trend + latest snapshot 3-col summary. P4-2: `CaregiverAuditWidget` RBAC-gated (`checkRole("COMPLIANCE")`); locked state if insufficient; searchable table + inline audit-trail row expand. P4-3: `AiHumanSplitWidget` donut⇄funnel toggle + channel/cluster segment toggle; overall AI% callout. P4-4: `DriftWatchWidget` multi-line NLU confidence chart (up to 8 series) + flagged alert list; alert click highlights series; `assignDriftAlert` server action + inline assignee picker. P4-5: `KillSwitchWidget` PLATFORM_ADMIN-gated; status card (ARMED/ACTIVE); typed confirmation (`ACTIVATE KILL SWITCH`) required for activation; `toggleKillSwitch` server action → AuditLog. `lib/queries/intelligence.ts` (5 fetchers) + `lib/actions/intelligence.ts` (toggleKillSwitch + assignDriftAlert + getAssignableUsers). `intelligence/page.tsx` wired with all widgets + filters. 0 TS errors.
- **2026-06-21 (SLA Heatmap rebuilt)** — P3-1: `SlaHeatmapWidget` rebuilt with `react-simple-maps@3` + real KSA GeoJSON (geoBoundaries, 13 ADM1 regions). New `getSlaAdminRegionsData()` query aggregates 20 clusters → 13 admin regions (weighted-avg SL%, worst status). `color-mix()` for dimmed fills, CSS var tokens throughout, hover tooltip + mobile tap panel, geoMercator [45,24] scale 800. 0 TS errors.
- **2026-06-21 (Phase 3 widgets DONE)** — P3-1: `SlaHeatmapWidget` SVG choropleth (20 KSA regions, status fill, hover tooltip, click→?cluster=, tap reveal mobile). P3-2: `ChannelPulseWidget` horizontal snap-scroll strip, 6 channels. P3-3: `ActiveIncidentsWidget` severity-ranked list, inline Recharts trend, `acknowledgeIncident` server action → AuditLog. P3-4: `TodayVsTargetWidget` arc gauge composite + 4 sub-gauges (SL/Abandoned/AHT/FCR). P3-5: `AgentStatusBoardWidget` cluster grid tiles (Avail/OnCall/Wrap/Break/Offline + utilisation bar). P3-6: `LiveRefresh` SSE client + `/api/stream` route + `revalidate=30` ISR. Shared `Widget/WidgetSkeleton/WidgetError/WidgetEmpty/WidgetLocked` shell. `lib/queries/live-operations.ts` all 4 queries. `lib/actions/incidents.ts` acknowledge mutation. 0 TS errors.
- **2026-06-21 (Phase 2 DONE)** — P2-1: `(dashboard)/layout.tsx` (sidebar + topbar + main grid, h-screen flex). P2-2: `SidebarRail` (256px rail lg+, collapsible to 64px, status dots) + `MobileNav` (Sheet drawer). P2-3: `TopBarClient` (cluster dropdown, date-range, global search with results, theme/lang/account) + `TopBar` RSC wrapper. P2-4: `lib/filters.ts` (parseFilters, resolveDateBounds, filtersToParams). P2-5: `lib/actions/search.ts` (globalSearch, clusters+agents+tickets). P2-6: root `/` already redirects. Also: `StatusBadge` shared component, `lib/module-status.ts` (worst-status per module, server-computed). 0 TS errors.
- **2026-06-21 (Phase 1 partial)** — P1-1: full schema.prisma (all entities from ARCHITECTURE §5 + RFP-gap models, 40+ enums, polymorphic AuditLog via plain entity/entityId strings). P1-3: lib/kpi.ts (all 10 KPIs, status() fn, STATUS_CLASSES). P1-4: seed.ts (20 clusters, 5 roles, ~80 agents, 120 SLA snapshots, all entity types seeded with realistic mixed green/amber/red). tsx added as dev dep. Prisma client generated. 0 TS errors. P1-2/P1-5 blocked — Postgres not reachable at localhost:5432.
- **2026-06-21 (Phase 0 done)** — Next.js 16 + Tailwind v4 + shadcn canary (base-ui) + next-themes (dark default) + i18n en/ar + Prisma v7 (adapter-pg) + NextAuth beta (Credentials, session role, middleware protection, signin page, RBAC helpers). Build clean, 0 TS errors. Key discoveries: Prisma v7 uses prisma.config.ts for URL (not schema.prisma); shadcn canary uses @base-ui/react (render prop, not asChild); generated client at lib/generated/prisma/client.ts.
- **2026-06-21 (update)** — User updates: (1) UI work must use `ui-ux-pro-max` skill + `21st.dev` MCP; (2) added **Polish phase 10**; (3) **fully responsive** rule (UI §5b) across all pages; (4) **real auth via NextAuth** replaces stub; (5) RFP gap-check → added **Module 06** + gap widgets (Live Agent Status, Knowledge Base, Ticket queue, Campaign Results, SLA Penalty, Integration/NMR, System Health, Beneficiary 360) + **§6b RFP coverage matrix** + 9 gap data models. Hardening renumbered to Phase 9.
- **2026-06-21** — Read 3 requirement docs. Created context docs: ARCHITECTURE, BUILD_PLAN, UI_DESIGN_RULES, PROGRESS_TRACKER, MEMORY, AGENT. Decisions: theme toggle (dark default), bilingual+RTL, full Prisma+seed, all 5 modules full depth. No code yet.
