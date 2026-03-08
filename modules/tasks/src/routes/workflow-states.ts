import { workflowStates } from '@toolkit/db'
import { factory } from '../factory'

const app = factory.createApp().get('/', async (c) => {
  const db = c.get('db')
  const states = await db
    .select()
    .from(workflowStates)
    .orderBy(workflowStates.position)
  return c.json(states)
})

export default app
