import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@toolkit/ui'
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
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (input: CreateTaskInput) =>
      parseResponse(client.api.tasks.$post({ json: input })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      toast('Task created', 'success')
    },
    onError: (error) => handleMutationError(error, toast),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & UpdateTaskInput) =>
      parseResponse(
        client.api.tasks[':id'].$patch({ param: { id }, json: input }),
      ),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) })
    },
    onError: (error) => {
      console.error('[API]', error.message)
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (id: string) => {
      await client.api.tasks[':id'].$delete({ param: { id } })
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      qc.removeQueries({ queryKey: taskKeys.detail(id) })
      toast('Task deleted')
    },
    onError: (error) => handleMutationError(error, toast),
  })
}

function handleMutationError(
  error: Error,
  toast: (
    message: string,
    variant?: 'default' | 'success' | 'destructive',
  ) => void,
) {
  if (error instanceof DetailedError) {
    console.error(`[API ${error.statusCode}]`, error.message, error.detail)
    toast(error.message || 'An error occurred', 'destructive')
    return
  }
  console.error('[API]', error.message)
  toast('An error occurred', 'destructive')
}
