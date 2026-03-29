import { Link, useLocation } from '@tanstack/react-router'
import {
  Sheet,
  SheetContent,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@toolkit/ui'
import { cn } from '@toolkit/ui/utils'
import ChevronLeftIcon from '../../assets/svg/modules/chevron-left.svg?react'
import { getActiveModule } from '../../config/modules'
import { useSidebar } from '../../contexts/SidebarContext'

interface AppSidebarProps {
  userEmail: string
  onSignOut: () => void
}

function SidebarBody({ userEmail, onSignOut }: AppSidebarProps) {
  const location = useLocation()
  const activeModule = getActiveModule(location.pathname)

  return (
    <div className="flex h-full flex-col text-sm">
      {/* Module name header */}
      <div className="flex h-12 items-center px-4">
        <span className="font-semibold text-foreground">
          {activeModule?.label ?? 'Menu'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="space-y-0.5">
          {activeModule?.sidebarItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1 transition-colors',
                  isActive
                    ? 'bg-surface-active font-medium text-foreground'
                    : 'text-muted hover:bg-surface-hover hover:text-foreground',
                )}
              >
                {item.icon && (
                  <item.icon className="h-4 w-4 shrink-0 opacity-60" />
                )}
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-2.5">
        <div className="mb-1 truncate px-1 text-xs text-muted">{userEmail}</div>
        <button
          type="button"
          onClick={onSignOut}
          className="w-full rounded-md px-1 py-0.5 text-left text-xs text-muted transition-colors hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function SidebarToggle() {
  const { isOpen, toggle } = useSidebar()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'absolute top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface shadow-sm transition-opacity',
            isOpen
              ? '-right-3 opacity-0 group-hover/sidebar:opacity-100'
              : '-right-3 opacity-100',
          )}
        >
          <ChevronLeftIcon
            className={cn(
              'h-3.5 w-3.5 text-muted transition-transform duration-200',
              !isOpen && 'rotate-180',
            )}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {isOpen ? 'Collapse' : 'Expand'}
      </TooltipContent>
    </Tooltip>
  )
}

export function AppSidebar(props: AppSidebarProps) {
  const { isOpen, isMobileOpen, setMobileOpen } = useSidebar()

  return (
    <>
      {/* Desktop sidebar */}
      <div className="group/sidebar relative hidden shrink-0 lg:block">
        <aside
          className={cn(
            'h-full border-r border-border bg-surface transition-[width] duration-200',
            isOpen ? 'w-52' : 'w-0 overflow-hidden',
          )}
        >
          <div className="h-full w-52">
            <SidebarBody {...props} />
          </div>
        </aside>
        <SidebarToggle />
      </div>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent>
          <SidebarBody {...props} />
        </SheetContent>
      </Sheet>
    </>
  )
}
