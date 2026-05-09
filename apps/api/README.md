# Backend (`apps/api`)

NestJS backend API for JV Dine.

## Prerequisites

- Node.js 20+
- pnpm 10.11.0
- PostgreSQL

## Local setup

From repo root:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:up
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm dev:api
```

Default URL: `http://localhost:5000`.

## Environment variables

`apps/api/.env`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://jvdine:jvdine@real-db.url.to.your.db/jv_dine?schema=public
DIRECT_URL=postgresql://jvdine:jvdine@real-db.url.to.your.db/jv_dine?schema=public
```

## Database notes

- Prisma schema: `apps/api/prisma/schema.prisma`
- Datasource provider: PostgreSQL
- `DatabaseService` uses `DIRECT_URL` first, then `DATABASE_URL`
- SSL DB connection is enabled only when `NODE_ENV=production`
- DB helper commands at root:
  - `pnpm db:up`
  - `pnpm db:down`
  - `pnpm db:logs`

## Commands

From repo root:

```bash
pnpm dev:api
pnpm --filter api start
pnpm --filter api start:dev
pnpm --filter api start:debug
pnpm --filter api start:prod
pnpm --filter api build
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api test:watch
pnpm --filter api test:cov
pnpm --filter api test:e2e
```

Prisma commands from root:

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
```

Prisma commands inside `apps/api`:

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:studio
```
