import type { AppType } from '@toolkit/tasks'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { hc } from 'hono/client'

const baseUrl = import.meta.env.VITE_API_URL ?? '/'
export const client = hc<AppType>(baseUrl)

type TasksGetEndpoint = typeof client.api.tasks.$get
type TasksPostEndpoint = typeof client.api.tasks.$post

export type Task = InferResponseType<TasksGetEndpoint>[number]
export type CreateTaskInput = InferRequestType<TasksPostEndpoint>['json']
export type UpdateTaskInput = InferRequestType<
  (typeof client.api.tasks)[':id']['$patch']
>['json']
