---
name: new-route
description: Add a new API route to a module with Zod schema and CRUD handlers
argument-hint: [module-name/resource-name] e.g. tasks/comments
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob
---

Add a new API route for $ARGUMENTS.

Parse `$ARGUMENTS` as `{module}/{resource}`. Example: `tasks/comments` → module=tasks, resource=comments.

## Steps

1. Read the existing route pattern:
   - `modules/tasks/src/routes/tasks.ts` (CRUD handlers with zValidator)
   - `modules/tasks/src/schemas/tasks.ts` (Zod schemas)
   - `modules/tasks/src/index.ts` (route mounting and AppType export)

2. Ask the user what fields this resource needs (unless already specified)

3. Create Zod schema at `modules/{module}/src/schemas/{resource}.ts`:
   - `create{Resource}Schema` — for POST
   - `update{Resource}Schema` — for PATCH (all fields optional)

4. Create route at `modules/{module}/src/routes/{resource}.ts`:
   - GET `/` — list all
   - POST `/` — create with zValidator
   - GET `/:id` — get by id
   - PATCH `/:id` — update with zValidator
   - DELETE `/:id` — delete (204 No Content)
   - Follow the exact pattern from tasks.ts

5. Mount in `modules/{module}/src/index.ts`:
   - Add `.route('/api/{resource}', {resource}Routes)` to the chain
   - Export new Zod schemas

6. Update `apps/web/src/lib/api.ts`:
   - Add inferred types for the new resource

7. Run `pnpm typecheck` to verify the type chain

## Important
- Chain routes on `factory.createApp()` (not `new Hono()`)
- Re-fetch after INSERT/UPDATE for server defaults
- Export AppType from the chained routes
