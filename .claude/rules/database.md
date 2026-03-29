---
paths:
  - "packages/db/**/*.ts"
---

# Database Rules

## Schema Design
- 全テーブルに `commonColumns` を spread（id, createdAt, updatedAt）
- カラム名: SQL は `snake_case`, Drizzle は `camelCase`
- PK は `TEXT` 型、`crypto.randomUUID()` で生成
- タイムスタンプは `TEXT` (ISO datetime)。`INTEGER` (unix) は使わない
- FK は明示的 `.references(() => table.id)`。デフォルトで cascade delete なし
- Enum は `text('col', { enum: [...] as const })` + SQLite `CHECK` 制約
- Boolean は `integer('col', { mode: 'boolean' })`

## Migration
- 必ず `npx drizzle-kit generate --name <description>` で生成。手書き禁止
- 生成された SQL を必ず確認してから `pnpm db:migrate` で適用
- 無関係なスキーマ変更を 1 マイグレーションにまとめない
- ロールバック機構なし。修正は新しいマイグレーションで

## Seeding
- `packages/db/seed/` に配置。Node.js `@libsql/client` を使用（/web ではない）
- 決定的 ID（e.g., `ws-todo`）を使用
- `onConflictDoNothing()` で冪等性を確保
