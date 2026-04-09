import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@toolkit/ui'
import { parseResponse } from 'hono/client'
import { type CreateTaskInput, client, type UpdateTaskInput } from '../lib/api'
import { useApiErrorHandler } from './useApiErrorHandler'

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
  const onError = useApiErrorHandler()
  return useMutation({
    mutationFn: async (input: CreateTaskInput) =>
      parseResponse(client.api.tasks.$post({ json: input })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      toast('Task created', 'success')
    },
    onError,
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  const onError = useApiErrorHandler()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & UpdateTaskInput) =>
      parseResponse(
        client.api.tasks[':id'].$patch({ param: { id }, json: input }),
      ),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) })
    },
    onError,
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const onError = useApiErrorHandler()
  return useMutation({
    mutationFn: async (id: string) => {
      await parseResponse(client.api.tasks[':id'].$delete({ param: { id } }))
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      qc.removeQueries({ queryKey: taskKeys.detail(id) })
      toast('Task deleted')
    },
    onError,
  })
}
