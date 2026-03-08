import 'dotenv/config'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { workflowStates } from '../src/schema'
import { defaultWorkflowStates } from './default-workflow-states'

const main = async () => {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  const db = drizzle(client)

  console.log('Seeding workflow states...')
  await db
    .insert(workflowStates)
    .values(defaultWorkflowStates)
    .onConflictDoNothing()

  console.log('Done.')
  client.close()
}

main()
