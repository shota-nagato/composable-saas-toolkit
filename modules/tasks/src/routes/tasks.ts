import { zValidator } from '@hono/zod-validator'
import { tasks } from '@toolkit/db'
import { eq } from 'drizzle-orm'
import { factory } from '../factory'
import { createTaskSchema, updateTaskSchema } from '../schemas/tasks'

const app = factory.createApp()

app.get('/', async (c) => {
  const db = c.get('db')
  const allTasks = await db.select().from(tasks)
  return c.json(allTasks)
})

app.post('/', zValidator('json', createTaskSchema), async (c) => {
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

app.get('/:id', async (c) => {
  const db = c.get('db')
  const id = c.req.param('id')
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id))

  if (!task) return c.json({ error: 'Task not found' }, 404)
  return c.json(task)
})

app.patch('/:id', zValidator('json', updateTaskSchema), async (c) => {
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
  if (!updated) return c.json({ error: 'Task not found' }, 404)
  return c.json(updated)
})

app.delete('/:id', async (c) => {
  const db = c.get('db')
  const id = c.req.param('id')
  await db.delete(tasks).where(eq(tasks.id, id))
  return c.body(null, 204)
})

export default app
