import { createMiddleware } from 'hono/factory'
import type { Auth, AuthSessionData, AuthUser } from './server'
import type { AuthBindings } from './server/types'

export interface AuthVariables {
  user: AuthUser
  session: AuthSessionData
  auth: Auth
}

/**
 * 認証ミドルウェア
 *
 * セッションを検証し、ユーザー情報をコンテキストに設定する。
 * authHandlerMiddleware の後に適用すること（c.get('auth') が必要）。
 */
export const authMiddleware = () =>
  createMiddleware<{
    Bindings: AuthBindings
    Variables: AuthVariables & { db: import('@toolkit/db').Database }
  }>(async (c, next) => {
    const auth = c.get('auth')
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
