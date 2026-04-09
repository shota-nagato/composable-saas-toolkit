import { createDatabase } from '@toolkit/db/client'
import type { TenantResolver } from './resolver'
import type { SingleTenantBindings } from './types'

/**
 * Phase 1 resolver: every request routes to a single Turso database and
 * `tenantId` is hardcoded to `'default'`. Replaced in Phase 2 by an
 * organization-based resolver that maps active organization → DB.
 *
 * IMPORTANT: this is a *per-request factory*, not a singleton. Every
 * invocation constructs a fresh libsql HTTP client because Cloudflare
 * Workers cannot hold persistent connections across requests. Do not
 * cache the returned `db` across requests.
 *
 * For HTTP handlers, prefer `singleTenantMiddleware` — it already wires
 * the resolver into `c.set('db')` / `c.set('tenantId')`. Call this
 * function directly only from non-HTTP entry points (Queue consumers,
 * Cron triggers, internal jobs) where you must construct the
 * `{ env, request }` input manually.
 */
export const singleTenantResolver: TenantResolver<SingleTenantBindings> = ({
  env,
}) => ({
  db: createDatabase(env.TURSO_DATABASE_URL, env.TURSO_AUTH_TOKEN),
  tenantId: 'default',
})
