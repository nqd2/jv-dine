# JV Dine Monorepo

Monorepo managed with `pnpm` workspaces and Turborepo for local development.

## Services

- `apps/web`: Next.js frontend
- `apps/api`: NestJS backend
- `apps/api/prisma`: Prisma schema (PostgreSQL)

## Prerequisites

- Node.js 22+
- `pnpm` 10+
- Docker (recommended for local PostgreSQL)

## Local setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create local env file from template:
   ```bash
   cp .env.example .env
   ```
3. Start local PostgreSQL:
   ```bash
   pnpm db:up
   ```
4. Generate Prisma client and apply migrations:
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate:dev
   ```
5. Start web and API together:
   ```bash
   pnpm dev
   ```

## Common commands

- `pnpm dev`: run all app dev servers
- `pnpm dev:web`: run web only
- `pnpm dev:api`: run API only
- `pnpm build`: build all apps
- `pnpm lint`: lint all apps
- `pnpm db:up`: start local PostgreSQL
- `pnpm db:down`: stop local PostgreSQL
- `pnpm db:logs`: stream PostgreSQL logs

## App guides

- API setup and test commands: `apps/api/README.md`
- Web setup and test commands: `apps/web/README.md`
