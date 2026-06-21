# Wisal Command Center

CRM/governance admin dashboard for HHC (Saudi Health Holding Company), Tender PR-00786.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui (base-ui) · Prisma v7 · PostgreSQL · NextAuth (Auth.js)

---

## Prerequisites

- Node.js ≥ 20
- Docker (for Postgres) or an existing PostgreSQL instance
- `tsx` (installed as dev dependency)

---

## Quick start

### 1. Clone and install

```bash
npm install
```

### 2. Start Postgres

```bash
docker run -d \
  --name wisal-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=wisal \
  -p 5432:5432 \
  postgres:16-alpine
```

### 3. Configure environment

Copy `.env.example` to `.env.local` (or set directly):

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/wisal"
NEXTAUTH_SECRET="your-secret-here"   # generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Run migrations

```bash
npx prisma migrate deploy
```

### 5. Seed the database

```bash
npm run seed
```

Seeds: 20 HHC clusters, 5 role users, ~80 agents, SLA snapshots, incidents, AI metrics, audit logs, tickets, campaigns, integration status, system health, beneficiaries.

### 6. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/live-operations`.

---

## Test credentials (seeded)

| Role | Email | Password |
|---|---|---|
| Operator | `operator@wisal.sa` | `password123` |
| Supervisor | `supervisor@wisal.sa` | `password123` |
| Compliance | `compliance@wisal.sa` | `password123` |
| Executive | `executive@wisal.sa` | `password123` |
| Platform Admin | `admin@wisal.sa` | `password123` |

---

## Seed refresh

To reset and re-seed the database:

```bash
./scripts/seed-refresh.sh
```

Or manually:

```bash
npx prisma migrate reset --force
npm run seed
```

---

## Modules

| Route | Module |
|---|---|
| `/live-operations` | 01 Live Operations (default) |
| `/intelligence` | 02 Wisal Intelligence |
| `/governance` | 03 Governance & Compliance |
| `/workforce` | 04 Workforce & Quality |
| `/executive` | 05 Executive Rollup |
| `/operations` | 06 Operations & Integrations |

---

## Key architecture notes

- **No `src/` folder** — `app/` lives at repo root.
- **Middleware** is `proxy.ts` (Next 16 rename). Matcher excludes static asset extensions.
- **Prisma v7** — config in `prisma.config.ts`, client at `lib/generated/prisma/client.ts`.
- **shadcn/ui canary** — uses `@base-ui/react` (not Radix). No `asChild` prop; use `render={<Element />}`.
- **RTL** — all components use logical CSS props (`ps/pe/ms/me/start/end`). Toggle locale via top-bar button.
- **Status colors** — always derived from `lib/kpi.ts`. Never hardcoded hex in components.
- **RBAC** — enforced server-side at data layer. Elevated widgets render locked state, never silently hidden.
