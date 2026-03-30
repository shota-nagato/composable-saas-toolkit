import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@toolkit/ui/utils'
import { modules, settingsModule } from '../../config/modules'

export function MobileNav() {
  const location = useLocation()

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      <nav className="flex items-center justify-around px-2 py-1.5">
        {modules.map((mod) => {
          const isActive =
            mod.basePath === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(mod.basePath)
          return (
            <Link
              key={mod.id}
              to={mod.basePath}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 transition-colors',
                isActive ? 'text-primary' : 'text-muted hover:text-foreground',
              )}
            >
              <mod.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{mod.label}</span>
            </Link>
          )
        })}
        <Link
          to={settingsModule.path}
          className={cn(
            'flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 transition-colors',
            location.pathname.startsWith('/settings')
              ? 'text-primary'
              : 'text-muted hover:text-foreground',
          )}
        >
          <settingsModule.icon className="h-5 w-5" />
          <span className="text-[10px] font-medium">
            {settingsModule.label}
          </span>
        </Link>
      </nav>
    </div>
  )
}
