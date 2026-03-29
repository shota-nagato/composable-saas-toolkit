import { cn } from '@toolkit/ui'
import BacklogIcon from '../../assets/svg/status/backlog.svg?react'
import CanceledIcon from '../../assets/svg/status/canceled.svg?react'
import CompletedIcon from '../../assets/svg/status/completed.svg?react'
import InReviewIcon from '../../assets/svg/status/in-review.svg?react'
import StartedIcon from '../../assets/svg/status/started.svg?react'
import UnstartedIcon from '../../assets/svg/status/unstarted.svg?react'

const iconMap: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  backlog: BacklogIcon,
  unstarted: UnstartedIcon,
  started: StartedIcon,
  in_review: InReviewIcon,
  completed: CompletedIcon,
  canceled: CanceledIcon,
}

interface StatusIconProps {
  type: string
  className?: string
}

export function StatusIcon({ type, className }: StatusIconProps) {
  const Icon = iconMap[type] ?? UnstartedIcon
  return <Icon className={cn('h-4 w-4 shrink-0', className)} />
}
