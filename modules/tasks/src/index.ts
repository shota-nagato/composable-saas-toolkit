import { singleTenantMiddleware } from '@toolkit/tenant'
import { factory } from './factory'
import taskRoutes from './routes/tasks'
import workflowStateRoutes from './routes/workflow-states'

const app = factory.createApp()

app.use('*', singleTenantMiddleware())

app.route('/api/tasks', taskRoutes)
app.route('/api/workflow-states', workflowStateRoutes)

export default app
