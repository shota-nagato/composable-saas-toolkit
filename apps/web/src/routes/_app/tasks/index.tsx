import { createFileRoute } from '@tanstack/react-router'
import type { taskPriorityValues } from '@toolkit/db'
import { cn } from '@toolkit/ui'
import { useMemo, useState } from 'react'
import ChevronDownIcon from '../../../assets/svg/actions/chevron-down.svg?react'
import { StatusIcon } from '../../../features/tasks/StatusIcon'
import { TaskItem } from '../../../features/tasks/TaskItem'
import { TasksToolbar } from '../../../features/tasks/TasksToolbar'
import { useTasks } from '../../../hooks/useTasks'
import { useWorkflowStates } from '../../../hooks/useWorkflowStates'
import type { Task, WorkflowState } from '../../../lib/api'

const filterValues = ['all', 'active', 'backlog'] as const
type FilterValue = (typeof filterValues)[number]

const priorityOrder: Record<(typeof taskPriorityValues)[number], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  no_priority: 4,
}

export const Route = createFileRoute('/_app/tasks/')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { filter: FilterValue } => {
    const rawFilter = search.filter
    const filter: FilterValue =
      typeof rawFilter === 'string' &&
      filterValues.includes(rawFilter as FilterValue)
        ? (rawFilter as FilterValue)
        : 'all'
    return { filter }
  },
  component: TaskListPage,
})

interface TaskGroup {
  state: WorkflowState
  tasks: Task[]
}

const listOrder: Record<string, number> = {
  in_review: 0,
  started: 1,
  unstarted: 2,
  backlog: 3,
  completed: 4,
  canceled: 5,
}

function groupTasksByState(
  tasks: Task[],
  workflowStates: WorkflowState[],
): TaskGroup[] {
  const sorted = [...workflowStates].sort(
    (a, b) => (listOrder[a.type] ?? 99) - (listOrder[b.type] ?? 99),
  )
  return sorted
    .map((state) => ({
      state,
      tasks: tasks
        .filter((t) => t.stateId === state.id)
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    }))
    .filter((group) => group.tasks.length > 0)
}

function TaskListPage() {
  const { filter } = Route.useSearch()
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: workflowStates, isLoading: statesLoading } = useWorkflowStates()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const filteredTasks = useMemo(() => {
    if (!tasks || !workflowStates) return []
    if (filter === 'all') return tasks

    const stateTypeMap = new Map(workflowStates.map((s) => [s.id, s.type]))
    return tasks.filter((task) => {
      const type = stateTypeMap.get(task.stateId)
      if (filter === 'active') return type === 'started' || type === 'in_review'
      if (filter === 'backlog')
        return type === 'backlog' || type === 'unstarted'
      return true
    })
  }, [tasks, workflowStates, filter])

  const groups = useMemo(
    () => groupTasksByState(filteredTasks, workflowStates ?? []),
    [filteredTasks, workflowStates],
  )

  function toggleGroup(stateId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(stateId)) {
        next.delete(stateId)
      } else {
        next.add(stateId)
      }
      return next
    })
  }

  if (tasksLoading || statesLoading) {
    return <p className="p-6 text-sm text-muted">Loading...</p>
  }

  return (
    <div className="flex h-full flex-col">
      <TasksToolbar filter={filter} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredTasks.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">
            {filter === 'all' ? 'No tasks yet' : 'No matching tasks'}
          </p>
        )}

        {groups.map((group) => {
          const isCollapsed = collapsed.has(group.state.id)
          return (
            <div key={group.state.id}>
              <button
                type="button"
                onClick={() => toggleGroup(group.state.id)}
                className="flex w-full items-center gap-2 bg-surface-hover/50 px-4 py-1.5 text-left transition-colors hover:bg-surface-hover"
              >
                <ChevronDownIcon
                  aria-hidden="true"
                  className={cn(
                    'h-3 w-3 shrink-0 text-muted transition-transform duration-150',
                    isCollapsed && '-rotate-90',
                  )}
                />
                <StatusIcon type={group.state.type} />
                <span className="text-sm font-medium text-foreground">
                  {group.state.name}
                </span>
                <span className="text-xs text-muted">{group.tasks.length}</span>
              </button>

              {!isCollapsed && (
                <ul>
                  {group.tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      workflowStates={workflowStates ?? []}
                    />
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
