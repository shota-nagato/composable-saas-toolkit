import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@toolkit/ui'
import { useState } from 'react'
import CheckIcon from '../../assets/svg/actions/check.svg?react'
import { useUpdateTask } from '../../hooks/useTasks'
import type { Task, WorkflowState } from '../../lib/api'
import { StatusIcon } from './StatusIcon'

interface BoardCardProps {
  task: Task
  workflowStates: WorkflowState[]
}

export function BoardCard({ task, workflowStates }: BoardCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const updateTask = useUpdateTask()

  const currentState = workflowStates.find((s) => s.id === task.stateId)

  function handleStatusChange(stateId: string) {
    updateTask.mutate(
      { id: task.id, stateId },
      { onSettled: () => setShowStatusMenu(false) },
    )
  }

  return (
    <div className="rounded-md border border-border bg-surface p-3 transition-colors hover:border-border-hover">
      <div className="flex items-start gap-2">
        {/* Status dropdown */}
        <DropdownMenu open={showStatusMenu} onOpenChange={setShowStatusMenu}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="mt-0.5 shrink-0 rounded p-0.5 transition-colors hover:bg-surface-hover"
            >
              <StatusIcon type={currentState?.type ?? 'unstarted'} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-50">
            {workflowStates.map((state) => (
              <DropdownMenuItem
                key={state.id}
                onSelect={() => handleStatusChange(state.id)}
                className="gap-2.5"
              >
                <StatusIcon type={state.type} />
                <span className="flex-1">{state.name}</span>
                {state.id === task.stateId && (
                  <CheckIcon className="text-primary" width={14} height={14} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Title links to detail */}
        <Link
          to="/tasks/$taskId"
          params={{ taskId: task.id }}
          className="min-w-0 flex-1 text-sm text-foreground hover:text-primary"
        >
          {task.title}
        </Link>
      </div>
    </div>
  )
}
