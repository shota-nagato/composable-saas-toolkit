import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../schema'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations')

type Journal = {
  entries: { idx: number; tag: string }[]
}

/**
 * Create an in-memory SQLite database seeded by applying every migration
 * in packages/db/migrations/ in journal order.
 *
 * This validates the actual migration files (not hand-written DDL) and
 * exposes the real drizzle schema to tests, so schema/migration drift is
 * caught immediately.
 */
export function createTestDb(): {
  db: BetterSQLite3Database<typeof schema>
  raw: Database.Database
} {
  const raw = new Database(':memory:')
  raw.pragma('foreign_keys = ON')

  const journalPath = path.join(MIGRATIONS_DIR, 'meta', '_journal.json')
  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf-8')) as Journal
  const entries = [...journal.entries].sort((a, b) => a.idx - b.idx)

  for (const entry of entries) {
    const sql = fs.readFileSync(
      path.join(MIGRATIONS_DIR, `${entry.tag}.sql`),
      'utf-8',
    )
    const statements = sql
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean)
    for (const statement of statements) {
      raw.exec(statement)
    }
  }

  const db = drizzle(raw, { schema })
  return { db, raw }
}
