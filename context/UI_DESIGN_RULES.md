# Wisal Command Center — UI Design Rules

The design spec deliberately left visual styling to the design system. These are the binding rules. Every widget must obey. When building a new component, **also** follow `imprint` → update `ui-registry.md` so later components match.

---

## 0. Design Tooling (mandatory for all UI work)

- Use the **`ui-ux-pro-max` skill** to plan, build, review, and refine every UI component/page/layout.
- Use the **`21st.dev` MCP** (and shadcn MCP) to source proven component patterns before hand-coding.
- Imported snippets are a starting point only — **these design rules override them** (tokens, status semantics, RTL, responsive).

---

## 1. Design Direction

**Modern command-center.** Data-dense but calm. Built for a 24/7 monitoring context AND for exec/compliance readers. Two themes via `next-themes`:

- **Dark = default** (Live Operations / monitoring-wall feel).
- **Light** (exec/compliance reading).

Both share the same semantic tokens. Never hardcode a hex in a component — use CSS variables / Tailwind theme tokens.

---

## 2. Color Tokens (CSS variables in `globals.css`)

Defined once under `:root` (light) and `.dark`. Components reference token names only.

**Surfaces**
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--muted`, `--muted-foreground`
- `--border`, `--input`, `--ring`
- `--popover`, `--popover-foreground`

**Brand / accent**
- `--primary` (teal/cyan family — calm, technical), `--primary-foreground`
- `--accent`, `--accent-foreground`

**Status semantics (THE most important — consistent everywhere)**
- `--status-green` (healthy / on-target)
- `--status-amber` (warning / tolerance band)
- `--status-red` (breach / critical)
- each with a `-bg` (tint) and `-fg` (text/icon) variant.

Status colors are the only colors allowed to carry meaning. Decorative use of red/amber/green is forbidden.

### Dark (default) reference
```
--background: #0B0F14   (near-black slate)
--card:       #131A22
--border:     #1F2A35
--foreground: #E6EDF3
--muted-foreground: #8B98A5
--primary:    #2DD4BF   (teal-400)
--status-green:#22C55E  --status-amber:#F59E0B  --status-red:#EF4444
```
### Light reference
```
--background: #F8FAFC
--card:       #FFFFFF
--border:     #E2E8F0
--foreground: #0F172A
--muted-foreground: #64748B
--primary:    #0D9488   (teal-600)
--status-green:#16A34A  --status-amber:#D97706  --status-red:#DC2626
```

---

## 3. Status = Color + Shape + Text (never color alone)

Accessibility + colorblind safety is mandatory.

| Status | Color | Icon | Label |
|---|---|---|---|
| Healthy | green | ● filled dot / check | "On target" |
| Warning | amber | ▲ triangle | "At tolerance" |
| Breach | red | ■ / alert | "Breaching" |

Status dot/badge = `<StatusBadge status="green|amber|red" />`. One component, used everywhere. Status is **always** derived from `lib/kpi.ts`, never passed as a raw color.

---

## 4. Typography

- **UI font:** Inter (or `geist-sans`). `--font-sans`.
- **Numerals:** tabular figures for all metrics/tables (`font-variant-numeric: tabular-nums`).
- **Arabic:** IBM Plex Sans Arabic (or Noto Sans Arabic) via `--font-arabic`; auto-applied when `dir=rtl`.
- Scale: text-xs (labels/meta) · text-sm (body/table) · text-base · text-lg (widget titles) · text-2xl/3xl (hero metric). No font sizes outside the scale.
- Widget title: `text-sm font-medium text-muted-foreground uppercase tracking-wide` (the spec calls them by name — keep them quiet, let the data shout).
- Big metric number: `text-3xl font-semibold tabular-nums`.

---

## 5. Spacing & Layout

- 4px base grid. Use Tailwind spacing only (`gap-2/3/4/6`, `p-4/6`).
- Module content = vertical stack of widget cards (spec: "vertical stack of sub-module widgets").
- Widget card: `rounded-xl border bg-card p-4 md:p-6`, subtle shadow in light, border-only in dark.
- Page padding: `p-4 md:p-6 lg:p-8`.
- Sidebar width: 256px (`w-64`), collapsed 64px. Top bar height: 56px (`h-14`).
- Max content width for reading modules (Governance/Executive): `max-w-screen-2xl`. Live Ops can go full-bleed.

---

## 5b. Responsive — Fully Responsive Is Mandatory

**Every page and widget must be fully responsive.** Not "works on desktop". Verify mobile, tablet, desktop before any UI task is marked done.

Breakpoints (Tailwind defaults): `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Design mobile-first (base styles = mobile, layer up with `md:`/`lg:`).

Rules:
- **Sidebar:** persistent rail on `lg+`; collapses to a hamburger → `Sheet` drawer below `lg`. Never two nav patterns visible at once.
- **Top bar:** on mobile, collapse cluster/date/search into a single filter `Sheet`/menu; keep theme/lang/account reachable. No horizontal overflow.
- **Widget grids:** `grid-cols-1` mobile → `sm:grid-cols-2` → `lg:grid-cols-3/4`. Card strips (Channel Pulse) scroll horizontally on mobile (`overflow-x-auto`, snap), wrap on desktop.
- **Tables:** never force a desktop table on a phone. Either horizontal scroll within a bordered container, OR a stacked card layout below `md`. Keep sort/search reachable.
- **Charts:** use `ResponsiveContainer`; reduce ticks/labels on small screens; min-height so they never collapse to 0.
- **Map (heatmap):** SVG scales with `viewBox` + `w-full h-auto`; tooltips become tap-to-open on touch.
- **Gauges / hero metrics:** stack vertically on mobile; sub-gauges become an accordion/tap reveal instead of hover.
- **Touch:** all interactive targets ≥ 44px; hover-only affordances must have a tap/click equivalent (tooltips, sub-gauge reveals, map cluster info).
- **No fixed pixel widths** that cause overflow; use `min-w-0`, `flex-wrap`, `max-w-full`. Test at 360px width minimum.
- Responsive **and** RTL must both hold at every breakpoint.

---

## 6. Widget Anatomy (every widget follows this)

```
WidgetCard
├── Header: title (quiet) · optional info-tooltip · optional view-toggle / filter
├── Body: the visualization (chart/table/gauge/map/list)
└── Footer (optional): last-updated, "export", or drill-in link
```

Reusable shell: `<Widget title info? actions?>{children}</Widget>`. Always include: loading skeleton, empty state, error state. Elevated widgets add a **locked** state.

---

## 7. RTL Rules (non-negotiable)

- Logical properties ONLY: `ps-/pe-`, `ms-/me-`, `start-/end-`, `text-start/text-end`. Never `pl/pr/ml/mr/left/right`.
- Icons that imply direction (chevrons, arrows, trends-time-axis) must mirror in RTL.
- Charts: time axis flows right→left in RTL.
- Numbers/latin data stay LTR inside RTL text (`dir="ltr"` span or `unicode-bidi`).

---

## 8. Charts (Recharts via shadcn chart)

- Use the shadcn `ChartContainer` + `chartConfig` pattern so colors come from tokens.
- Trend lines: 2px stroke, no dots unless interactive.
- Stacked tiers: T1/T2/T3 use a sequential accent ramp (NOT status colors — those mean health).
- Gauges: arc from `--muted` track to status color based on target.
- Donut: proportion; funnel toggle: volume. Tooltips show exact number + target.
- Map choropleth: only `--status-green/amber/red` fills; hover lifts + tooltip.

---

## 9. Tables (TanStack + shadcn DataTable)

- Sticky header, zebra optional, hover row highlight, sortable headers with arrow.
- Status cells use `<StatusBadge>`, not bare colored text.
- Row expand for audit/detail (chevron, mirrors in RTL).
- Searchable tables: search input top-start, export button top-end.
- Dense by default (`py-2`), tabular numerals.

---

## 10. Interaction & Motion

- Transitions ≤150ms, ease-out. Respect `prefers-reduced-motion`.
- Hover = elevate/tint, never layout shift.
- Destructive / high-stakes actions (Kill Switch, acknowledge-all) = confirmation dialog, never a bare toggle. Kill Switch confirm is *deliberately heavy* (typed/explicit confirm).
- Filter changes update URL; widgets show subtle loading, not full-page flash.

---

## 11. Iconography

- `lucide-react` only. 16/20px in UI, 24px for emphasis.
- Module icons (sidebar): Live Ops = Activity, Intelligence = BrainCircuit, Governance = ShieldCheck, Workforce = Users, Executive = LineChart.

---

## 12. Locked / No-Permission State

For RBAC-gated widgets (Caregiver Audit, Kill Switch, Governance for non-compliance roles): render the widget frame with a centered lock icon + "Elevated permission required" + the required role. Never silently hide — the frame proves the capability exists.

---

## 13. Do / Don't

✅ Use `ui-ux-pro-max` skill + `21st.dev` MCP for UI. ✅ Fully responsive (mobile-first, test at 360px). ✅ Derive status from `lib/kpi.ts`. ✅ Logical CSS props. ✅ One `StatusBadge`, one `Widget` shell. ✅ tabular-nums on metrics. ✅ Loading/empty/error/locked states.
❌ Desktop-only layouts. ❌ Hand-rolling UI without checking 21st.dev patterns. ❌ Hardcoded hex in components. ❌ Color-only status. ❌ `left/right` padding. ❌ New font sizes/colors off-token. ❌ Casual toggle for destructive actions. ❌ Hover-only affordances with no tap equivalent.
