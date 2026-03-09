import { zValidator } from '@hono/zod-validator'
import { tasks } from '@toolkit/db'
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

    const id = crypto.randomUUID()
    await db.insert(tasks).values({
      id,
      title: body.title,
      description: body.description ?? null,
      stateId: body.stateId,
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

    await db
      .update(tasks)
      .set({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tasks.id, id))

    const [updated] = await db.select().from(tasks).where(eq(tasks.id, id))
    if (!updated) throw new HTTPException(404, { message: 'Task not found' })
    return c.json(updated)
  })
  .delete('/:id', async (c) => {
    const db = c.get('db')
    const id = c.req.param('id')
    await db.delete(tasks).where(eq(tasks.id, id))
    return c.body(null, 204)
  })

export default app
