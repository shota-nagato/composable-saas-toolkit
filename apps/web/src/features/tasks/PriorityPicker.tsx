import { taskPriorityValues } from '@toolkit/db'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@toolkit/ui'
import CheckIcon from '../../assets/svg/actions/check.svg?react'
import type { Task } from '../../lib/api'
import { priorityLabels } from '../../lib/priority'
import { PriorityIcon } from './PriorityIcon'

interface PriorityPickerProps {
  value: Task['priority']
  onSelect: (priority: Task['priority']) => void
  children: React.ReactNode
  modal?: boolean
  align?: 'start' | 'center' | 'end'
}

export function PriorityPicker({
  value,
  onSelect,
  children,
  modal,
  align = 'start',
}: PriorityPickerProps) {
  return (
    <DropdownMenu modal={modal}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44">
        {taskPriorityValues.map((p) => (
          <DropdownMenuItem
            key={p}
            onSelect={() => onSelect(p)}
            className="gap-2.5"
          >
            <PriorityIcon priority={p} />
            <span className="flex-1">{priorityLabels[p]}</span>
            {p === value && (
              <CheckIcon className="text-primary" width={14} height={14} />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
