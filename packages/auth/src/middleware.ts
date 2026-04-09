import { createMiddleware } from 'hono/factory'
import type { Auth, AuthSessionData, AuthUser } from './server'
import type { AuthBindings } from './server/types'

export interface AuthVariables {
  user: AuthUser
  session: AuthSessionData
  auth: Auth
}

/**
 * orgGuardMiddleware が設定する変数。
 * orgGuardMiddleware 適用ルートでのみ型安全にアクセス可能。
 */
export interface OrgVariables {
  organizationId: string
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
      return c.json({ error: 'Authentication required' }, 401)
    }

    c.set('user', session.user)
    c.set('session', session.session)

    await next()
  })

/**
 * Organization ガードミドルウェア
 *
 * セッションに activeOrganizationId が設定されていることを検証し、
 * c.get('organizationId') でアクセスできるようにする。
 * authMiddleware の後に適用すること（c.get('session') が必要）。
 */
export const orgGuardMiddleware = () =>
  createMiddleware<{
    Variables: AuthVariables & OrgVariables
  }>(async (c, next) => {
    const session = c.get('session')
    if (!session) {
      return c.json({ error: 'Authentication required' }, 401)
    }
    const orgId = session.activeOrganizationId
    if (!orgId) {
      return c.json({ error: 'Organization not selected' }, 403)
    }
    c.set('organizationId', orgId)
    await next()
  })
