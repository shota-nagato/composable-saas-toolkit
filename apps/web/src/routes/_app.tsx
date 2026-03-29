import { createFileRoute } from '@tanstack/react-router'
import { TooltipProvider } from '@toolkit/ui'
import { AppShell } from '../components/layout/AppShell'
import { authClient } from '../lib/auth'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()
    if (!session) {
      throw new Error('Unauthorized')
    }
    return { session }
  },
  errorComponent: () => {
    window.location.href = '/login'
    return null
  },
  component: AppLayout,
})

function AppLayout() {
  const { session } = Route.useRouteContext()

  return (
    <TooltipProvider delayDuration={300}>
      <AppShell session={session} />
    </TooltipProvider>
  )
}
