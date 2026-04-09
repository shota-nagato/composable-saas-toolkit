---
paths:
  - "packages/auth/**/*.ts"
  - "modules/*/src/index.ts"
---

# Auth Rules

## Auth Instance Management
- auth インスタンスは Worker のリクエストごとに 1 回だけ作成する
- `c.set('auth', auth)` でコンテキストに共有し、auth handler と authMiddleware の両方で使う
- auth handler と authMiddleware が異なる設定の createAuth を呼ぶのは禁止（設定不一致バグの原因）

## Auth Schema (packages/db/src/schema/auth.ts)
- better-auth CLI (`npx @better-auth/cli generate`) で自動生成。手動編集禁止
- `commonColumns` は使わない（better-auth が独自の id/createdAt を管理）
- テーブル名は複数形: `users`, `sessions`, `accounts`, `verifications` (`usePlural: true`)
- タイムスタンプは `INTEGER` (timestamp_ms)。通常の TEXT 規約の例外

## Auth Middleware Pattern
```typescript
// modules/{name}/src/index.ts — 全モジュール共通パターン
app.use('*', singleTenantMiddleware())   // DB 接続
app.use('*', async (c, next) => {        // auth インスタンス作成 + コンテキスト共有
  const auth = createAuth({ db: c.get('db'), ... })
  c.set('auth', auth)
  await next()
})
app.on(['GET', 'POST'], '/api/auth/**', async (c) => {
  return c.get('auth').handler(c.req.raw)  // 認証不要ルート
})
app.use('/api/{resource}/*', authMiddleware())  // 認証必須ルート
```

## Organization Scoped Routes (OrgVariables / OrgEnv)

Organization スコープのルートでは `AuthVariables` と `OrgVariables` を分離して型安全性を確保する。

- `AuthVariables`: `user`, `session`, `auth` — authMiddleware が設定
- `OrgVariables`: `organizationId` — orgGuardMiddleware が設定
- `orgGuardMiddleware` 未適用のルート（workflow-states 等）で `c.get('organizationId')` はコンパイルエラーになる

```typescript
// modules/{name}/src/env.ts
export type Env = {
  Bindings: SingleTenantBindings & AuthBindings
  Variables: TenantVariables & AuthVariables
}
export type OrgEnv = {
  Bindings: Env['Bindings']
  Variables: Env['Variables'] & OrgVariables
}

// modules/{name}/src/factory.ts
export const factory = createFactory<Env>()         // auth のみ
export const orgFactory = createFactory<OrgEnv>()   // auth + org

// modules/{name}/src/index.ts
app.use('/api/tasks/*', authMiddleware())
app.use('/api/tasks/*', orgGuardMiddleware())  // authMiddleware の後に適用
```

Organization スコープのルートファイルでは `orgFactory.createApp()` を使用する。

## Auth Client (Frontend)
- `better-auth/react` を使用（`useSession` フックが必要）
- `better-auth/client` は使わない（React フック未提供）
- `credentials: 'include'` で Cookie を送信

## TODO(production)
createAuth の TODO コメントを参照:
- requireEmailVerification → true
- trustedOrigins にフロントエンド URL
- ipAddress.ipAddressHeaders
- Rate Limiting カスタムルール
