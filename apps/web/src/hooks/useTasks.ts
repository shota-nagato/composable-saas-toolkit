import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DetailedError, parseResponse } from 'hono/client'
import { type CreateTaskInput, client, type UpdateTaskInput } from '../lib/api'

export const taskKeys = {
  all: ['tasks'] as const,
  detail: (id: string) => ['tasks', id] as const,
}

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: () => parseResponse(client.api.tasks.$get()),
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () =>
      parseResponse(client.api.tasks[':id'].$get({ param: { id } })),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateTaskInput) =>
      parseResponse(client.api.tasks.$post({ json: input })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
    },
    onError: handleMutationError,
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & UpdateTaskInput) =>
      parseResponse(
        client.api.tasks[':id'].$patch({ param: { id }, json: input }),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
    },
    onError: handleMutationError,
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await client.api.tasks[':id'].$delete({ param: { id } })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
    },
    onError: handleMutationError,
  })
}

function handleMutationError(error: Error) {
  if (error instanceof DetailedError) {
    console.error(`[API ${error.statusCode}]`, error.message, error.detail)
    return
  }
  console.error('[API]', error.message)
}
