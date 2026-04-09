import { useToast } from '@toolkit/ui'
import { DetailedError } from 'hono/client'
import { useCallback } from 'react'

/**
 * Shared error handler for TanStack Query mutations against Hono RPC endpoints.
 * Logs to console and surfaces a destructive toast. Pass the returned callback
 * directly to `useMutation({ onError })`.
 */
export function useApiErrorHandler() {
  const { toast } = useToast()
  return useCallback(
    (error: Error) => {
      if (error instanceof DetailedError) {
        console.error(`[API ${error.statusCode}]`, error.message, error.detail)
        toast(error.message || 'An error occurred', 'destructive')
        return
      }
      console.error('[API]', error.message)
      toast('An error occurred', 'destructive')
    },
    [toast],
  )
}
