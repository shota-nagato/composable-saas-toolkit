import { createClient } from '@libsql/client/web'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { drizzle } from 'drizzle-orm/libsql'

/**
 * Turso クライアントファクトリ
 *
 * Workersでは@libsql/client/web (HTTPトランスポート)を使用
 * Node.js用の@libsql/clientはローカルファイルURLをサポートするがworkersランタイムでは動作しない
 *
 * workersは永続接続をもてないためリクエストごとにクライアントを作成
 */
export const createDatabase = (url: string, authToken: string) => {
  const client = createClient({ url, authToken })
  return drizzle(client)
}

export type Database = LibSQLDatabase
