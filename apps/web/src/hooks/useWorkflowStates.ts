import { useQuery } from '@tanstack/react-query'
import { parseResponse } from 'hono/client'
import { client } from '../lib/api'

export const workflowStateKeys = {
  all: ['workflow-states'] as const,
}

export function useWorkflowStates() {
  return useQuery({
    queryKey: workflowStateKeys.all,
    queryFn: () => parseResponse(client.api['workflow-states'].$get()),
    staleTime: 10 * 60 * 1000,
  })
}
