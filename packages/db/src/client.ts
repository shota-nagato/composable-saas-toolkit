import { createClient } from '@libsql/client/web'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { drizzle } from 'drizzle-orm/libsql'

export const createDatabase = (url: string, authToken: string) => {
  const client = createClient({ url, authToken })
  return drizzle(client)
}

export type Database = LibSQLDatabase
