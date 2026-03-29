import { sql } from 'drizzle-orm'
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { commonColumns } from './common'

/** CHECK 制約用の IN リスト。値はパラメータ化される（sql.raw 不使用） */
const sqlInList = (values: readonly string[]) =>
  sql.join(
    values.map((v) => sql`${v}`),
    sql`, `,
  )

export const workflowStateTypes = [
  'backlog',
  'unstarted',
  'started',
  'completed',
  'canceled',
] as const

export type WorkflowStateType = (typeof workflowStateTypes)[number]

export const workflowStates = sqliteTable(
  'workflow_states',
  {
    ...commonColumns,
    name: text('name').notNull(),
    type: text('type', { enum: workflowStateTypes }).notNull(),
    color: text('color'),
    position: integer('position').notNull().default(0),
  },
  (table) => [
    check(
      'type_check',
      sql`${table.type} IN (${sqlInList(workflowStateTypes)})`,
    ),
  ],
)

export const taskPriorityValues = [
  'urgent',
  'high',
  'medium',
  'low',
  'no_priority',
] as const

export type TaskPriority = (typeof taskPriorityValues)[number]

export const tasks = sqliteTable(
  'tasks',
  {
    ...commonColumns,
    title: text('title').notNull(),
    description: text('description'),
    stateId: text('state_id')
      .notNull()
      .references(() => workflowStates.id),
    priority: text('priority', { enum: taskPriorityValues })
      .notNull()
      .default('no_priority'),
  },
  (table) => [
    check(
      'priority_check',
      sql`${table.priority} IN (${sqlInList(taskPriorityValues)})`,
    ),
  ],
)
