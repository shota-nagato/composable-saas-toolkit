import { zValidator } from '@hono/zod-validator'
import { tasks, workflowStates } from '@toolkit/db'
import { and, eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import { orgFactory } from '../factory'
import { createTaskSchema, updateTaskSchema } from '../schemas/tasks'

const app = orgFactory
  .createApp()
  .get('/', async (c) => {
    const db = c.get('db')
    const orgId = c.get('organizationId')
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.organizationId, orgId))
    return c.json(allTasks)
  })
  .post('/', zValidator('json', createTaskSchema), async (c) => {
    const db = c.get('db')
    const orgId = c.get('organizationId')
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
      organizationId: orgId,
    })

    const [created] = await db.select().from(tasks).where(eq(tasks.id, id))
    return c.json(created, 201)
  })
  .get('/:id', async (c) => {
    const db = c.get('db')
    const orgId = c.get('organizationId')
    const id = c.req.param('id')
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.organizationId, orgId)))

    if (!task) throw new HTTPException(404, { message: 'Task not found' })
    return c.json(task)
  })
  .patch('/:id', zValidator('json', updateTaskSchema), async (c) => {
    const db = c.get('db')
    const orgId = c.get('organizationId')
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

    await db
      .update(tasks)
      .set(body)
      .where(and(eq(tasks.id, id), eq(tasks.organizationId, orgId)))

    const [updated] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.organizationId, orgId)))
    if (!updated) throw new HTTPException(404, { message: 'Task not found' })
    return c.json(updated)
  })
  .delete('/:id', async (c) => {
    const db = c.get('db')
    const orgId = c.get('organizationId')
    const id = c.req.param('id')
    const deleted = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.organizationId, orgId)))
      .returning()
    if (deleted.length === 0) {
      throw new HTTPException(404, { message: 'Task not found' })
    }
    return c.body(null, 204)
  })

export default app
