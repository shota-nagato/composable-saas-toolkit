import { sql } from 'drizzle-orm'
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { commonColumns } from './common'

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
    type: text('type', {
      enum: workflowStateTypes,
    }).notNull(),
    color: text('color'),
    position: integer('position').notNull().default(0),
  },
  (table) => [
    check(
      'type_check',
      sql`${table.type} IN ('backlog', 'unstarted', 'started', 'completed', 'canceled')`,
    ),
  ],
)

export const tasks = sqliteTable('tasks', {
  ...commonColumns,
  title: text('title').notNull(),
  description: text('description'),
  stateId: text('state_id')
    .notNull()
    .references(() => workflowStates.id),
})
