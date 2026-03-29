import DocsIcon from '../assets/svg/modules/docs.svg?react'
import SettingsIcon from '../assets/svg/modules/settings.svg?react'
import TasksIcon from '../assets/svg/modules/tasks.svg?react'

export interface SidebarItem {
  label: string
  path: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export interface ModuleConfig {
  id: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  basePath: string
  sidebarItems: SidebarItem[]
}

export const modules: ModuleConfig[] = [
  {
    id: 'tasks',
    label: 'Tasks',
    icon: TasksIcon,
    basePath: '/tasks',
    sidebarItems: [],
  },
  {
    id: 'docs',
    label: 'Docs',
    icon: DocsIcon,
    basePath: '/docs',
    sidebarItems: [],
  },
]

export const settingsModule = {
  id: 'settings',
  label: 'Settings',
  icon: SettingsIcon,
  path: '/settings',
}

export function getActiveModule(pathname: string): ModuleConfig | undefined {
  return modules.find((m) => pathname.startsWith(m.basePath))
}
