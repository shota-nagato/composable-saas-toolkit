import { describe, expect, it } from 'vitest'
import { singleTenantResolver } from '../single-tenant-resolver'

describe('singleTenantResolver', () => {
  const env = {
    TURSO_DATABASE_URL: 'libsql://example.turso.io',
    TURSO_AUTH_TOKEN: 'test-token',
  }
  const request = new Request('http://localhost/')

  it("returns tenantId = 'default' regardless of request", async () => {
    const { tenantId } = await singleTenantResolver({ env, request })
    expect(tenantId).toBe('default')
  })

  it('returns a truthy drizzle database instance', async () => {
    const { db } = await singleTenantResolver({ env, request })
    expect(db).toBeTruthy()
    // Drizzle LibSQLDatabase exposes the query builder methods used by
    // consumers. We don't exercise the connection here — that would
    // require a live libsql server — but we verify the shape.
    expect(typeof db.select).toBe('function')
    expect(typeof db.insert).toBe('function')
  })

  it('constructs a fresh db instance on every call (per-request factory)', async () => {
    const a = await singleTenantResolver({ env, request })
    const b = await singleTenantResolver({ env, request })
    // Different instances — no caching. This pins the contract that
    // callers must not assume singleton behavior.
    expect(a.db).not.toBe(b.db)
  })
})
