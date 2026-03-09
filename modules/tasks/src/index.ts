import { singleTenantMiddleware } from '@toolkit/tenant'
import { HTTPException } from 'hono/http-exception'
import { factory } from './factory'
import taskRoutes from './routes/tasks'
import workflowStateRoutes from './routes/workflow-states'

const app = factory.createApp()

app.use('*', singleTenantMiddleware())

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
