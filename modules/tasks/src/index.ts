import { singleTenantMiddleware } from '@toolkit/tenant'
import { factory } from './factory'
import taskRoutes from './routes/tasks'
import workflowStateRoutes from './routes/workflow-states'

const app = factory.createApp()

app.use('*', singleTenantMiddleware())

const routes = app
  .route('/api/tasks', taskRoutes)
  .route('/api/workflow-states', workflowStateRoutes)

export default routes
export type AppType = typeof routes
