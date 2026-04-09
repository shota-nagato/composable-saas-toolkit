import { createFactory } from 'hono/factory'
import type { Env, OrgEnv } from './env'

export const factory = createFactory<Env>()

/** orgGuardMiddleware 適用ルート用。c.get('organizationId') が型安全 */
export const orgFactory = createFactory<OrgEnv>()
