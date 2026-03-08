import { createDatabase } from '@toolkit/db/client'
import { createMiddleware } from 'hono/factory'
import type { SingleTenantBindings, TenantVariables } from './types'

/**
 * 固定テナントミドルウェア
 *
 * マルチテナント不要の段階で使用。環境変数 TURSO_DATABASE_URLにDB URLを設定し、テナント解決をスキップ
 */
export const singleTenantMiddleware = () =>
  createMiddleware<{
    Bindings: SingleTenantBindings
    Variables: TenantVariables
  }>(async (c, next) => {
    const db = createDatabase(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)

    c.set('db', db)
    c.set('tenantId', 'default')

    await next()
  })
