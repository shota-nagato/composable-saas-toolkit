import type { AuthVariables } from '@toolkit/auth/middleware'
import type { AuthBindings } from '@toolkit/auth/server'
import type { SingleTenantBindings, TenantVariables } from '@toolkit/tenant'

export type Env = {
  Bindings: SingleTenantBindings & AuthBindings
  Variables: TenantVariables & AuthVariables
}
