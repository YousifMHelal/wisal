<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing
 any code. Heed deprecation notices.

 # Operating Rules for Wisal Command Center

You are a senior full-stack engineer building the **Wisal Command Center** (the CRM/governance admin dashboard for HHC). Follow these rules on **every** task. No exceptions.

---

## 0. READ BEFORE YOU TOUCH ANYTHING (mandatory)

Before adding or editing **any** file, read — in this order:

1. `context/ARCHITECTURE.md` — scope, stack, folder structure, data model, module↔widget map, non-negotiables.
2. `context/UI_DESIGN_RULES.md` — tokens, status rules, RTL rules, widget anatomy.
3. `context/BUILD_PLAN.md` — what phase/task you are on and its dependencies.
4. `context/PROGRESS_TRACKER.md` — current status, what's done.
5. `context/MEMORY.md` — locked decisions and open questions.
6. The relevant `requirement/` source doc if the task touches a feature's meaning.

If a task conflicts with these docs, **stop and flag it** — do not silently diverge.

---

## 1. AFTER YOU FINISH ANYTHING (mandatory)

1. **Update `context/PROGRESS_TRACKER.md`** — set the task's status to `DONE` (or `IN PROGRESS`/`BLOCKED`), update "Last updated" date, add a Changelog line.
2. **Tick the matching box in `context/BUILD_PLAN.md`** (`[ ]` → `[x]`).
3. If you made a decision, hit a tradeoff, or changed direction → **append to `context/MEMORY.md`** (newest at top).
4. If you built a UI component → follow the `imprint` rule: record its visual pattern so later components match (see UI rules §0).

A task is not "done" until the tracker and build plan reflect it.

---

## 2. Hard Rules (from ARCHITECTURE §9 + UI §13)

1. **No `src/` folder.** `app/` lives at repo root.
2. **Validate every input** at server-action / route boundaries with **Zod**.
3. **Status colors are derived** from `lib/kpi.ts` — never hardcode green/amber/red in a widget. Status = color **+** icon **+** text.
4. **RBAC on the server** (data layer), not just hidden UI. Elevated widgets (Caregiver Audit, Kill Switch, Governance) render a **locked state** when role is insufficient — never silently hidden.
5. **RTL-safe always:** logical CSS props only (`ps/pe/ms/me/start/end`). No `left/right/pl/pr/ml/mr`.
6. **No hardcoded hex in components.** Use CSS-variable tokens.
7. **Every mutation writes an `AuditLog` row.**
8. **Server-first:** RSC + Prisma for reads; client components only for interactivity; mutations via server actions.
9. **One `StatusBadge`, one `Widget` shell** — reuse, don't reinvent. Every widget has loading/empty/error (and locked, if gated) states.

---

## 2b. When Working on UI / Design (mandatory)

Any task that creates or changes a **visual component, page, layout, or styling**:

1. **Invoke the `ui-ux-pro-max` skill** first — use it to plan/build/review the UI (styles, palette, spacing, typography, component structure).
2. **Use the `21st.dev` MCP** (and shadcn MCP where useful) to search for and pull high-quality component patterns/examples before hand-rolling.
3. Then apply `context/UI_DESIGN_RULES.md` tokens + RTL + responsive rules on top of whatever you pull — our rules win over any imported snippet.
4. Every page/widget must be **fully responsive** (see UI rules §5b) — verify mobile, tablet, desktop before marking done.

## 3. Working Style

- Stay on the **current phase/task** in the build plan. Finish the Live Operations vertical slice (Phase 3) before later modules unless told otherwise.
- Prefer extending existing primitives over adding deps. New dependency = note it in MEMORY with rationale.
- Match surrounding code: same naming, structure, comment density.
- Keep widgets self-contained under `components/widgets/<widget-name>/`.
- Use the project's design tokens and i18n dictionary — no raw English strings hardcoded in JSX where a dictionary key fits.
- When unsure about a feature's *meaning*, re-read the relevant `requirement/` doc, not memory.

## 4. Definition of Done (per widget)
- [ ] Reads real (seeded) data via Prisma, respects cluster + date filters.
- [ ] RBAC enforced server-side if gated; locked state present.
- [ ] Loading / empty / error states.
- [ ] Status via `StatusBadge` + `lib/kpi.ts`.
- [ ] Built with `ui-ux-pro-max` skill + `21st.dev` MCP (for UI work).
- [ ] **Fully responsive** (mobile/tablet/desktop) verified.
- [ ] RTL verified (logical props).
- [ ] Matches the spec's described interactions.
- [ ] PROGRESS_TRACKER + BUILD_PLAN updated.

---

## 5. Quick Reference
- Modules: 01 Live Operations (default) · 02 Wisal Intelligence · 03 Governance & Compliance · 04 Workforce & Quality · 05 Executive Rollup.
- Roles: `OPERATOR | SUPERVISOR | COMPLIANCE | PLATFORM_ADMIN | EXECUTIVE`.
- Filters live in the URL (`?cluster=`, `?range=`/`?from=&to=`).
- KPI thresholds: `lib/kpi.ts` only.

<!-- END:nextjs-agent-rules -->

