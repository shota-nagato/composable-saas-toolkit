import { authMiddleware } from '@toolkit/auth/middleware'
import { createAuth } from '@toolkit/auth/server'
import { singleTenantMiddleware } from '@toolkit/tenant'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { factory } from './factory'
import taskRoutes from './routes/tasks'
import workflowStateRoutes from './routes/workflow-states'

function parseTrustedOrigins(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
}

const app = factory.createApp()

// CORS — BETTER_AUTH_TRUSTED_ORIGINS と同じ許可リストを使用
app.use('/api/*', async (c, next) => {
  const allowedOrigins = parseTrustedOrigins(c.env.BETTER_AUTH_TRUSTED_ORIGINS)
  if (allowedOrigins.length === 0) {
    console.warn(
      'BETTER_AUTH_TRUSTED_ORIGINS is not set — CORS will block all cross-origin requests',
    )
  }

  const corsMiddleware = cors({
    origin: allowedOrigins,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 600,
  })
  return corsMiddleware(c, next)
})

// DB 接続（auth もこの DB を使う）
app.use('*', singleTenantMiddleware())

// auth インスタンスをリクエストごとに作成し、コンテキストに共有
// auth handler と authMiddleware が同一設定のインスタンスを使う
app.use('*', async (c, next) => {
  const db = c.get('db')
  const trustedOrigins = parseTrustedOrigins(c.env.BETTER_AUTH_TRUSTED_ORIGINS)
  const auth = createAuth({
    db,
    baseUrl: c.env.BETTER_AUTH_URL,
    secret: c.env.BETTER_AUTH_SECRET,
    trustedOrigins,
    secureCookies: c.env.BETTER_AUTH_URL.startsWith('https://'),
  })
  c.set('auth', auth)
  await next()
})

// better-auth ハンドラ（認証不要のパブリックルート）
app.on(['GET', 'POST'], '/api/auth/**', async (c) => {
  const auth = c.get('auth')
  return auth.handler(c.req.raw)
})

// 認証が必要なルート
app.use('/api/tasks/*', authMiddleware())
app.use('/api/workflow-states/*', authMiddleware())

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    if (err.res) return err.getResponse()
    return c.json({ error: err.message }, err.status)
  }
  console.error(err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

const routes = app
  .route('/api/tasks', taskRoutes)
  .route('/api/workflow-states', workflowStateRoutes)

export default routes
export type AppType = typeof routes
export { createTaskSchema, updateTaskSchema } from './schemas/tasks'
