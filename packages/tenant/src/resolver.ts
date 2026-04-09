import type { Database } from '@toolkit/db'

/**
 * Tenant context resolved for a single request.
 *
 * Any resolver (single-tenant, organization-based, header-based, etc.)
 * must return this shape so the middleware can populate `c.get('db')`
 * and `c.get('tenantId')` uniformly.
 */
export type ResolvedTenant = {
  db: Database
  tenantId: string
}

/**
 * Input passed to a `TenantResolver`. We deliberately avoid coupling the
 * resolver to Hono's `Context` type so that:
 *
 * 1. Resolvers can be unit-tested without instantiating a Hono app.
 * 2. Non-HTTP entry points (Cloudflare Queue consumers, Cron triggers,
 *    internal jobs) can reuse the same resolver by constructing this
 *    shape manually.
 * 3. Hono's invariant `Context` type parameters don't leak into the
 *    resolver's signature.
 */
export type TenantResolverInput<Bindings extends object = object> = {
  env: Bindings
  request: Request
}

/**
 * Strategy for resolving tenant context from an incoming request.
 *
 * Phase 1 uses `singleTenantResolver` — everything routes to a single
 * Turso database and `tenantId` is hardcoded to `'default'`.
 *
 * Phase 2 will introduce an organization-based resolver that reads the
 * active organization from the better-auth session and maps it to a
 * per-tenant Turso database URL. That resolver will implement this same
 * interface, so the middleware wiring does not need to change.
 *
 * Bindings is parameterized so each resolver can declare exactly which
 * env vars it depends on (e.g. single-tenant needs TURSO_DATABASE_URL,
 * multi-tenant needs TURSO_ORG + TURSO_GROUP_AUTH_TOKEN).
 *
 * Resolvers may return either a plain `ResolvedTenant` or a Promise.
 * Callers MUST await the result — a Phase 2 resolver that looks up the
 * active organization will almost certainly be async.
 */
export type TenantResolver<Bindings extends object = object> = (
  input: TenantResolverInput<Bindings>,
) => ResolvedTenant | Promise<ResolvedTenant>
