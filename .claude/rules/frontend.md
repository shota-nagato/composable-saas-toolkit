---
paths:
  - "apps/web/**/*.{ts,tsx}"
---

# Frontend Rules

## Type Safety (Hono RPC)
- 型は Hono RPC から推論。手書き API 型は禁止
- `api.ts` が唯一の型レジストリ: InferResponseType / InferRequestType で定義
- フォーム型は Hono RPC 型を使用。`z.infer<typeof schema>` でフォーム型を作らない

## TanStack Query
- 1 リソース 1 ファイル: `hooks/useTasks.ts`, `hooks/useWorkflowStates.ts`
- Query key factory: `taskKeys.all`, `taskKeys.detail(id)`
- Mutation の onSuccess で `all` と `detail(id)` の両方を invalidate する
- Delete の onSuccess では `detail(id)` を `removeQueries` で即時削除
- `parseResponse` from `hono/client` でレスポンス処理。DetailedError で型付きエラー

## TanStack Router
- 認証ガードは `beforeLoad` で `throw redirect({ to: '/login' })` を使用
- `throw new Error` + `errorComponent` での遷移は禁止（ルーターの状態が壊れる）
- レイアウトルートのアンダースコア規約: `_app`（認証後）, `_auth`（未認証）

## Forms
- react-hook-form + `@hookform/resolvers/zod`
- Zod schema は backend (modules/*) からインポート（validation rules のみ）
- Controller は非ネイティブ入力のみ（Radix Select 等）
- 空文字は null に正規化して送信

## File Organization
```
src/
  lib/          → API client, type registry (api.ts)
  hooks/        → TanStack Query hooks (one per resource)
  features/     → Feature-specific components
```
