---
name: new-module
description: Create a new Cloudflare Worker module following project conventions
argument-hint: [module-name]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

Create a new Cloudflare Worker module named $ARGUMENTS following the project conventions.

## Steps

1. Read the existing module structure for reference:
   - `modules/tasks/package.json`
   - `modules/tasks/wrangler.jsonc`
   - `modules/tasks/src/index.ts`
   - `modules/tasks/src/env.ts`
   - `modules/tasks/src/factory.ts`
   - `modules/tasks/tsconfig.json`

2. Create the new module at `modules/$ARGUMENTS/` with identical structure:
   - `package.json` — name: `@toolkit/$ARGUMENTS`, same dependency pattern (use `catalog:`)
   - `wrangler.jsonc` — name: `$ARGUMENTS`, compatibility_flags: ["nodejs_compat"]
   - `src/index.ts` — Hono app with singleTenantMiddleware, onError, AppType export
   - `src/env.ts` — Env type (Bindings + Variables)
   - `src/factory.ts` — `createFactory<Env>()`
   - `src/routes/` — empty directory (create a placeholder)
   - `src/schemas/` — empty directory (create a placeholder)
   - `tsconfig.json` — extends `../../packages/tsconfig/worker.json`
   - `.dev.vars` — TURSO_DATABASE_URL=http://127.0.0.1:8080 and TURSO_AUTH_TOKEN=dummy

3. Run `pnpm install` from the repo root to link the new package

4. Verify: `cd modules/$ARGUMENTS && pnpm typecheck`

## Important
- Follow CLAUDE.md "Adding a New Module" section exactly
- Use `catalog:` for all shared dependencies in package.json
- Export `AppType` for frontend consumption
- Do NOT create a build step — TypeScript source is exported directly
