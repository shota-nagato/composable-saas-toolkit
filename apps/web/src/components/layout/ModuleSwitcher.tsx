import { Link, useLocation } from '@tanstack/react-router'
import {
  Avatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@toolkit/ui'
import { cn } from '@toolkit/ui/utils'
import CheckIcon from '../../assets/svg/actions/check.svg?react'
import { modules, settingsModule } from '../../config/modules'
import { authClient } from '../../lib/auth'

interface ModuleSwitcherProps {
  userName: string
  userImage?: string | null
}

export function ModuleSwitcher({ userName, userImage }: ModuleSwitcherProps) {
  const location = useLocation()
  const { data: activeOrg } = authClient.useActiveOrganization()
  const { data: orgs } = authClient.useListOrganizations()

  async function handleSwitchOrg(orgId: string) {
    await authClient.organization.setActive({ organizationId: orgId })
    window.location.reload()
  }

  const orgInitial = activeOrg?.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="hidden w-12 shrink-0 flex-col items-center border-r border-border bg-surface-hover/50 py-2 lg:flex">
      {/* Workspace switcher */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground transition-opacity hover:opacity-80"
              >
                {orgInitial}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">
            {activeOrg?.name ?? 'Select workspace'}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="right" align="start" className="w-52">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {orgs?.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitchOrg(org.id)}
              className="gap-2"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                {org.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{org.name}</span>
              {org.id === activeOrg?.id && (
                <CheckIcon className="ml-auto h-3.5 w-3.5 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
