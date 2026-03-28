# CLAUDE.md

This file provides context for AI assistants working on this codebase.

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
  db/               → Drizzle schema + client (@toolkit/db)
  ui/               → UI component library (@toolkit/ui)
  tenant/           → Tenant middleware (@toolkit/tenant)
  tsconfig/         → Shared TypeScript configs
```

### Dependency Direction (strict)

```
apps/web → modules/tasks (type-only, for AppType)
         → packages/ui
modules/tasks → packages/db
              → packages/tenant
packages/tenant → packages/db
```

- Upper layers may depend on lower layers. Never the reverse.
- `packages/ui` has NO dependency on `packages/db` or `modules/tasks`.
- `packages/db` has NO dependency on any other workspace package.

## Key Architecture Decisions

### End-to-End Type Safety (Hono RPC)

`modules/tasks` exports `AppType`. `apps/web` imports it and creates a typed client:

```ts
// apps/web/src/lib/api.ts
import type { AppType } from '@toolkit/tasks'
import { hc } from 'hono/client'
export const client = hc<AppType>(baseUrl)
```

Response/request types are inferred, never hand-written:

```ts
export type Task = InferResponseType<typeof client.api.tasks.$get>[number]
export type CreateTaskInput = InferRequestType<typeof client.api.tasks.$post>['json']
```

### No Build Step for Packages

All packages (`db`, `ui`, `tenant`) export TypeScript source directly via `"exports"` in package.json. Vite handles transpilation. No `dist/` directories, no `tsc --build` for packages.

### Single-Tenant Middleware (Phase 1)

`singleTenantMiddleware()` creates a Drizzle DB instance per request using `@libsql/client/web` (HTTP transport for Workers). `tenantId` is hardcoded to `'default'`. Multi-tenant types (`MultiTenantBindings`) exist but are not yet implemented.

### Database Patterns

- All tables use `commonColumns` (`id: TEXT PK`, `createdAt`, `updatedAt`)
- `id` is caller-provided (`crypto.randomUUID()` in route handlers)
- `updatedAt` auto-updates via Drizzle's `$onUpdate` hook
- Dialect: SQLite (Turso). Use SQLite-compatible types and syntax.
- Migrations: Drizzle Kit (`pnpm db:migrate` in `packages/db`)
- Seeding: `pnpm seed` in `packages/db` (uses Node.js `@libsql/client`, not `/web`)

## UI Component Conventions (`packages/ui`)

### Design Tokens

All colors are defined as semantic tokens in `packages/ui/src/tokens.css` using Tailwind v4 `@theme`. Components MUST reference tokens, never hardcoded colors:

```tsx
// GOOD
'bg-primary text-primary-foreground hover:bg-primary-hover'
'border-border text-foreground'

// BAD
'bg-blue-600 text-white hover:bg-blue-700'
'border-gray-300 text-gray-900'
```

Token categories: `primary`, `destructive`, `success`, `warning`, `foreground`, `muted`, `surface`, `border`, `ring`.

### Component Patterns

- `forwardRef` on all components
- Extend native HTML attributes (`React.ButtonHTMLAttributes<HTMLButtonElement>`)
- `cn()` for class merging (clsx + tailwind-merge). Consumer `className` always last:
  ```ts
  className={cn('base-classes', variantClasses, className)}
  ```
- Variants use manual Record maps (no CVA). Only add variant systems when needed.
- `startIcon` / `endIcon` for icon slots (not `left`/`right` — use logical direction names)
- Radix UI only for complex interactive components (currently: Select)

### Naming Rules (from design guide)

- **variant values**: Semantic names, not visual (`primary` not `blue`, `destructive` not `red`)
- **size values**: T-shirt scale (`sm` / `md` / `lg`, extend with `xs` / `xl` / `2xl`)
- **No state in component names**: Use props (`variant="destructive"` not `DestructiveButton`)
- **Boolean props**: Prefix with `is` / `has` / `show` (`isDisabled`, `showIcon`)
- **Position props**: Use `start` / `end` not `left` / `right` (RTL-safe)

### Adding a New Component

1. Create `packages/ui/src/components/{name}.tsx`
2. Use `forwardRef`, extend native HTML attributes
3. Use `cn()` with token-based classes only
4. Export from `packages/ui/src/index.ts` (value + type)
5. Add sub-path export to `packages/ui/package.json` `"exports"`
6. Tailwind scanning: `@source` directive in `apps/web/src/index.css` covers `packages/ui/src`

## Frontend Conventions (`apps/web`)

### TanStack Query Hooks

- One file per resource: `hooks/useTasks.ts`, `hooks/useWorkflowStates.ts`
- Query key factory pattern:
  ```ts
  export const taskKeys = {
    all: ['tasks'] as const,
    detail: (id: string) => ['tasks', id] as const,
  }
  ```
- Mutations invalidate relevant query keys in `onSuccess`
- Error handling: `DetailedError` from `hono/client` for typed API errors

### File Organization

```
src/
  lib/          → API client, utilities
  hooks/        → TanStack Query hooks (one per resource)
  features/     → Feature-specific components (e.g., features/tasks/)
  App.tsx       → Root page
  main.tsx      → QueryClient setup, providers
```

## Backend Conventions (`modules/tasks`)

### Adding a New Route

1. Define Zod schema in `src/schemas/{resource}.ts`
2. Create route file in `src/routes/{resource}.ts` using `factory.createApp()`
3. Mount in `src/index.ts` via `app.route('/api/{resource}', routes)`
4. Access DB via `c.get('db')`, tenant via `c.get('tenantId')`
5. Return created/updated records by re-fetching after write (for server defaults)

### Error Handling

- Route-level: `throw new HTTPException(404, { message: '...' })`
- Validation: `zValidator('json', schema)` handles 400 automatically
- Global: `app.onError` catches all — returns structured `{ error: message }`

### Hono Factory Pattern

```ts
// src/factory.ts — typed factory, reused by all route files
import { createFactory } from 'hono/factory'
import type { Env } from './env'
export const factory = createFactory<Env>()
```

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

Local dev uses `turso dev --db-file .local/local.db`. Workers dev server reads from `.dev.vars` for `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.

## Database Schema & Migration Rules (`packages/db`)

### Schema Design

All schema lives in `packages/db/src/schema/`. No other package defines schema.

```
packages/db/
  src/
    schema/
      common.ts       → commonColumns (id, createdAt, updatedAt)
      tasks.ts        → tasks, workflowStates tables
      index.ts        → barrel export for all tables + types
    client.ts         → createDatabase() factory
    index.ts          → re-exports everything
  migrations/         → Drizzle Kit generated SQL files
  seed/               → Seed scripts (tsx)
  drizzle.config.ts   → Drizzle Kit config (dialect: turso)
```

### Adding a New Table

1. Define table in `packages/db/src/schema/{resource}.ts`
2. Always spread `commonColumns` for `id`, `createdAt`, `updatedAt`:
   ```ts
   import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
   import { commonColumns } from './common'

   export const projects = sqliteTable('projects', {
     ...commonColumns,
     name: text('name').notNull(),
     // ... other columns
   })
   ```
3. Export from `packages/db/src/schema/index.ts`
4. Generate migration: `cd packages/db && npx drizzle-kit generate`
5. Apply migration: `pnpm db:migrate` (runs `drizzle-kit migrate`)
6. If seed data is needed, add to `packages/db/seed/`

### Schema Conventions

- **Column naming**: snake_case in SQL (`state_id`), camelCase in Drizzle (`stateId`)
- **Primary key**: `TEXT` type, populated with `crypto.randomUUID()` in route handlers
- **Timestamps**: `TEXT` storing ISO datetime strings, not INTEGER unix timestamps
- **Foreign keys**: Explicit `.references(() => table.id)`. No cascade deletes by default.
- **Enums**: Use `text('col', { enum: [...] as const })` + SQLite `CHECK` constraint for runtime safety
- **Booleans**: SQLite has no boolean type. Use `integer('col', { mode: 'boolean' })` if needed.

### Migration Rules

- **Generate, don't hand-write**: Always use `npx drizzle-kit generate` to create migration SQL from schema changes. Never write migration SQL manually.
- **One migration per schema change**: Don't batch unrelated schema changes into one migration.
- **Migration file naming**: `prefix: 'timestamp'` is set in `drizzle.config.ts`, generating files like `20260329120000_add_projects.sql`. Always provide a descriptive `--name` flag:
  ```sh
  npx drizzle-kit generate --name add_projects
  ```
- **Review generated SQL**: Always read the generated `.sql` file before applying. Check for unintended `DROP` statements or data loss.
- **Forward-only**: No rollback mechanism. If a migration is wrong, create a new migration to fix it.
- **Test locally first**: Apply to local Turso (`pnpm db:migrate`) and verify before deploying to staging/production.

### Seeding

- Seed scripts in `packages/db/seed/` use Node.js `@libsql/client` (not `/web`) for local file DB support.
- Seed data uses deterministic IDs (e.g., `ws-todo`, `ws-in-progress`) for stability.
- `onConflictDoNothing()` makes seeds idempotent — safe to re-run.
- Run with: `cd packages/db && pnpm seed`

### Drizzle Kit Commands (run from `packages/db/`)

```sh
npx drizzle-kit generate --name <description>   # Generate migration from schema diff
npx drizzle-kit migrate                          # Apply pending migrations
npx drizzle-kit studio                           # Open Drizzle Studio (DB browser)
npx drizzle-kit push                             # Push schema directly (dev only, skips migration files)
```

## Code Style (Biome)

- 2-space indent, single quotes, no semicolons (except ASI-hazard)
- Imports auto-organized by Biome
- `noExplicitAny`: warn (avoid, but not blocked)
- A11y rules: warn level (address, not blocking)
- CSS/Tailwind: not linted by Biome (handled by Tailwind itself)

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
