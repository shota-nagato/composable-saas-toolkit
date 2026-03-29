import { Outlet } from '@tanstack/react-router'
import { SidebarProvider } from '../../contexts/SidebarContext'
import { authClient } from '../../lib/auth'
import { AppSidebar } from './AppSidebar'
import { MobileNav } from './MobileNav'
import { MobileTopBar } from './MobileTopBar'
import { ModuleSwitcher } from './ModuleSwitcher'

interface AppShellProps {
  session: {
    user: { name: string; email: string; image?: string | null }
    session: { id: string }
  }
}

export function AppShell({ session }: AppShellProps) {
  async function handleSignOut() {
    try {
      await authClient.signOut()
    } finally {
      window.location.href = '/login'
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-surface">
        {/* Desktop module switcher */}
        <ModuleSwitcher
          userName={session.user.name}
          userImage={session.user.image}
        />

        {/* Desktop + Mobile sidebar */}
        <AppSidebar userEmail={session.user.email} onSignOut={handleSignOut} />

        {/* Main content area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <MobileTopBar
            userName={session.user.name}
            userImage={session.user.image}
          />

          <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </SidebarProvider>
  )
}
