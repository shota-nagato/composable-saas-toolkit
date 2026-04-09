import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, organization } from 'better-auth/plugins'

/**
 * スキーマ生成専用の設定
 *
 * npx @better-auth/cli generate --config packages/auth/auth.config.ts \
 *   --output packages/db/src/schema/auth.ts
 */
export const auth = betterAuth({
  basePath: '/api/auth',
  emailAndPassword: { enabled: true },
  plugins: [admin(), organization()],
  database: drizzleAdapter({} as any, { provider: 'sqlite', usePlural: true }),
})
