import { createMiddleware } from 'hono/factory'
import { type AuthSessionData, type AuthUser, createAuth } from './server'
import type { AuthBindings } from './server/types'

export interface AuthVariables {
  user: AuthUser
  session: AuthSessionData
}

/**
 * 認証ミドルウェア
 *
 * セッションを検証し、ユーザー情報をコンテキストに設定する。
 * singleTenantMiddleware の後に適用すること（c.get('db') が必要）。
 */
export const authMiddleware = () =>
  createMiddleware<{
    Bindings: AuthBindings
    Variables: AuthVariables & { db: import('@toolkit/db').Database }
  }>(async (c, next) => {
    const db = c.get('db')
    const auth = createAuth({
      db,
      baseUrl: c.env.BETTER_AUTH_URL,
      secret: c.env.BETTER_AUTH_SECRET,
    })

    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (!session) {
      return c.json({ error: '認証が必要です' }, 401)
    }

    c.set('user', session.user)
    c.set('session', session.session)

    await next()
  })
