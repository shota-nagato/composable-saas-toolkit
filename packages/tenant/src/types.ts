import type { Database } from '@toolkit/db'

/**
 * テナントミドルウェアがセットするコンテキスト変数
 *
 * c.get("db")でDrizzleインスタンス、c.get("tenantId")でテナントIDを取得可能
 */
export type TenantVariables = {
  db: Database
  tenantId: string
}

/**
 * マルチテナントミドルウェア用のBindings
 *
 * テナント解決ミドルウェアが必要とする環境変数
 * 各モジュールのwrangler.jsoncで以下を設定:
 *  - TURSO_ORG: Tursoの組織名(varsで設定)
 *  - TURSO_GROUP_AUTH_TOKEN: Tursoグループトークン(wrangler secretで設定)
 */
export type MultiTenantBindings = {
  TURSO_ORG: string
  TURSO_GROUP_AUTH_TOKEN: string
}

/**
 * 固定テナントミドルウェア用の Bindings（Phase 1）
 *
 * singleTenantMiddleware が必要とする環境変数。
 * .dev.vars または wrangler.jsonc で設定。
 */
export type SingleTenantBindings = {
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
}
