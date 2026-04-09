import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { tasks, workflowStates } from '../schema'
import { createTestDb } from './helpers'

describe('workflow_states schema', () => {
  let ctx: ReturnType<typeof createTestDb>
  beforeEach(() => {
    ctx = createTestDb()
  })

  it('inserts a workflow state with defaults applied', () => {
    ctx.db
      .insert(workflowStates)
      .values({ id: 'ws-1', name: 'Todo', type: 'unstarted' })
      .run()

    const rows = ctx.db.select().from(workflowStates).all()
    expect(rows).toHaveLength(1)
    const [row] = rows
    expect(row).toMatchObject({
      id: 'ws-1',
      name: 'Todo',
      type: 'unstarted',
      position: 0,
      color: null,
    })
    expect(row?.createdAt).toBeTruthy()
    expect(row?.updatedAt).toBeTruthy()
  })

  it('accepts all declared workflow state types', () => {
    const allTypes = [
      'backlog',
      'unstarted',
      'started',
      'in_review',
      'completed',
      'canceled',
    ] as const

    for (const [i, type] of allTypes.entries()) {
      ctx.db
        .insert(workflowStates)
        .values({ id: `ws-${i}`, name: type, type })
        .run()
    }

    const rows = ctx.db.select().from(workflowStates).all()
    expect(rows).toHaveLength(allTypes.length)
  })

  it('rejects a workflow state with an invalid type (CHECK constraint)', () => {
    expect(() =>
      ctx.raw.exec(
        `INSERT INTO workflow_states (id, name, type) VALUES ('ws-x', 'Bad', 'not_a_type')`,
      ),
    ).toThrow(/CHECK constraint failed/i)
  })
})

describe('tasks schema', () => {
  let ctx: ReturnType<typeof createTestDb>
  beforeEach(() => {
    ctx = createTestDb()
    ctx.db
      .insert(workflowStates)
      .values({ id: 'ws-todo', name: 'Todo', type: 'unstarted' })
      .run()
  })

  it('inserts a task with default priority = no_priority', () => {
    ctx.db
      .insert(tasks)
      .values({ id: 't-1', title: 'Test', stateId: 'ws-todo' })
      .run()

    const row = ctx.db.select().from(tasks).where(eq(tasks.id, 't-1')).get()
    expect(row).toMatchObject({
      id: 't-1',
      title: 'Test',
      stateId: 'ws-todo',
      priority: 'no_priority',
      description: null,
    })
  })

  it('persists all valid priority values', () => {
    const priorities = [
      'urgent',
      'high',
      'medium',
      'low',
      'no_priority',
    ] as const

    for (const [i, priority] of priorities.entries()) {
      ctx.db
        .insert(tasks)
        .values({
          id: `t-${i}`,
          title: priority,
          stateId: 'ws-todo',
          priority,
        })
        .run()
    }

    const rows = ctx.db.select().from(tasks).all()
    expect(rows.map((r) => r.priority).sort()).toEqual([...priorities].sort())
  })

  it('rejects a task with an invalid priority (CHECK constraint)', () => {
    expect(() =>
      ctx.raw.exec(
        `INSERT INTO tasks (id, title, state_id, priority) VALUES ('t-x', 'Bad', 'ws-todo', 'critical')`,
      ),
    ).toThrow(/CHECK constraint failed/i)
  })

  it('rejects a task with a non-existent stateId (FK constraint)', () => {
    expect(() =>
      ctx.db
        .insert(tasks)
        .values({ id: 't-y', title: 'Orphan', stateId: 'ws-missing' })
        .run(),
    ).toThrow(/FOREIGN KEY constraint failed/i)
  })

  it('has an index on tasks.state_id', () => {
    const indexes = ctx.raw
      .prepare(
        `SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'tasks'`,
      )
      .all() as { name: string }[]
    expect(indexes.some((i) => i.name === 'tasks_state_id_idx')).toBe(true)
  })
})

describe('auth schema (better-auth managed)', () => {
  let ctx: ReturnType<typeof createTestDb>
  beforeEach(() => {
    ctx = createTestDb()
  })

  it('enforces unique email on users', () => {
    ctx.raw.exec(
      `INSERT INTO users (id, name, email, updated_at) VALUES ('u-1', 'A', 'dup@example.com', 0)`,
    )
    expect(() =>
      ctx.raw.exec(
        `INSERT INTO users (id, name, email, updated_at) VALUES ('u-2', 'B', 'dup@example.com', 0)`,
      ),
    ).toThrow(/UNIQUE constraint failed/i)
  })

  it('cascades session deletes when user is removed', () => {
    ctx.raw.exec(
      `INSERT INTO users (id, name, email, updated_at) VALUES ('u-1', 'A', 'a@example.com', 0)`,
    )
    ctx.raw.exec(
      `INSERT INTO sessions (id, expires_at, token, updated_at, user_id) VALUES ('s-1', 9999999999, 'tok-1', 0, 'u-1')`,
    )
    ctx.raw.exec(`DELETE FROM users WHERE id = 'u-1'`)

    const remaining = ctx.raw
      .prepare(`SELECT COUNT(*) as c FROM sessions WHERE user_id = 'u-1'`)
      .get() as { c: number }
    expect(remaining.c).toBe(0)
  })
})
