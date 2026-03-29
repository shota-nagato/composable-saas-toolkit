import type { Database } from '@toolkit/db'
import * as schema from '@toolkit/db/schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { BASE_PATH } from '../constants'

export { BASE_PATH }
export type { AuthBindings } from './types'

export interface CreateAuthParams {
  db: Database
  baseUrl: string
  secret: string
  trustedOrigins?: string[]
  secureCookies?: boolean
}

/**
 * BetterAuth インスタンスを作成
 *
 * Workers ではリクエストごとに生成（c.env が必要なため module-scope singleton 不可）
 * db は singleTenantMiddleware が作成済みのインスタンスを受け取る
 *
 * TODO(production): 本番リリース前に以下を対応すること
 * - requireEmailVerification: true に変更し、emailSender を注入する
 * - trustedOrigins にフロントエンド URL を必ず渡す（Vite proxy がない環境で CORS が壊れる）
 * - ipAddress: { ipAddressHeaders: ['x-forwarded-for'] } を追加（CF Workers の IP 検出）
 * - Rate Limiting カスタムルールを追加（sign-in: 5/60s, sign-up: 3/60s）
 *   参考: beat-managerz/packages/auth/src/server/options.ts
 * - secureCookies のデフォルトを baseUrl から自動判定に変更する検討
 */
export const createAuth = ({
  db,
  baseUrl,
  secret,
  trustedOrigins,
  secureCookies = true,
}: CreateAuthParams) => {
  return betterAuth({
    basePath: BASE_PATH,
    baseURL: baseUrl,
    secret,
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      usePlural: true,
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // TODO(production): true に変更 + emailSender 注入
    },
    plugins: [admin()],
    trustedOrigins: trustedOrigins ?? [], // TODO(production): フロントエンド URL を必ず含める
    advanced: {
      cookiePrefix: 'toolkit',
      defaultCookieAttributes: {
        sameSite: 'lax',
        secure: secureCookies,
      },
      // TODO(production): ipAddress: { ipAddressHeaders: ['x-forwarded-for'] }
    },
    // TODO(production): rateLimit カスタムルール追加
  })
}

export type Auth = ReturnType<typeof createAuth>

export type AuthSession = NonNullable<
  Awaited<ReturnType<Auth['api']['getSession']>>
>

export type AuthUser = AuthSession['user']

export type AuthSessionData = AuthSession['session']
