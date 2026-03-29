import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
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

  async function handleSignOut() {
    try {
      await authClient.signOut()
    } finally {
      window.location.href = '/login'
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface px-3 py-4">
        <div className="mb-6 px-2 text-sm font-semibold text-foreground">
          SaaS Toolkit
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          <Link
            to="/"
            className="rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground [&.active]:bg-surface-active [&.active]:text-foreground"
          >
            Tasks
          </Link>
        </nav>
        <div className="border-t border-border pt-3">
          <div className="mb-2 truncate px-2 text-xs text-muted">
            {session.user.email}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-md px-2 py-1.5 text-left text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
