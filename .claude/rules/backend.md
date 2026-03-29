---
paths:
  - "modules/**/*.ts"
---

# Backend Rules

## Route Pattern
- `factory.createApp()` でチェーン（`new Hono()` ではない）
- `zValidator('json', schema)` でリクエストバリデーション（400 自動処理）
- `crypto.randomUUID()` で ID 生成（DB 側で生成しない）
- INSERT/UPDATE 後に SELECT で再取得してレスポンス（サーバーデフォルト値を含める）
- DELETE は `c.body(null, 204)` で 204 No Content

## Error Handling
- ルートレベル: `throw new HTTPException(status, { message })`
- バリデーション: `zValidator` が 400 を自動処理
- グローバル: `app.onError` で全キャッチ → `{ error: message }`

## DB Access
- `c.get('db')` でテナント DB にアクセス（直接 import しない）
- `c.get('tenantId')` でテナント ID を取得

## Env Type
- `Env` 型は `src/env.ts` で定義。Bindings + Variables を合成
- `Variables` 内の `&` は安全。`Env` レベルの intersection は避ける

## AppType Export
- `src/index.ts` でルートをチェーンして `typeof routes` を `AppType` として export
- Zod schema も同ファイルから re-export
