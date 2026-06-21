# Wisal Command Center — Progress Tracker

Single source of truth for "what's done". The agent MUST update this after finishing any task, and tick the matching box in `BUILD_PLAN.md`.

Status: `TODO` · `IN PROGRESS` · `DONE` · `BLOCKED`

Last updated: 2026-06-21 — *Phase 3 DONE. SLA Heatmap rebuilt: react-simple-maps + real KSA GeoJSON (13 admin regions, geoBoundaries public domain). ComposableMap geoMercator [45,24] scale 800. Status fill via CSS var tokens. Hover tooltip + mobile tap panel. 0 TS errors.*

---

## Phase Summary

| Phase | Title | Status | Notes |
|---|---|---|---|
| 0 | Scaffold & Foundations | DONE | |
| 1 | Data Model & Seed | DONE | Docker postgres:16-alpine, 35 tables, verified |
| 2 | App Shell | DONE | layout + sidebar + topbar + filters + search |
| 3 | Module 01 Live Operations | IN PROGRESS | 5 widgets done, filters wired, SSE refresh |
| 4 | Module 02 Wisal Intelligence | TODO | RBAC + kill switch |
| 5 | Module 03 Governance & Compliance | TODO | export + cross-links + KB |
| 6 | Module 04 Workforce & Quality | TODO | + ticket/case queue |
| 7 | Module 05 Executive Rollup | TODO | + campaigns + penalties |
| 8 | Module 06 Operations & Integrations | TODO | NMR/integration, sys health, 360 (RFP gaps) |
| 9 | Hardening & Production-Ready | TODO | |
| 10 | Polish | TODO | ui-ux-pro-max final pass |

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
| P4-1 | Adaptive Tier Monitor | TODO |
| P4-2 | Caregiver Mode Audit (RBAC) | TODO |
| P4-3 | AI vs Human Split | TODO |
| P4-4 | Drift Watch | TODO |
| P4-5 | Kill Switch (admin + confirm) | TODO |

### Phase 5 — Governance & Compliance
| ID | Task | Status |
|---|---|---|
| P5-1 | Medical Content Approval Log | TODO |
| P5-2 | Consent & Disclosure Audit | TODO |
| P5-3 | Forbidden-Intent Triggers | TODO |
| P5-4 | Compliance Scorecard + export | TODO |
| P5-5 | Knowledge Base manager *(RFP gap)* | TODO |

### Phase 6 — Workforce & Quality
| ID | Task | Status |
|---|---|---|
| P6-1 | Agent Performance Grid | TODO |
| P6-2 | Schedule & Coverage | TODO |
| P6-3 | QA Sampling Queue | TODO |
| P6-4 | Training Impact Tracker | TODO |
| P6-5 | Ticket / Case queue *(RFP gap)* | TODO |

### Phase 7 — Executive Rollup
| ID | Task | Status |
|---|---|---|
| P7-1 | National KPI Scorecard | TODO |
| P7-2 | Cluster Ranking | TODO |
| P7-3 | Savings & Efficiency | TODO |
| P7-4 | Beneficiary Voice | TODO |
| P7-5 | Campaign Results *(RFP gap)* | TODO |
| P7-6 | SLA Penalty / Financial Impact *(RFP §6 gap)* | TODO |

### Phase 8 — Module 06 Operations & Integrations *(RFP gaps)*
| ID | Task | Status |
|---|---|---|
| P8-1 | Integration & NMR Live status | TODO |
| P8-2 | System Health / Availability / DR | TODO |
| P8-3 | Beneficiary 360 lookup + drill-in | TODO |

### Phase 9 — Hardening
| ID | Task | Status |
|---|---|---|
| P9-1 | Loading + error boundaries | TODO |
| P9-2 | Empty/locked states | TODO |
| P9-3 | RTL pass | TODO |
| P9-4 | Responsive pass | TODO |
| P9-5 | Accessibility | TODO |
| P9-6 | Export endpoints | TODO |
| P9-7 | Auth hardening | TODO |
| P9-8 | Seed script + README | TODO |
| P9-9 | Coverage review vs spec + RFP §6b matrix + KPIs | TODO |

### Phase 10 — Polish
| ID | Task | Status |
|---|---|---|
| P10-1 | ui-ux-pro-max full review pass | TODO |
| P10-2 | Micro-interactions & motion | TODO |
| P10-3 | Visual consistency audit (ui-registry) | TODO |
| P10-4 | Polished empty/loading/error/locked states | TODO |
| P10-5 | Chart/gauge/map visual polish | TODO |
| P10-6 | Dark+light theme parity | TODO |
| P10-7 | RTL polish | TODO |
| P10-8 | Performance polish | TODO |
| P10-9 | Sign-in / shell / nav polish | TODO |
| P10-10 | Final walkthrough (device widths × themes × locales) | TODO |

---

## Changelog (newest first)
- **2026-06-21 (SLA Heatmap rebuilt)** — P3-1: `SlaHeatmapWidget` rebuilt with `react-simple-maps@3` + real KSA GeoJSON (geoBoundaries, 13 ADM1 regions). New `getSlaAdminRegionsData()` query aggregates 20 clusters → 13 admin regions (weighted-avg SL%, worst status). `color-mix()` for dimmed fills, CSS var tokens throughout, hover tooltip + mobile tap panel, geoMercator [45,24] scale 800. 0 TS errors.
- **2026-06-21 (Phase 3 widgets DONE)** — P3-1: `SlaHeatmapWidget` SVG choropleth (20 KSA regions, status fill, hover tooltip, click→?cluster=, tap reveal mobile). P3-2: `ChannelPulseWidget` horizontal snap-scroll strip, 6 channels. P3-3: `ActiveIncidentsWidget` severity-ranked list, inline Recharts trend, `acknowledgeIncident` server action → AuditLog. P3-4: `TodayVsTargetWidget` arc gauge composite + 4 sub-gauges (SL/Abandoned/AHT/FCR). P3-5: `AgentStatusBoardWidget` cluster grid tiles (Avail/OnCall/Wrap/Break/Offline + utilisation bar). P3-6: `LiveRefresh` SSE client + `/api/stream` route + `revalidate=30` ISR. Shared `Widget/WidgetSkeleton/WidgetError/WidgetEmpty/WidgetLocked` shell. `lib/queries/live-operations.ts` all 4 queries. `lib/actions/incidents.ts` acknowledge mutation. 0 TS errors.
- **2026-06-21 (Phase 2 DONE)** — P2-1: `(dashboard)/layout.tsx` (sidebar + topbar + main grid, h-screen flex). P2-2: `SidebarRail` (256px rail lg+, collapsible to 64px, status dots) + `MobileNav` (Sheet drawer). P2-3: `TopBarClient` (cluster dropdown, date-range, global search with results, theme/lang/account) + `TopBar` RSC wrapper. P2-4: `lib/filters.ts` (parseFilters, resolveDateBounds, filtersToParams). P2-5: `lib/actions/search.ts` (globalSearch, clusters+agents+tickets). P2-6: root `/` already redirects. Also: `StatusBadge` shared component, `lib/module-status.ts` (worst-status per module, server-computed). 0 TS errors.
- **2026-06-21 (Phase 1 partial)** — P1-1: full schema.prisma (all entities from ARCHITECTURE §5 + RFP-gap models, 40+ enums, polymorphic AuditLog via plain entity/entityId strings). P1-3: lib/kpi.ts (all 10 KPIs, status() fn, STATUS_CLASSES). P1-4: seed.ts (20 clusters, 5 roles, ~80 agents, 120 SLA snapshots, all entity types seeded with realistic mixed green/amber/red). tsx added as dev dep. Prisma client generated. 0 TS errors. P1-2/P1-5 blocked — Postgres not reachable at localhost:5432.
- **2026-06-21 (Phase 0 done)** — Next.js 16 + Tailwind v4 + shadcn canary (base-ui) + next-themes (dark default) + i18n en/ar + Prisma v7 (adapter-pg) + NextAuth beta (Credentials, session role, middleware protection, signin page, RBAC helpers). Build clean, 0 TS errors. Key discoveries: Prisma v7 uses prisma.config.ts for URL (not schema.prisma); shadcn canary uses @base-ui/react (render prop, not asChild); generated client at lib/generated/prisma/client.ts.
- **2026-06-21 (update)** — User updates: (1) UI work must use `ui-ux-pro-max` skill + `21st.dev` MCP; (2) added **Polish phase 10**; (3) **fully responsive** rule (UI §5b) across all pages; (4) **real auth via NextAuth** replaces stub; (5) RFP gap-check → added **Module 06** + gap widgets (Live Agent Status, Knowledge Base, Ticket queue, Campaign Results, SLA Penalty, Integration/NMR, System Health, Beneficiary 360) + **§6b RFP coverage matrix** + 9 gap data models. Hardening renumbered to Phase 9.
- **2026-06-21** — Read 3 requirement docs. Created context docs: ARCHITECTURE, BUILD_PLAN, UI_DESIGN_RULES, PROGRESS_TRACKER, MEMORY, AGENT. Decisions: theme toggle (dark default), bilingual+RTL, full Prisma+seed, all 5 modules full depth. No code yet.
