import 'dotenv/config'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import {
  accounts,
  members,
  organizations,
  users,
  workflowStates,
} from '../src/schema'
import { defaultMembers, defaultOrganizations } from './default-organization'
import { createDefaultAccount, defaultUser } from './default-user'
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

  console.log('Seeding user...')
  await db.insert(users).values(defaultUser).onConflictDoNothing()

  console.log('Seeding account...')
  const account = await createDefaultAccount()
  await db.insert(accounts).values(account).onConflictDoNothing()

  console.log('Seeding organizations...')
  await db
    .insert(organizations)
    .values(defaultOrganizations)
    .onConflictDoNothing()

  console.log('Seeding members...')
  await db.insert(members).values(defaultMembers).onConflictDoNothing()

  console.log('Done.')
  client.close()
}

main()
