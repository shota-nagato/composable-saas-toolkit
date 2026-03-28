import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { defaultWorkflowStates } from '../../../../packages/db/seed/default-workflow-states'
import type { Env } from '../env'
import taskRoutes from '../routes/tasks'
import workflowStateRoutes from '../routes/workflow-states'

/**
 * テスト用アプリを作成する
 *
 * - in-memory SQLite でDBを作成
 * - DDL でスキーマを作成
 * - デフォルトのワークフローステートをシード
 * - テナントミドルウェアをモックに差し替え
 */
export function createTestApp() {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite)

  sqlite.exec(`
    CREATE TABLE workflow_states (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('backlog', 'unstarted', 'started', 'completed', 'canceled')),
      color TEXT,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE tasks (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      title TEXT NOT NULL,
      description TEXT,
      state_id TEXT NOT NULL REFERENCES workflow_states(id)
    );
  `)

  // seed — better-sqlite3 の prepared statement で直接挿入
  // drizzle-orm の sql タグは pnpm の重複インスタンス問題で型が合わないため使わない
  const insert = sqlite.prepare(
    'INSERT INTO workflow_states (id, name, type, color, position) VALUES (?, ?, ?, ?, ?)',
  )
  for (const state of defaultWorkflowStates) {
    insert.run(state.id, state.name, state.type, state.color, state.position)
  }

  const app = new Hono<Env>()

  // テナントミドルウェアのモック
  // BetterSQLite3Database と LibSQLDatabase は Drizzle のクエリビルダーAPI が互換のため
  // ランタイムでは問題なく動作する。型の不一致は as any で許容。
  app.use('*', async (c, next) => {
    // biome-ignore lint/suspicious/noExplicitAny: BetterSQLite3Database → LibSQLDatabase の型差異を許容
    c.set('db', db as any)
    c.set('tenantId', 'test-tenant')
    await next()
  })

  // エラーハンドラー（本番と同じ）
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

  return { app, db }
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
