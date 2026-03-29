import { cn } from '@toolkit/ui'
import HighIcon from '../../assets/svg/priority/high.svg?react'
import LowIcon from '../../assets/svg/priority/low.svg?react'
import MediumIcon from '../../assets/svg/priority/medium.svg?react'
import NoPriorityIcon from '../../assets/svg/priority/no-priority.svg?react'
import UrgentIcon from '../../assets/svg/priority/urgent.svg?react'
import type { Task } from '../../lib/api'

type TaskPriority = Task['priority']

const iconMap: Record<
  TaskPriority,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  urgent: UrgentIcon,
  high: HighIcon,
  medium: MediumIcon,
  low: LowIcon,
  no_priority: NoPriorityIcon,
}

const colorMap: Record<TaskPriority, string> = {
  urgent: 'text-priority-urgent',
  high: 'text-priority-high',
  medium: 'text-priority-medium',
  low: 'text-priority-low',
  no_priority: 'text-priority-none',
}

interface PriorityIconProps {
  priority: TaskPriority
  className?: string
}

export function PriorityIcon({ priority, className }: PriorityIconProps) {
  const Icon = iconMap[priority]
  return (
    <Icon className={cn('h-4 w-4 shrink-0', colorMap[priority], className)} />
  )
}
