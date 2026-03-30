import { Link } from '@tanstack/react-router'
import { useUpdateTask } from '../../hooks/useTasks'
import type { Task, WorkflowState } from '../../lib/api'
import { priorityLabels } from '../../lib/priority'
import { PriorityIcon } from './PriorityIcon'
import { PriorityPicker } from './PriorityPicker'
import { StatusIcon } from './StatusIcon'
import { StatusPicker } from './StatusPicker'

interface BoardCardProps {
  task: Task
  workflowStates: WorkflowState[]
}

export function BoardCard({ task, workflowStates }: BoardCardProps) {
  const updateTask = useUpdateTask()

  const currentState = workflowStates.find((s) => s.id === task.stateId)

  function handleStatusChange(stateId: string) {
    updateTask.mutate({ id: task.id, stateId })
  }

  function handlePriorityChange(priority: Task['priority']) {
    updateTask.mutate({ id: task.id, priority })
  }

  return (
    <div className="rounded-md border border-border bg-surface p-3 transition-colors hover:border-border-hover">
      <div className="flex items-start gap-2">
        {/* Status dropdown */}
        <StatusPicker
          workflowStates={workflowStates}
          value={task.stateId}
          onSelect={handleStatusChange}
        >
          <button
            type="button"
            className="mt-0.5 shrink-0 rounded p-0.5 transition-colors hover:bg-surface-hover"
          >
            <StatusIcon type={currentState?.type ?? 'unstarted'} />
          </button>
        </StatusPicker>

        {/* Title links to detail */}
        <Link
          to="/tasks/$taskId"
          params={{ taskId: task.id }}
          className="min-w-0 flex-1 text-sm text-foreground hover:text-primary"
        >
          {task.title}
        </Link>
      </div>

      {/* Priority row */}
      <div className="mt-2 flex items-center">
        <PriorityPicker value={task.priority} onSelect={handlePriorityChange}>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <PriorityIcon priority={task.priority} />
            <span>{priorityLabels[task.priority]}</span>
          </button>
        </PriorityPicker>
      </div>
    </div>
  )
}
