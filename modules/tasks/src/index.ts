import { authMiddleware } from '@toolkit/auth/middleware'
import { createAuth } from '@toolkit/auth/server'
import { singleTenantMiddleware } from '@toolkit/tenant'
import { HTTPException } from 'hono/http-exception'
import { factory } from './factory'
import taskRoutes from './routes/tasks'
import workflowStateRoutes from './routes/workflow-states'

const app = factory.createApp()

// DB 接続（auth もこの DB を使う）
app.use('*', singleTenantMiddleware())

// better-auth ハンドラ（認証不要のパブリックルート）
app.on(['GET', 'POST'], '/api/auth/**', async (c) => {
  const db = c.get('db')
  const auth = createAuth({
    db,
    baseUrl: c.env.BETTER_AUTH_URL,
    secret: c.env.BETTER_AUTH_SECRET,
    secureCookies: c.env.BETTER_AUTH_URL.startsWith('https://'),
  })
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
