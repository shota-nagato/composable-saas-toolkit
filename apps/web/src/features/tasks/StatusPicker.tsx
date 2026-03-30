import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@toolkit/ui'
import CheckIcon from '../../assets/svg/actions/check.svg?react'
import type { WorkflowState } from '../../lib/api'
import { StatusIcon } from './StatusIcon'

interface StatusPickerProps {
  workflowStates: WorkflowState[]
  value: string
  onSelect: (stateId: string) => void
  children: React.ReactNode
  modal?: boolean
  align?: 'start' | 'center' | 'end'
}

export function StatusPicker({
  workflowStates,
  value,
  onSelect,
  children,
  modal,
  align = 'start',
}: StatusPickerProps) {
  return (
    <DropdownMenu modal={modal}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-50">
        {workflowStates.map((state) => (
          <DropdownMenuItem
            key={state.id}
            onSelect={() => onSelect(state.id)}
            className="gap-2.5"
          >
            <StatusIcon type={state.type} />
            <span className="flex-1">{state.name}</span>
            {state.id === value && (
              <CheckIcon className="text-primary" width={14} height={14} />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
