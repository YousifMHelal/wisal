# Wisal Command Center — Build Plan

Phased, dependency-ordered. Each task has an ID. Mark done in `PROGRESS_TRACKER.md` AND check the box here when complete. Do not start a phase until its predecessor's blocking tasks are done.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 0 — Project Scaffold & Foundations

- [x] **P0-1** Init Next.js (App Router, TS, **no src**), Tailwind v4, ESLint.
- [x] **P0-2** Install + init shadcn/ui (`components.json`), add base primitives (button, card, dialog, table, badge, tabs, tooltip, dropdown-menu, select, input, sheet, scroll-area, separator, skeleton).
- [x] **P0-3** `next-themes` provider, dark default; CSS variable tokens for light/dark in `globals.css`.
- [x] **P0-4** i18n scaffold: `lib/i18n/` dictionaries (`en.ts`, `ar.ts`), `useDict()` helper, `dir` flip wired in root layout, locale in cookie/URL.
- [x] **P0-5** Prisma init, Postgres connection, `lib/prisma.ts` singleton, Zod-validated `lib/env.ts`.
- [x] **P0-6** **NextAuth (Auth.js)** setup: `auth.ts` config (Credentials provider, hashed pw against `User`), `app/api/auth/[...nextauth]`, `middleware.ts` route protection, role on session. `lib/auth.ts` = `auth()` + `requireRole()` RBAC helpers. Sign-in page `(auth)/signin`. Dev role switcher (seeded users per role).

**Exit:** ✅ app boots, theme + lang toggles work, empty DB connects, sign-in works + protects routes.

---

## Phase 1 — Data Model & Seed

- [ ] **P1-1** Write full `schema.prisma` (all entities in ARCHITECTURE §5).
- [ ] **P1-2** Migrate.
- [ ] **P1-3** `lib/kpi.ts` — KPI targets + `status()` derivation (single source of truth).
- [ ] **P1-4** `prisma/seed.ts` — 20 real clusters (names/populations from RFP Appendix 1.i), users-per-role (for NextAuth login), agents, channel pulses, SLA snapshots, incidents, tier/drift/resolution/caregiver data, governance logs, workforce data, exec rollup data, **+ RFP-gap data**: beneficiaries+interactions, tickets, knowledge articles, agent live-status, campaigns, penalty records, integration/NMR status, system health. Realistic, mixed green/amber/red.
- [ ] **P1-5** Run seed, verify counts.

**Exit:** DB full of realistic data; `status()` unit-checked.

---

## Phase 2 — App Shell (the chrome around every module)

- [ ] **P2-1** `(dashboard)/layout.tsx` — grid: persistent sidebar + main (topbar + content).
- [ ] **P2-2** Sidebar: product mark, 5 module links w/ icon + label + **live status dot** (server-computed worst condition per module), active-state, collapsible.
- [ ] **P2-3** Top bar: cluster selector (All + 20), date-range selector (Live/Today/7d/30d/Custom), global search, theme toggle, lang toggle, account/role menu.
- [ ] **P2-4** `lib/filters.ts` — parse `cluster`/`range`/`from`/`to` from searchParams; helpers reused by all module queries.
- [ ] **P2-5** Global search server action (case IDs, agents, clusters).
- [ ] **P2-6** Root `/` → redirect to `/live-operations`.

**Exit:** can navigate all 5 routes (empty content), filters update URL, dots reflect data.

---

> **All widget/UI tasks below:** build with the `ui-ux-pro-max` skill + `21st.dev` MCP, fully responsive, per `UI_DESIGN_RULES.md`.

## Phase 3 — Module 01: Live Operations *(default landing — vertical slice first)*

- [ ] **P3-1** `widgets/sla-heatmap` — SVG Saudi map, 20 regions shaded by live SL status, hover tooltip (name, SL%, volume), click → sets `?cluster=`.
- [ ] **P3-2** `widgets/channel-pulse` — horizontal card strip per channel (volume, avg wait, status); click → incidents filtered to channel.
- [ ] **P3-3** `widgets/active-incidents` — ranked-by-severity list; expand inline to metric trend; acknowledge action (mutation + AuditLog).
- [ ] **P3-4** `widgets/today-vs-target` — composite gauge + sub-gauges (SL, Abandoned, AHT, FCR) on hover/click.
- [ ] **P3-5** `widgets/agent-status-board` *(RFP gap)* — live agent state tiles per cluster (Available/On-Call/Wrap/Break/Offline), counts + status.
- [ ] **P3-6** Wire all to cluster + date filters. Live refresh (SSE or poll).

**Exit:** Module 01 production-quality, filter-driven, live-feeling.

---

## Phase 4 — Module 02: Wisal Intelligence

- [ ] **P4-1** `widgets/adaptive-tier-monitor` — stacked trend (T1/T2/T3) + Tier-1 autocorrect mini-trend; tier-band click filters; info tooltip.
- [ ] **P4-2** `widgets/caregiver-audit` — **RBAC-gated** table; row expand → full audit trail. Locked state if role insufficient.
- [ ] **P4-3** `widgets/ai-human-split` — donut⇄funnel toggle, segmented by channel/cluster, segment click filters module.
- [ ] **P4-4** `widgets/drift-watch` — multi-line per cluster/dialect + alert list; alert click → that trend line; assign-to-member action.
- [ ] **P4-5** `widgets/kill-switch` — status card + **PLATFORM_ADMIN-gated** control with confirmation step; writes AuditLog.

**Exit:** Module 02 done, RBAC + confirmation flows working.

---

## Phase 5 — Module 03: Governance & Compliance

- [ ] **P5-1** `widgets/medical-approval-log` — searchable table (caseId/date/status), export filtered CSV.
- [ ] **P5-2** `widgets/consent-audit` — searchable table; rows deep-link into Caregiver Audit (Module 02).
- [ ] **P5-3** `widgets/forbidden-intent` — trend on top, log below; click spike → filters log to date range.
- [ ] **P5-4** `widgets/compliance-scorecard` — card grid (NCA/PDPL/DGA/NDMO); per-card + full "compliance pack" export; cards link to supporting logs.
- [ ] **P5-5** `widgets/knowledge-base` *(RFP gap)* — versioned bilingual (AR/EN) article manager: list/version/status (Draft/Published/Unpublished), scheduled publish, role-based publish rights.

**Exit:** Module 03 done, export + cross-module links working.

---

## Phase 6 — Module 04: Workforce & Quality

- [ ] **P6-1** `widgets/agent-grid` — sortable DataTable (AHT/FCR/QA/CSAT, r/a/g), filter by team/cluster, row → agent detail + history.
- [ ] **P6-2** `widgets/schedule-coverage` — calendar/gantt staffed-vs-forecast by hour/cluster; inline approve/reject shift-swaps (mutation + AuditLog).
- [ ] **P6-3** `widgets/qa-queue` — prioritized list (low sentiment/low confidence); item → transcript + scoring form; completed removed from queue.
- [ ] **P6-4** `widgets/training-impact` — before/after comparison; filter by module/date; agent click → training history + score trend.
- [ ] **P6-5** `widgets/ticket-queue` *(RFP gap)* — case/ticket queue (complaints + requests): status, priority, SLA due, escalation path, assign agent (mutation + AuditLog); row → Beneficiary 360.

**Exit:** Module 04 done.

---

## Phase 7 — Module 05: Executive Rollup

- [ ] **P7-1** `widgets/kpi-scorecard` — 7-KPI card grid (this week vs target vs last week); card click → owning module/metric.
- [ ] **P7-2** `widgets/cluster-ranking` — leaderboard, sortable by any KPI; cluster click → sets `?cluster=`.
- [ ] **P7-3** `widgets/savings-tracker` — trend; hover shows calc (volume × AHT saved); export for board.
- [ ] **P7-4** `widgets/beneficiary-voice` — plain-language theme cards; expand → anonymized examples + theme trend.
- [ ] **P7-5** `widgets/campaign-results` *(RFP gap)* — outbound campaign results: sent/delivered/responded, outcome by type (reminder/survey/awareness/reschedule).
- [ ] **P7-6** `widgets/penalty-impact` *(RFP §6 gap)* — SLA penalty / financial impact: failure % vs permissible tolerance per KPI/cluster, breach flag, estimated penalty (avg failure % × operating cost).

**Exit:** Module 05 done. Five spec modules complete.

---

## Phase 8 — Module 06: Operations & Integrations *(RFP-gap module)*

- [ ] **P8-1** `widgets/integration-nmr` — integration matrix health (Nafath/Mawid/Sehhaty/HR) + **NMR Live (Open API)** status: up/degraded/down, last sync, latency, sync/event pattern; no point-to-point.
- [ ] **P8-2** `widgets/system-health` — Availability vs 99.9999% target, DR RTO/RPO per channel, last DR test, KSA region/residency flag.
- [ ] **P8-3** `widgets/beneficiary-360` — search beneficiary (iqama/name) → full 360 profile: demographics, cross-channel interaction history, active cases, consent status, audit trail. Also drill-in target from agent rows / tickets / global search.

**Exit:** Module 06 done. Full RFP coverage matrix satisfied (ARCHITECTURE §6b).

---

## Phase 9 — Hardening & Production-Ready

- [ ] **P9-1** Loading skeletons + error boundaries per widget.
- [ ] **P9-2** Empty/locked/no-permission states everywhere.
- [ ] **P9-3** RTL pass (Arabic) — verify every widget mirrors correctly.
- [ ] **P9-4** Responsive pass — every page/widget at 360px → desktop (sidebar→sheet, table→scroll/stack, charts reflow).
- [ ] **P9-5** Accessibility (focus, aria, contrast for status colors + colorblind-safe icons/labels not color-only).
- [ ] **P9-6** Export endpoints finalized (CSV + print/PDF view).
- [ ] **P9-7** Auth hardening — session expiry, role-change handling, protected-route audit, sign-out everywhere.
- [ ] **P9-8** Seed refresh script + README run instructions.
- [ ] **P9-9** Coverage review vs design spec + **RFP §6b matrix** + KPIs — nothing dropped.

**Exit:** Functionally production-ready.

---

## Phase 10 — Polish *(final pass — the layer that makes it feel premium)*

- [ ] **P10-1** Run full UI through `ui-ux-pro-max` skill review pass; refine spacing rhythm, hierarchy, density per `UI_DESIGN_RULES.md`.
- [ ] **P10-2** Micro-interactions & motion — hover/expand/filter transitions (≤150ms), respect `prefers-reduced-motion`; no layout shift.
- [ ] **P10-3** Visual consistency audit via `ui-registry.md` (imprint) — every widget matches tokens, status badges, widget shell, typography scale.
- [ ] **P10-4** Empty/loading/error/locked states polished (skeletons match real layout, friendly copy, EN+AR).
- [ ] **P10-5** Chart/gauge/map visual polish — legends, tooltips, color ramps, gridlines, number formatting (tabular, thousands, %).
- [ ] **P10-6** Dark + light theme parity review; status colors meaningful and a11y-contrast in both.
- [ ] **P10-7** RTL polish — Arabic typography, mirrored icons/charts, no clipped text at any breakpoint.
- [ ] **P10-8** Performance polish — RSC streaming, suspense boundaries, image/font loading, no waterfall on dashboard load.
- [ ] **P10-9** Sign-in / shell / nav polish — first-impression screens feel finished.
- [ ] **P10-10** Final walkthrough on real device widths (mobile/tablet/desktop) in both themes + both locales.

**Exit:** Production-ready **and** polished.

---

## Build Order Summary
P0 → P1 → P2 → **P3 (Live Ops slice proves the pattern)** → P4 → P5 → P6 → P7 → P8 (Mod 06) → P9 (Hardening) → **P10 (Polish)**.
