/**
 * 認証ミドルウェアが必要とする環境変数 (Cloudflare Workers Bindings)
 */
export interface AuthBindings {
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  BETTER_AUTH_TRUSTED_ORIGINS?: string
}
