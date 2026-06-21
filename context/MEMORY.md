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
| 2026-06-21 | **SLA Heatmap: hand-drawn SVG → raw SVG + d3-geo + real GeoJSON** | Hand-drawn SVG replaced with raw `<svg>`/`<path>` rendered via `d3-geo` (`geoMercator().fitExtent(...)` + `geoPath`). **react-simple-maps was tried + abandoned** — its `projection` prop handling breaks with a pre-built d3 projection (`projectionStream is not a function`) and its center/scale config was unreliable; raw d3-geo gives full control. GeoJSON: geoBoundaries public-domain KSA ADM1 (`public/geo/ksa-regions.json`, 13 admin regions, `shapeISO` SA-01…SA-14). `react-simple-maps`/`@types/react-simple-maps` deps remain in package.json but unused — safe to remove later. |
| 2026-06-21 | **KSA GeoJSON: 13 admin regions, 20 DB clusters** — many-to-one | GeoJSON `shapeISO` (SA-01…SA-14) maps to `Cluster.region` string via `REGION_TO_ISO` in `lib/queries/live-operations.ts`. New `getSlaAdminRegionsData()` query aggregates clusters → admin regions (weighted-avg SL%, worst status, total volume). Old `getSlaHeatmapData()` kept intact. |
| 2026-06-21 | **Heatmap tooltip: desktop = pointer-following div, mobile = panel below map** | Tooltip clamped to container bounds. Mobile `min-h-[88px]` panel reserved to prevent layout jump on tap. |
| 2026-06-21 | **Geography fill strategy: CSS vars via inline style objects** | `react-simple-maps` Geography uses `style.default/hover/pressed` objects. CSS var tokens resolve at runtime in inline styles. `color-mix()` used for dimmed (non-selected) fills — no hardcoded hex. |
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

## Phase 0 — Technical Discoveries (critical for all future phases)
| Discovery | Detail |
|---|---|
| Prisma v7 URL config | `url` removed from `schema.prisma`. Lives in `prisma.config.ts` (`datasource.url`). Schema datasource has no url. |
| Prisma v7 client path | Generated to `lib/generated/prisma/client.ts` (not index.ts). Import as `@/lib/generated/prisma/client`. |
| Prisma v7 adapter | `PrismaClient` requires adapter. Use `@prisma/adapter-pg` + `PrismaPg`. No direct connectionString in constructor. |
| shadcn canary (base-ui) | Uses `@base-ui/react` not Radix. No `asChild` prop — use `render={<Element />}` instead. No `delayDuration` on TooltipProvider. |
| NextAuth beta JWT augmentation | `next-auth/jwt` module augmentation fails in beta. Store role via `(token as Record<string, unknown>).role`. |
| i18n Dict type | Don't use `as const` on en.ts — breaks AR translation assignability. Plain object, `typeof en` gives the type. |
| **Next 16 middleware = `proxy.ts`** | Middleware renamed to root `proxy.ts` in Next 16. Its `config.matcher` MUST exclude static-asset extensions (`json`/`geojson`/`woff` etc.) or files under `public/` get routed through `auth()` and return app HTML instead of the file. Symptom: `fetch('/x.json')` → `text/html`. |
| **Static file added after dev start** | Turbopack serves `public/` fine for files present at boot; the proxy matcher is the actual gate, not a restart. |
| **Seed snapshot timestamps** | SLA snapshots seeded at fixed hours 08/12/16/20 local. A short "live" window (60 min) misses them → all-zero data. `resolveDateBounds` live/today spans full day (start→end of today). |

## Change Log
- **2026-06-21 (SLA Heatmap rebuild — FINAL, working)** — Replaced hand-drawn SVG choropleth with **raw SVG + d3-geo** (dropped react-simple-maps — its projection-prop handling fought React 19 + caused `projectionStream is not a function`). Map: `geoMercator().fitExtent([[16,16],[784,584]], geo)` auto-fits all 13 regions to 800×600 viewBox; per-region `<path>` with CSS-var status fill, hover tooltip (desktop) + tap panel (mobile), click → `?cluster=<regionIso>`. New `getSlaAdminRegionsData()` aggregates 20 clusters → 13 admin regions via `REGION_TO_ISO`. GeoJSON: geoBoundaries gbOpen SAU ADM1 simplified, `public/geo/ksa-regions.json`. **4 bugs found+fixed:** (1) **`proxy.ts` matcher** missing `.json` → `/geo/*.json` routed through NextAuth, returned app HTML not file (THE blocker); added `json|geojson|ico|txt|woff|woff2` to exclusion. (2) **BOM** — `Set-Content -Encoding UTF8` wrote UTF-8-BOM, broke `JSON.parse`; re-saved no-BOM. (3) **date window** — `resolveDateBounds` live/today was 60-min, but seed snapshots land at fixed hours 08/12/16/20 → empty → all-zero data → all-red blob; widened to full-day. (4) projection scale/center (solved by fitExtent). 0 TS errors.
- **2026-06-21 (Phase 1 DONE)** — DB: `docker run -d --name wisal-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=wisal -p 5432:5432 postgres:16-alpine`. Prisma seed config: `migrations.seed` in `prisma.config.ts` (not root-level, not package.json in v7). 35 tables, largest: shift_coverages 6720, sla_snapshots 2400, resolution_splits/drift_snapshots/tier_snapshots 600 each.
- **2026-06-21 (Phase 1 partial)** — Schema done (P1-1), kpi.ts done (P1-3), seed.ts done (P1-4). AuditLog is polymorphic via plain `entity`/`entityId` strings — no FK relations (avoids duplicate constraint collision). Prisma `seed` config goes in `package.json` `"prisma"` key, not `prisma.config.ts` (no `seed` field in `PrismaConfig` type in v7). P1-2/P1-5 blocked on Postgres.
- **2026-06-21 (Phase 0 done)** — Build clean. All 6 P0 tasks done. See discoveries table above.
- **2026-06-21 (update)** — Applied 5 user updates + RFP gap-check across ARCHITECTURE/BUILD_PLAN/UI_RULES/AGENT/TRACKER (NextAuth, ui tooling, responsive, Polish phase, Module 06 + gaps). No code yet.
- **2026-06-21** — Initialized all context docs + AGENT.md. No code yet. Next action: Phase 0 scaffold.
