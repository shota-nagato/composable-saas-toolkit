import { createFileRoute, Link } from '@tanstack/react-router'
import type { taskPriorityValues } from '@toolkit/db'
import { Button, cn } from '@toolkit/ui'
import { useMemo, useState } from 'react'
import ChevronDownIcon from '../../../assets/svg/actions/chevron-down.svg?react'
import { StatusIcon } from '../../../features/tasks/StatusIcon'
import { TaskCreateForm } from '../../../features/tasks/TaskCreateForm'
import { TaskItem } from '../../../features/tasks/TaskItem'
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

function groupTasksByState(
  tasks: Task[],
  workflowStates: WorkflowState[],
): TaskGroup[] {
  const sorted = [...workflowStates].sort((a, b) => a.position - b.position)
  return sorted
    .map((state) => ({
      state,
      tasks: tasks
        .filter((t) => t.stateId === state.id)
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    }))
    .filter((group) => group.tasks.length > 0)
}

const filterTabs = [
  { label: 'All issues', value: 'all' as const },
  { label: 'Active', value: 'active' as const },
  { label: 'Backlog', value: 'backlog' as const },
]

function TaskListPage() {
  const { filter } = Route.useSearch()
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: workflowStates, isLoading: statesLoading } = useWorkflowStates()
  const [showForm, setShowForm] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const filteredTasks = useMemo(() => {
    if (!tasks || !workflowStates) return []
    if (filter === 'all') return tasks

    const stateTypeMap = new Map(workflowStates.map((s) => [s.id, s.type]))
    return tasks.filter((task) => {
      const type = stateTypeMap.get(task.stateId)
      if (filter === 'active') return type === 'started'
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
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          {filterTabs.map((tab) => (
            <Link
              key={tab.value}
              from={Route.fullPath}
              search={{ filter: tab.value }}
              className={cn(
                'rounded-md px-2.5 py-1 text-sm transition-colors',
                filter === tab.value
                  ? 'bg-surface-hover font-medium text-foreground'
                  : 'text-muted hover:text-foreground',
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Add */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add'}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showForm && (
          <div className="border-b border-border p-4">
            <TaskCreateForm
              onCancel={() => setShowForm(false)}
              onSuccess={() => setShowForm(false)}
            />
          </div>
        )}

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
