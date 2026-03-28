# Composable SaaS Toolkit

モジュール型の業務ツール SaaS。個別モジュール（タスク管理・ドキュメント・問い合わせ等）を組み合わせて顧客に提供し、顧客ごとの業務フローに合わせたカスタマイズを可能にする。

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS v4 |
| Backend | Hono (Cloudflare Workers) |
| Database | Drizzle ORM + Turso (LibSQL/SQLite) |
| Validation | Zod v4 |
| UI Components | `@toolkit/ui` (自前コンポーネントライブラリ) |
| Type Safety | Hono RPC による End-to-End 型安全 |
| Monorepo | pnpm workspaces + Turborepo |
| Linting | Biome |

## Monorepo Structure

```
composable-saas-toolkit/
├── apps/
│   └── web/                 React + Vite フロントエンド
├── modules/
│   └── tasks/               Cloudflare Workers API (タスク管理)
├── packages/
    ├── db/                  Drizzle ORM スキーマ + クライアント
    ├── ui/                  UI コンポーネントライブラリ
    ├── tenant/              テナントミドルウェア
    └── tsconfig/            共有 TypeScript 設定
```

## Prerequisites

- [Node.js](https://nodejs.org/) 22.21.1 ([Volta](https://volta.sh/) で自動管理)
- [pnpm](https://pnpm.io/) 10.22.0
- [Turso CLI](https://docs.turso.tech/cli/installation)

## Getting Started

### 1. Install dependencies

```sh
pnpm install
```

### 2. Start local database

```sh
# Turso のローカル開発サーバーを起動（別ターミナルで実行するか、pnpm dev に含まれる）
turso dev --db-file .local/local.db
```

### 3. Configure environment variables

```sh
# packages/db/.env
TURSO_DATABASE_URL=http://127.0.0.1:8080
TURSO_AUTH_TOKEN=dummy

# modules/tasks/.dev.vars
TURSO_DATABASE_URL=http://127.0.0.1:8080
TURSO_AUTH_TOKEN=dummy
```

### 4. Run migrations and seed

```sh
cd packages/db
npx drizzle-kit migrate
pnpm seed
```

### 5. Start development

```sh
# リポジトリルートから実行（Turso + Vite + Wrangler を同時起動）
pnpm dev
```

- Frontend: http://localhost:5173
- API (Wrangler): http://localhost:8787
- Vite が `/api` リクエストを Wrangler に自動プロキシ

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | 開発サーバー起動（Turso + Vite + Wrangler） |
| `pnpm build` | 全パッケージのビルド |
| `pnpm typecheck` | TypeScript 型チェック |
| `pnpm check` | Biome lint + format チェック |
| `pnpm check:fix` | Biome 自動修正 |
| `pnpm format` | Biome フォーマット |

### Database

```sh
cd packages/db
npx drizzle-kit generate --name <description>   # マイグレーション生成
npx drizzle-kit migrate                          # マイグレーション適用
npx drizzle-kit studio                           # Drizzle Studio（DB ブラウザ）
pnpm seed                                        # シードデータ投入
```

## Architecture

### End-to-End Type Safety

Hono RPC を使い、バックエンドのルート定義からフロントエンドの API クライアント型を自動推論。手書きの型定義やコード生成は不要。

```
modules/tasks (AppType export)
       ↓ type-only import
apps/web (hc<AppType> → 型安全な API クライアント)
```

### Package Dependencies

```
apps/web ──→ modules/tasks (型のみ)
         ──→ packages/ui
modules/tasks ──→ packages/db
              ──→ packages/tenant
packages/tenant ──→ packages/db
```

依存は常に上位 → 下位の一方通行。逆方向の依存は禁止。

### Design Tokens

UI コンポーネントはセマンティックなデザイントークン（`packages/ui/src/tokens.css`）を参照。ブランドカラーの変更やダークモード対応はトークンの値を変えるだけで実現可能。

## Contributing

開発規約の詳細は [CLAUDE.md](./CLAUDE.md) を参照。
