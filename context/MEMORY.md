# Wisal Command Center — Memory / Decision Log

Append-only record of decisions, changes, and rationale across sessions. Read at session start; write at session end or after any meaningful decision. Newest at top.

---

## Project Identity
- **What:** Wisal Command Center — the CRM/governance **admin dashboard** only (not the full call-center platform).
- **Client context:** HHC (Saudi Health Holding Company), Tender PR-00786. 20 HHC clusters.
- **Source docs:** `requirement/RFP.md`, `requirement/Wisal Command Center Design Spec.md`, `requirement/Wisal_Technical_File Detailed.md`.

## Locked Decisions
| Date | Decision | Rationale |
|---|---|---|
| 2026-06-21 | Stack: Next.js (App Router, **no src/**), Tailwind v4, shadcn/ui, Prisma, Postgres, Zod | User-specified |
| 2026-06-21 | **Real auth = NextAuth (Auth.js)**, Credentials provider now, OIDC/SSO-pluggable later; session role drives RBAC | User update — real sign-in |
| 2026-06-21 | **All UI built via `ui-ux-pro-max` skill + `21st.dev` MCP**; project rules override snippets | User update |
| 2026-06-21 | **Fully responsive** mandatory (UI §5b, mobile-first, test 360px) | User update |
| 2026-06-21 | Added **Polish phase (10)** at end of build plan | User update |
| 2026-06-21 | **RFP gap-check** → added Module 06 + 8 gap widgets + 9 gap models + §6b coverage matrix (NMR live, ticketing, KB, agent live-status, campaigns, penalties §6, integration health, system health/DR, 360) | Ensure nothing dropped from RFP |
| 2026-06-21 | **Theme toggle** via next-themes, **dark default** | Dark = monitoring wall; light = exec/compliance reading |
| 2026-06-21 | **Bilingual EN/AR + RTL-ready** (logical CSS props, dictionary i18n) | Saudi gov client |
| 2026-06-21 | **Full Prisma schema + seeded mock data**; no live telephony/AI integration | Production-ready dashboard, realistic data, integrations out of scope |
| 2026-06-21 | **All 5 modules, full depth** (~21 widgets) | User scope choice |
| 2026-06-21 | Status colors **derived** from `lib/kpi.ts`, never hardcoded; status = color+icon+text | Single source of truth + a11y |
| 2026-06-21 | RBAC enforced **server-side** at data layer; elevated widgets render locked state | Caregiver Audit + Kill Switch touch sensitive scope |
| 2026-06-21 | Saudi map = **inline SVG choropleth**, no external map tile dependency | KSA data residency vibe + zero external dep |
| 2026-06-21 | Server-first: RSC + Prisma reads, mutations via Zod-validated server actions | Next.js best practice |

## KPI Targets (authoritative — also in lib/kpi.ts)
SL 80%/20s (amber 78) · Abandoned ≤5% (amber ≤8) · AHT 5min · ASA ≤20s · FCR ≥90% (amber ≥85) · CSAT ≥95% (amber ≥85) · AI Completion ≥80% · AI Error <1% · Recruitment 10 working days · Availability 99.9999%.

## 5 Modules (routes)
01 Live Operations `/live-operations` (default) · 02 Wisal Intelligence `/intelligence` · 03 Governance & Compliance `/governance` · 04 Workforce & Quality `/workforce` · 05 Executive Rollup `/executive`.

## Open Questions / To Revisit
- Auth: **NextAuth Credentials** for this build. National SSO/OIDC swap is a later provider change (callbacks/session shape stay).
- Live updates: SSE vs polling against mock service — decide at P3-6, default to polling if SSE adds friction.
- Export: CSV first; PDF/print "compliance pack" in P8-6.
- Real external integrations (Nafath/Mawid/Sehhaty/HR) intentionally mocked.

## Change Log
- **2026-06-21 (update)** — Applied 5 user updates + RFP gap-check across ARCHITECTURE/BUILD_PLAN/UI_RULES/AGENT/TRACKER (NextAuth, ui tooling, responsive, Polish phase, Module 06 + gaps). No code yet.
- **2026-06-21** — Initialized all context docs + AGENT.md. No code yet. Next action: Phase 0 scaffold.
