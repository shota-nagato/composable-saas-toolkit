import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import type { Task, WorkflowState } from '../../lib/api'
import { PriorityIcon } from '../tasks/PriorityIcon'
import { StatusIcon } from '../tasks/StatusIcon'

interface RecentTasksListProps {
  tasks: Task[]
  workflowStates: WorkflowState[]
}

function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr))
}

export function RecentTasksList({
  tasks,
  workflowStates,
}: RecentTasksListProps) {
  const stateMap = useMemo(
    () => new Map(workflowStates.map((s) => [s.id, s])),
    [workflowStates],
  )

  const recent = useMemo(
    () =>
      [...tasks]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [tasks],
  )

  if (recent.length === 0) {
    return <p className="py-4 text-sm italic text-muted">No tasks yet</p>
  }

  return (
    <div>
      <ul className="divide-y divide-border">
        {recent.map((task) => {
          const state = stateMap.get(task.stateId)
          return (
            <li
              key={task.id}
              className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0"
            >
              <PriorityIcon priority={task.priority} />
              <StatusIcon type={state?.type ?? 'unstarted'} />
              <Link
                to="/tasks/$taskId"
                params={{ taskId: task.id }}
                className="min-w-0 flex-1 truncate text-sm text-foreground hover:text-primary"
              >
                {task.title}
              </Link>
              <span className="shrink-0 text-xs text-muted">
                {formatRelativeDate(task.createdAt)}
              </span>
            </li>
          )
        })}
      </ul>
      <div className="mt-3 border-t border-border pt-3">
        <Link
          to="/tasks"
          search={{ filter: 'all' }}
          className="text-xs text-muted transition-colors hover:text-foreground"
        >
          View all tasks
        </Link>
      </div>
    </div>
  )
}
