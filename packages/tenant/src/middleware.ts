import { createMiddleware } from 'hono/factory'
import { singleTenantResolver } from './single-tenant-resolver'
import type { SingleTenantBindings, TenantVariables } from './types'

/**
 * 固定テナントミドルウェア
 *
 * マルチテナント不要の段階で使用。tenantId は `'default'` 固定、DB は
 * `TURSO_DATABASE_URL` を直接参照する。
 *
 * 内部的には `singleTenantResolver` (TenantResolver の Phase 1 実装) を
 * 呼び出しているだけで、Phase 2 ではこの呼び出し先を organization-based
 * resolver に差し替えるだけで multi-tenant 化できる設計。
 */
export const singleTenantMiddleware = () =>
  createMiddleware<{
    Bindings: SingleTenantBindings
    Variables: TenantVariables
  }>(async (c, next) => {
    const { db, tenantId } = await singleTenantResolver({
      env: c.env,
      request: c.req.raw,
    })

    c.set('db', db)
    c.set('tenantId', tenantId)

    await next()
  })
