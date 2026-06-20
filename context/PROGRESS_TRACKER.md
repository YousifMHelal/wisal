# Wisal Command Center — Progress Tracker

Single source of truth for "what's done". The agent MUST update this after finishing any task, and tick the matching box in `BUILD_PLAN.md`.

Status: `TODO` · `IN PROGRESS` · `DONE` · `BLOCKED`

Last updated: 2026-06-21 — *docs updated (NextAuth, responsive, ui tooling, Module 06 + RFP gaps, Polish phase). No code yet.*

---

## Phase Summary

| Phase | Title | Status | Notes |
|---|---|---|---|
| 0 | Scaffold & Foundations | TODO | |
| 1 | Data Model & Seed | TODO | |
| 2 | App Shell | TODO | |
| 3 | Module 01 Live Operations | TODO | default landing, vertical slice |
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
| P0-1 | Init Next.js (no src) + Tailwind + ESLint | TODO |
| P0-2 | shadcn/ui init + base primitives | TODO |
| P0-3 | next-themes + CSS var tokens (light/dark) | TODO |
| P0-4 | i18n scaffold (en/ar) + dir flip | TODO |
| P0-5 | Prisma + Postgres + env (zod) | TODO |
| P0-6 | NextAuth setup + RBAC helpers + signin + dev role switcher | TODO |

### Phase 1 — Data
| ID | Task | Status |
|---|---|---|
| P1-1 | Full schema.prisma | TODO |
| P1-2 | Migrate | TODO |
| P1-3 | lib/kpi.ts (targets + status derivation) | TODO |
| P1-4 | seed.ts (20 clusters + users-per-role + all entities + RFP-gap data) | TODO |
| P1-5 | Run seed + verify | TODO |

### Phase 2 — Shell
| ID | Task | Status |
|---|---|---|
| P2-1 | (dashboard)/layout grid | TODO |
| P2-2 | Sidebar + live status dots | TODO |
| P2-3 | Top bar (cluster, date, search, theme, lang, account) | TODO |
| P2-4 | lib/filters.ts | TODO |
| P2-5 | Global search action | TODO |
| P2-6 | / → /live-operations redirect | TODO |

### Phase 3 — Live Operations
| ID | Task | Status |
|---|---|---|
| P3-1 | SLA Heatmap (map) | TODO |
| P3-2 | Channel Pulse (strip) | TODO |
| P3-3 | Active Incidents (ranked list) | TODO |
| P3-4 | Today vs Target (gauge) | TODO |
| P3-5 | Live Agent Status board *(RFP gap)* | TODO |
| P3-6 | Wire filters + live refresh | TODO |

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
- **2026-06-21 (update)** — User updates: (1) UI work must use `ui-ux-pro-max` skill + `21st.dev` MCP; (2) added **Polish phase 10**; (3) **fully responsive** rule (UI §5b) across all pages; (4) **real auth via NextAuth** replaces stub; (5) RFP gap-check → added **Module 06** + gap widgets (Live Agent Status, Knowledge Base, Ticket queue, Campaign Results, SLA Penalty, Integration/NMR, System Health, Beneficiary 360) + **§6b RFP coverage matrix** + 9 gap data models. Hardening renumbered to Phase 9.
- **2026-06-21** — Read 3 requirement docs. Created context docs: ARCHITECTURE, BUILD_PLAN, UI_DESIGN_RULES, PROGRESS_TRACKER, MEMORY, AGENT. Decisions: theme toggle (dark default), bilingual+RTL, full Prisma+seed, all 5 modules full depth. No code yet.
