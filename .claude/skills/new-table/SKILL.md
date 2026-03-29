---
name: new-table
description: Add a new database table to packages/db with migration
argument-hint: [table-name]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash
---

Add a new database table named $ARGUMENTS to packages/db.

## Steps

1. Read existing schema patterns:
   - `packages/db/src/schema/common.ts` (commonColumns)
   - `packages/db/src/schema/tasks.ts` (table definition example with CHECK constraint, FK)
   - `packages/db/src/schema/index.ts` (barrel export)

2. Ask the user what columns this table needs (unless already specified)

3. Create `packages/db/src/schema/$ARGUMENTS.ts`:
   - Import and spread `commonColumns`
   - Use SQLite-compatible types
   - Use `snake_case` for SQL column names, `camelCase` for Drizzle property names
   - Add appropriate FK references, CHECK constraints, and indexes

4. Export the new table from `packages/db/src/schema/index.ts`

5. Generate migration:
   ```bash
   cd packages/db && npx drizzle-kit generate --name add_$ARGUMENTS
   ```

6. Show the generated SQL file content for review

7. After user confirms, apply migration:
   ```bash
   cd packages/db && pnpm db:migrate
   ```

## Important
- NEVER hand-write migration SQL files
- Always review the generated SQL before applying
- One migration per schema change
