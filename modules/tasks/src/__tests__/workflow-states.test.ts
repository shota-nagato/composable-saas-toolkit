import { beforeEach, describe, expect, it } from 'vitest'
import { createTestApp, jsonBody } from './helpers'

interface WorkflowState {
  id: string
  name: string
  type: string
  color: string | null
  position: number
}

describe('Workflow States API', () => {
  let app: ReturnType<typeof createTestApp>['app']

  beforeEach(() => {
    ;({ app } = createTestApp())
  })

  describe('GET /api/workflow-states', () => {
    it('シードされた 6 つのステートを返す', async () => {
      const res = await app.request('/api/workflow-states')

      expect(res.status).toBe(200)
      const body = await jsonBody<WorkflowState[]>(res)
      expect(body).toHaveLength(6)
    })

    it('各ステートに必要なフィールドがある', async () => {
      const res = await app.request('/api/workflow-states')
      const body = await jsonBody<WorkflowState[]>(res)
      const state = body[0]

      expect(state).toHaveProperty('id')
      expect(state).toHaveProperty('name')
      expect(state).toHaveProperty('type')
      expect(state).toHaveProperty('color')
      expect(state).toHaveProperty('position')
    })
  })
})
