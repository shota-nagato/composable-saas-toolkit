import { zValidator } from '@hono/zod-validator'
import { tasks, workflowStates } from '@toolkit/db'
import { eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import { factory } from '../factory'
import { createTaskSchema, updateTaskSchema } from '../schemas/tasks'

const app = factory
  .createApp()
  .get('/', async (c) => {
    const db = c.get('db')
    const allTasks = await db.select().from(tasks)
    return c.json(allTasks)
  })
  .post('/', zValidator('json', createTaskSchema), async (c) => {
    const db = c.get('db')
    const body = c.req.valid('json')

    const [state] = await db
      .select()
      .from(workflowStates)
      .where(eq(workflowStates.id, body.stateId))
    if (!state) {
      throw new HTTPException(400, { message: 'Invalid stateId' })
    }

    const id = crypto.randomUUID()
    await db.insert(tasks).values({
      id,
      title: body.title,
      description: body.description ?? null,
      stateId: body.stateId,
      priority: body.priority,
    })

    const [created] = await db.select().from(tasks).where(eq(tasks.id, id))
    return c.json(created, 201)
  })
  .get('/:id', async (c) => {
    const db = c.get('db')
    const id = c.req.param('id')
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id))

    if (!task) throw new HTTPException(404, { message: 'Task not found' })
    return c.json(task)
  })
  .patch('/:id', zValidator('json', updateTaskSchema), async (c) => {
    const db = c.get('db')
    const id = c.req.param('id')
    const body = c.req.valid('json')

    if (body.stateId) {
      const [state] = await db
        .select()
        .from(workflowStates)
        .where(eq(workflowStates.id, body.stateId))
      if (!state) {
        throw new HTTPException(400, { message: 'Invalid stateId' })
      }
    }

    await db.update(tasks).set(body).where(eq(tasks.id, id))

    const [updated] = await db.select().from(tasks).where(eq(tasks.id, id))
    if (!updated) throw new HTTPException(404, { message: 'Task not found' })
    return c.json(updated)
  })
  .delete('/:id', async (c) => {
    const db = c.get('db')
    const id = c.req.param('id')
    const deleted = await db.delete(tasks).where(eq(tasks.id, id)).returning()
    if (deleted.length === 0) {
      throw new HTTPException(404, { message: 'Task not found' })
    }
    return c.body(null, 204)
  })

export default app
