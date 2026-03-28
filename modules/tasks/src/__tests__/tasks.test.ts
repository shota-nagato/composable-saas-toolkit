import { beforeEach, describe, expect, it } from 'vitest'
import {
  createTestApp,
  deleteRequest,
  jsonBody,
  jsonPatchRequest,
  jsonRequest,
} from './helpers'

interface Task {
  id: string
  title: string
  description: string | null
  stateId: string
  createdAt: string
  updatedAt: string
}

describe('Tasks API', () => {
  let app: ReturnType<typeof createTestApp>['app']

  beforeEach(() => {
    ;({ app } = createTestApp())
  })

  // -------------------------------------------------------
  // GET /api/tasks
  // -------------------------------------------------------
  describe('GET /api/tasks', () => {
    it('初期状態では空配列を返す', async () => {
      const res = await app.request('/api/tasks')

      expect(res.status).toBe(200)
      expect(await jsonBody(res)).toEqual([])
    })
  })

  // -------------------------------------------------------
  // POST /api/tasks
  // -------------------------------------------------------
  describe('POST /api/tasks', () => {
    it('タスクを作成できる', async () => {
      const res = await app.request(
        jsonRequest('/api/tasks', {
          title: 'テストタスク',
          stateId: 'ws-todo',
        }),
      )

      expect(res.status).toBe(201)
      const body = await jsonBody<Task>(res)
      expect(body.title).toBe('テストタスク')
      expect(body.stateId).toBe('ws-todo')
      expect(body.id).toBeDefined()
      expect(body.createdAt).toBeDefined()
    })

    it('title が空文字の場合 400 を返す', async () => {
      const res = await app.request(
        jsonRequest('/api/tasks', {
          title: '',
          stateId: 'ws-todo',
        }),
      )

      expect(res.status).toBe(400)
    })

    it('title が 255 文字を超える場合 400 を返す', async () => {
      const res = await app.request(
        jsonRequest('/api/tasks', {
          title: 'a'.repeat(256),
          stateId: 'ws-todo',
        }),
      )

      expect(res.status).toBe(400)
    })

    it('description に null を指定できる', async () => {
      const res = await app.request(
        jsonRequest('/api/tasks', {
          title: 'タスク',
          description: null,
          stateId: 'ws-todo',
        }),
      )

      expect(res.status).toBe(201)
      const body = await jsonBody<Task>(res)
      expect(body.description).toBeNull()
    })
  })

  // -------------------------------------------------------
  // GET /api/tasks/:id
  // -------------------------------------------------------
  describe('GET /api/tasks/:id', () => {
    it('存在するタスクを取得できる', async () => {
      const createRes = await app.request(
        jsonRequest('/api/tasks', {
          title: '取得テスト',
          stateId: 'ws-todo',
        }),
      )
      const created = await jsonBody<Task>(createRes)

      const res = await app.request(`/api/tasks/${created.id}`)

      expect(res.status).toBe(200)
      const body = await jsonBody<Task>(res)
      expect(body.title).toBe('取得テスト')
    })

    it('存在しない ID で 404 を返す', async () => {
      const res = await app.request('/api/tasks/nonexistent')

      expect(res.status).toBe(404)
      expect(await jsonBody(res)).toEqual({ error: 'Task not found' })
    })
  })

  // -------------------------------------------------------
  // PATCH /api/tasks/:id
  // -------------------------------------------------------
  describe('PATCH /api/tasks/:id', () => {
    it('title を更新できる', async () => {
      const createRes = await app.request(
        jsonRequest('/api/tasks', {
          title: '更新前',
          stateId: 'ws-todo',
        }),
      )
      const created = await jsonBody<Task>(createRes)

      const res = await app.request(
        jsonPatchRequest(`/api/tasks/${created.id}`, {
          title: '更新後',
        }),
      )

      expect(res.status).toBe(200)
      const body = await jsonBody<Task>(res)
      expect(body.title).toBe('更新後')
    })

    it('updatedAt が自動更新される', async () => {
      const createRes = await app.request(
        jsonRequest('/api/tasks', {
          title: 'タイムスタンプ確認',
          stateId: 'ws-todo',
        }),
      )
      const created = await jsonBody<Task>(createRes)

      await new Promise((r) => setTimeout(r, 10))

      const res = await app.request(
        jsonPatchRequest(`/api/tasks/${created.id}`, {
          title: '更新済み',
        }),
      )
      const updated = await jsonBody<Task>(res)

      expect(updated.updatedAt).not.toBe(created.updatedAt)
    })

    it('存在しない ID で 404 を返す', async () => {
      const res = await app.request(
        jsonPatchRequest('/api/tasks/nonexistent', {
          title: 'test',
        }),
      )

      expect(res.status).toBe(404)
      expect(await jsonBody(res)).toEqual({ error: 'Task not found' })
    })
  })

  // -------------------------------------------------------
  // DELETE /api/tasks/:id
  // -------------------------------------------------------
  describe('DELETE /api/tasks/:id', () => {
    it('タスクを削除できる', async () => {
      const createRes = await app.request(
        jsonRequest('/api/tasks', {
          title: '削除対象',
          stateId: 'ws-todo',
        }),
      )
      const created = await jsonBody<Task>(createRes)

      const deleteRes = await app.request(
        deleteRequest(`/api/tasks/${created.id}`),
      )
      expect(deleteRes.status).toBe(204)

      const getRes = await app.request(`/api/tasks/${created.id}`)
      expect(getRes.status).toBe(404)
    })
  })
})
