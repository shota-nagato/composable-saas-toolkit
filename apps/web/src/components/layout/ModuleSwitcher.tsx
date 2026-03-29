import { Link, useLocation } from '@tanstack/react-router'
import { Avatar, Tooltip, TooltipContent, TooltipTrigger } from '@toolkit/ui'
import { cn } from '@toolkit/ui/utils'
import { modules, settingsModule } from '../../config/modules'

interface ModuleSwitcherProps {
  userName: string
  userImage?: string | null
}

export function ModuleSwitcher({ userName, userImage }: ModuleSwitcherProps) {
  const location = useLocation()

  return (
    <div className="hidden w-12 shrink-0 flex-col items-center border-r border-border bg-surface-hover/50 py-2 lg:flex">
      {/* Workspace logo */}
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground">
        T
      </div>

      {/* Module icons */}
      <div className="flex flex-1 flex-col items-center gap-1">
        {modules.map((mod) => {
          const isActive =
            mod.basePath === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(mod.basePath)
          return (
            <Tooltip key={mod.id}>
              <TooltipTrigger asChild>
                <Link
                  to={mod.basePath}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-subtle text-primary'
                      : 'text-muted hover:bg-surface-hover hover:text-foreground',
                  )}
                >
                  <mod.icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{mod.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Bottom: Settings + Avatar */}
      <div className="flex flex-col items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={settingsModule.path}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                location.pathname.startsWith('/settings')
                  ? 'bg-primary-subtle text-primary'
                  : 'text-muted hover:bg-surface-hover hover:text-foreground',
              )}
            >
              <settingsModule.icon className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{settingsModule.label}</TooltipContent>
        </Tooltip>

        <div className="mt-1">
          <Avatar src={userImage} fallback={userName} size="sm" />
        </div>
      </div>
    </div>
  )
}
