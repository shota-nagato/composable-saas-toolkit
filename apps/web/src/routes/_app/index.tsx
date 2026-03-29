import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@toolkit/ui'
import { useState } from 'react'
import { TaskCreateForm } from '../../features/tasks/TaskCreateForm'
import { TaskItem } from '../../features/tasks/TaskItem'
import { useTasks } from '../../hooks/useTasks'
import { useWorkflowStates } from '../../hooks/useWorkflowStates'

export const Route = createFileRoute('/_app/')({
  component: TaskListPage,
})

function TaskListPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: workflowStates, isLoading: statesLoading } = useWorkflowStates()
  const [showForm, setShowForm] = useState(false)

  if (tasksLoading || statesLoading) {
    return <p className="p-6 text-muted">Loading...</p>
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Tasks</h1>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            Add Task
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <TaskCreateForm
            onCancel={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      <ul className="space-y-2">
        {tasks?.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            workflowStates={workflowStates ?? []}
          />
        ))}
        {tasks?.length === 0 && (
          <li className="py-8 text-center text-muted">No tasks yet</li>
        )}
      </ul>
    </div>
  )
}
