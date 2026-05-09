# JV Dine Monorepo

Monorepo managed with `pnpm` workspaces and Turborepo for local development.

## Services

- `apps/web`: Next.js frontend
- `apps/api`: NestJS backend
- `apps/api/prisma`: Prisma schema (PostgreSQL)

## Prerequisites

- Node.js 20+
- `pnpm` 10+
- A PostgreSQL database (e.g. **Supabase**) — connection strings go only in **`apps/api/.env`** (there is **no** root `.env` in this repo).

## Local setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create env files from templates (**per app**, not at repo root):
   ```bash
   cp apps/api/.env.example apps/api/.env && cp apps/web/.env.example apps/web/.env.local
   ```
   Fill `DATABASE_URL`, `DIRECT_URL`, and JWT secrets in `apps/api/.env` using your Supabase project; web vars in `apps/web/.env.local`.
3. Generate Prisma client and apply migrations (against the DB URLs in `apps/api/.env`):
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate:dev
   ```
   For an existing remote DB that predates these migrations, see baseline notes in `apps/api/README.md`.
4. Start web and API together:
   ```bash
   pnpm dev
   ```

## Common commands

- `pnpm dev`: run all app dev servers
- `pnpm dev:web`: run web only
- `pnpm dev:api`: run API only
- `pnpm build`: build all apps
- `pnpm lint`: lint all apps
- `pnpm db:up` / `pnpm db:down` / `pnpm db:logs`: optional **local** PostgreSQL via Docker (only if you use `docker-compose.local.yml`; not required when using Supabase)

## App guides

- API setup and test commands: `apps/api/README.md`
- Web setup and test commands: `apps/web/README.md`
