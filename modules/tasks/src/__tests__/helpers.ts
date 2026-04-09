import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { defaultWorkflowStates } from '../../../../packages/db/seed/default-workflow-states'
import type { OrgEnv } from '../env'
import taskRoutes from '../routes/tasks'
import workflowStateRoutes from '../routes/workflow-states'

/** in-memory DB + DDL + シード。複数 app で共有可能 */
function createTestDb() {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite)

  sqlite.exec(`
    CREATE TABLE workflow_states (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('backlog', 'unstarted', 'started', 'in_review', 'completed', 'canceled')),
      color TEXT,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE tasks (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      title TEXT NOT NULL,
      description TEXT,
      state_id TEXT NOT NULL REFERENCES workflow_states(id),
      priority TEXT NOT NULL DEFAULT 'no_priority' CHECK (priority IN ('urgent', 'high', 'medium', 'low', 'no_priority')),
      organization_id TEXT NOT NULL
    );

    CREATE INDEX tasks_state_id_idx ON tasks (state_id);
    CREATE INDEX tasks_organization_id_idx ON tasks (organization_id);
  `)

  const insert = sqlite.prepare(
    'INSERT INTO workflow_states (id, name, type, color, position) VALUES (?, ?, ?, ?, ?)',
  )
  for (const state of defaultWorkflowStates) {
    insert.run(state.id, state.name, state.type, state.color, state.position)
  }

  return { sqlite, db }
}

/** 指定 organizationId でリクエストする Hono app を作成 */
function buildApp(db: ReturnType<typeof drizzle>, organizationId: string) {
  const app = new Hono<OrgEnv>()

  app.use('*', async (c, next) => {
    // biome-ignore lint/suspicious/noExplicitAny: BetterSQLite3Database → LibSQLDatabase の型差異を許容
    c.set('db', db as any)
    c.set('tenantId', 'test-tenant')
    c.set('organizationId', organizationId)
    await next()
  })

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      if (err.res) return err.getResponse()
      return c.json({ error: err.message }, err.status)
    }
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  })

  app.route('/api/tasks', taskRoutes)
  app.route('/api/workflow-states', workflowStateRoutes)

  return app
}

/**
 * テスト用アプリを作成する（既存テスト互換）
 *
 * - in-memory SQLite でDBを作成
 * - DDL でスキーマを作成
 * - デフォルトのワークフローステートをシード
 * - テナント + org ミドルウェアをモックに差し替え
 */
export function createTestApp() {
  const { db } = createTestDb()
  const app = buildApp(db, 'test-org')
  return { app, db }
}

/**
 * クロス org 分離テスト用：同一 DB を共有する 2 つの app を作成
 */
export function createMultiOrgTestApps() {
  const { db } = createTestDb()
  const appOrgA = buildApp(db, 'org-a')
  const appOrgB = buildApp(db, 'org-b')
  return { appOrgA, appOrgB, db }
}

/** レスポンスボディを型付きで取得 */
export async function jsonBody<T = Record<string, unknown>>(
  res: Response,
): Promise<T> {
  return (await res.json()) as T
}

/** JSON POST リクエストを作成するヘルパー */
export function jsonRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

/** JSON PATCH リクエストを作成するヘルパー */
export function jsonPatchRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

/** DELETE リクエストを作成するヘルパー */
export function deleteRequest(path: string) {
  return new Request(`http://localhost${path}`, {
    method: 'DELETE',
  })
}
