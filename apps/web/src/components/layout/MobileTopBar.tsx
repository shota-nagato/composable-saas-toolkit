import { useLocation } from '@tanstack/react-router'
import { Avatar } from '@toolkit/ui'
import MenuIcon from '../../assets/svg/modules/menu.svg?react'
import { getActiveModule } from '../../config/modules'
import { useSidebar } from '../../contexts/SidebarContext'

interface MobileTopBarProps {
  userName: string
  userImage?: string | null
}

export function MobileTopBar({ userName, userImage }: MobileTopBarProps) {
  const { setMobileOpen } = useSidebar()
  const location = useLocation()
  const activeModule = getActiveModule(location.pathname)

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface px-3 lg:hidden">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <span className="text-sm font-semibold text-foreground">
        {activeModule?.label ?? 'Menu'}
      </span>

      <Avatar src={userImage} fallback={userName} size="sm" />
    </div>
  )
}
