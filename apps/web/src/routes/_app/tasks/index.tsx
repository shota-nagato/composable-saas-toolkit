import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@toolkit/ui'
import { useState } from 'react'
import { TaskCreateForm } from '../../../features/tasks/TaskCreateForm'
import { TaskItem } from '../../../features/tasks/TaskItem'
import { useTasks } from '../../../hooks/useTasks'
import { useWorkflowStates } from '../../../hooks/useWorkflowStates'

export const Route = createFileRoute('/_app/tasks/')({
  component: TaskListPage,
})

function TaskListPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: workflowStates, isLoading: statesLoading } = useWorkflowStates()
  const [showForm, setShowForm] = useState(false)

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

        <ul className="py-1">
          {tasks?.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              workflowStates={workflowStates ?? []}
            />
          ))}
          {tasks?.length === 0 && (
            <li className="py-12 text-center text-sm text-muted">
              No tasks yet
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
