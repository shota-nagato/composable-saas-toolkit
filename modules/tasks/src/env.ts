import type { AuthVariables, OrgVariables } from '@toolkit/auth/middleware'
import type { AuthBindings } from '@toolkit/auth/server'
import type { SingleTenantBindings, TenantVariables } from '@toolkit/tenant'

/**
 * 全ルート共通の Env（authMiddleware まで適用）
 */
export type Env = {
  Bindings: SingleTenantBindings & AuthBindings
  Variables: TenantVariables & AuthVariables
}

/**
 * orgGuardMiddleware 適用ルート用の Env
 * c.get('organizationId') が string として型安全にアクセス可能
 */
export type OrgEnv = {
  Bindings: Env['Bindings']
  Variables: Env['Variables'] & OrgVariables
}
