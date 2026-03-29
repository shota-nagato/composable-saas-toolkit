# CLAUDE.md

This file provides context for AI assistants working on this codebase.
Detailed rules for specific packages are in `.claude/rules/` (auto-loaded by path).

## Project Overview

Composable SaaS Toolkit — a modular, type-safe SaaS application built as a pnpm monorepo with Turborepo.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS v4 |
| Backend | Hono (Cloudflare Workers) |
| Database | Drizzle ORM + Turso (LibSQL/SQLite) |
| Validation | Zod v4 |
| UI Components | `@toolkit/ui` (self-built, Radix UI for Select only) |
| Type Safety | End-to-end via Hono RPC (`AppType` → `hc<AppType>` → `InferResponseType`) |
| Package Manager | pnpm 10.22 (strict catalog mode) |
| Node | 22.21.1 (pinned via Volta) |
| Linting | Biome |

## Monorepo Structure

```
apps/
  web/              → React + Vite frontend (@toolkit/web)
modules/
  tasks/            → Cloudflare Workers API (@toolkit/tasks)
packages/
  auth/             → Authentication (better-auth) (@toolkit/auth)
  db/               → Drizzle schema + client (@toolkit/db)
  ui/               → UI component library (@toolkit/ui)
  tenant/           → Tenant middleware (@toolkit/tenant)
  tsconfig/         → Shared TypeScript configs
```

### Dependency Direction (strict)

```
apps/web → modules/tasks (type-only, for AppType)
         → packages/ui
         → packages/auth (client-side auth)
modules/tasks → packages/auth
              → packages/db
              → packages/tenant
packages/auth   → packages/db
packages/tenant → packages/db
```

- Upper layers may depend on lower layers. Never the reverse.
- `packages/ui` has NO dependency on `packages/db`, `packages/auth`, or `modules/tasks`.
- `packages/db` has NO dependency on any other workspace package.

## Key Architecture Decisions

### End-to-End Type Safety (Hono RPC)

`modules/tasks` exports `AppType`. `apps/web` imports it and creates a typed client:

```ts
// apps/web/src/lib/api.ts
import type { AppType } from '@toolkit/tasks'
export const client = hc<AppType>(baseUrl)
```

Types are inferred, never hand-written:

```ts
export type Task = InferResponseType<typeof client.api.tasks.$get>[number]
export type CreateTaskInput = InferRequestType<typeof client.api.tasks.$post>['json']
```

Zod schemas are for **validation only** (shared from backend). Types always come from Hono RPC.

### No Build Step for Packages

All packages export TypeScript source directly via `"exports"` in package.json. Vite handles transpilation. No `dist/` directories.

### Single-Tenant Middleware (Phase 1)

`singleTenantMiddleware()` creates a Drizzle DB instance per request using `@libsql/client/web` (HTTP transport for Workers). `tenantId` is hardcoded to `'default'`.

## Development

```sh
pnpm dev              # Start Turso local + Vite dev + Wrangler dev
pnpm build            # Build all packages
pnpm typecheck        # TypeScript check across workspace
pnpm check            # Biome lint + format check
pnpm check:fix        # Biome auto-fix
```

### Local Database

```sh
cd packages/db
pnpm db:migrate       # Run Drizzle migrations
pnpm seed             # Seed workflow states
```

Local dev uses `turso dev --db-file .local/local.db`. Workers dev reads `.dev.vars` for `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.

## Code Style (Biome)

- 2-space indent, single quotes, no semicolons (except ASI-hazard)
- Imports auto-organized by Biome
- `noExplicitAny`: warn. A11y rules: warn level.

### Tailwind CSS v4

- Use built-in spacing scale (`w-45` = 180px) instead of arbitrary values (`w-[180px]`)
- Arbitrary values OK only when no utility exists

## Adding a New Package

1. Create `packages/{name}/package.json` with `"name": "@toolkit/{name}"`, `"private": true`, `"type": "module"`
2. Use `"exports"` map pointing to `.ts` source files (no build step)
3. Add shared deps to `pnpm-workspace.yaml` `catalog:` (strict mode — required)
4. Reference `catalog:` in package dependencies
5. Create `tsconfig.json` extending `../tsconfig/base.json` or `../tsconfig/react.json`
6. Run `pnpm install` from repo root to link

## Adding a New Module (Cloudflare Worker)

1. Create `modules/{name}/` with `wrangler.jsonc`, `package.json`, `src/index.ts`
2. Define `Env` type importing bindings from `@toolkit/tenant`
3. Create factory: `createFactory<Env>()`
4. Apply `singleTenantMiddleware()` globally
5. Export `AppType` for frontend consumption
6. Add `.dev.vars` with `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
