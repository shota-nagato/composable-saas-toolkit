import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@toolkit/ui'
import { useMemo, useState } from 'react'
import { StatusIcon } from '../../../features/tasks/StatusIcon'
import { TaskCreateForm } from '../../../features/tasks/TaskCreateForm'
import { TaskItem } from '../../../features/tasks/TaskItem'
import { useTasks } from '../../../hooks/useTasks'
import { useWorkflowStates } from '../../../hooks/useWorkflowStates'
import type { Task, WorkflowState } from '../../../lib/api'

export const Route = createFileRoute('/_app/tasks/')({
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

function TaskListPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: workflowStates, isLoading: statesLoading } = useWorkflowStates()
  const [showForm, setShowForm] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const groups = useMemo(
    () => groupTasksByState(tasks ?? [], workflowStates ?? []),
    [tasks, workflowStates],
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
      <div className="flex items-center justify-end border-b border-border px-4 py-2">
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

        {groups.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">No tasks yet</p>
        )}

        {groups.map((group) => {
          const isCollapsed = collapsed.has(group.state.id)
          return (
            <div key={group.state.id}>
              {/* Group header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.state.id)}
                className="flex w-full items-center gap-2 bg-surface-hover/50 px-4 py-1.5 text-left transition-colors hover:bg-surface-hover"
              >
                <svg
                  className={`h-3 w-3 shrink-0 text-muted transition-transform duration-150 ${isCollapsed ? '-rotate-90' : ''}`}
                  viewBox="0 0 12 12"
                  fill="currentColor"
                >
                  <path d="M2 4l4 4 4-4" />
                </svg>
                <StatusIcon type={group.state.type} />
                <span className="text-sm font-medium text-foreground">
                  {group.state.name}
                </span>
                <span className="text-xs text-muted">{group.tasks.length}</span>
              </button>

              {/* Group items */}
              {!isCollapsed && (
                <ul>
                  {group.tasks.map((task) => {
                    const idx = (tasks ?? []).indexOf(task) + 1
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        workflowStates={workflowStates ?? []}
                        displayId={`TASK-${idx}`}
                      />
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
