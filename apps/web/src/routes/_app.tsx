import { createFileRoute, redirect } from '@tanstack/react-router'
import { TooltipProvider } from '@toolkit/ui'
import { AppShell } from '../components/layout/AppShell'
import { authClient } from '../lib/auth'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
    return { session }
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
