import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  Button,
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@toolkit/ui'
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

const sortValues = [
  'manual',
  'created-desc',
  'created-asc',
  'updated-desc',
  'title-asc',
  'title-desc',
] as const
type SortValue = (typeof sortValues)[number]

export const Route = createFileRoute('/_app/tasks/')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { filter: FilterValue; sort: SortValue } => {
    const rawFilter = search.filter
    const filter: FilterValue =
      typeof rawFilter === 'string' &&
      filterValues.includes(rawFilter as FilterValue)
        ? (rawFilter as FilterValue)
        : 'all'

    const rawSort = search.sort
    const sort: SortValue =
      typeof rawSort === 'string' && sortValues.includes(rawSort as SortValue)
        ? (rawSort as SortValue)
        : 'manual'

    return { filter, sort }
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
      tasks: tasks.filter((t) => t.stateId === state.id),
    }))
    .filter((group) => group.tasks.length > 0)
}

const filterTabs = [
  { label: 'All issues', value: 'all' as const },
  { label: 'Active', value: 'active' as const },
  { label: 'Backlog', value: 'backlog' as const },
]

function TaskListPage() {
  const { filter, sort } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
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

  const sortedTasks = useMemo(() => {
    if (sort === 'manual') return filteredTasks
    const sorted = [...filteredTasks]
    switch (sort) {
      case 'created-desc':
        return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      case 'created-asc':
        return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      case 'updated-desc':
        return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title))
      default:
        return sorted
    }
  }, [filteredTasks, sort])

  const groups = useMemo(
    () => groupTasksByState(sortedTasks, workflowStates ?? []),
    [sortedTasks, workflowStates],
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

  const isManualSort = sort === 'manual'

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
              search={(prev) => ({
                ...prev,
                filter: tab.value,
              })}
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

        {/* Sort + Add */}
        <div className="flex items-center gap-2">
          <Select
            value={sort}
            onValueChange={(value: SortValue) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  sort: value,
                }),
              })
            }
          >
            <SelectTrigger className="h-7 w-40 border-none bg-transparent text-xs text-muted shadow-none hover:text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="created-desc">Newest first</SelectItem>
              <SelectItem value="created-asc">Oldest first</SelectItem>
              <SelectItem value="updated-desc">Recently updated</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add'}
          </Button>
        </div>
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

        {sortedTasks.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">
            {filter === 'all' ? 'No tasks yet' : 'No matching tasks'}
          </p>
        )}

        {isManualSort ? (
          /* Grouped view */
          groups.map((group) => {
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
                  <span className="text-xs text-muted">
                    {group.tasks.length}
                  </span>
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
          })
        ) : (
          /* Flat sorted view */
          <ul>
            {sortedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                workflowStates={workflowStates ?? []}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
