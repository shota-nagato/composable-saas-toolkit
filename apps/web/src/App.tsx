import { Button } from '@toolkit/ui'
import { useState } from 'react'
import { TaskCreateForm } from './features/tasks/TaskCreateForm'
import { useTasks } from './hooks/useTasks'

function App() {
  const { data: tasks, isLoading } = useTasks()
  const [showForm, setShowForm] = useState(false)

  if (isLoading) return <p className="p-4 text-muted">Loading...</p>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
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
          <li
            key={task.id}
            className="px-4 py-3 border border-border rounded-lg text-foreground bg-surface hover:bg-surface-hover transition-colors"
          >
            {task.title}
          </li>
        ))}
        {tasks?.length === 0 && (
          <li className="text-center py-8 text-muted">No tasks yet</li>
        )}
      </ul>
    </div>
  )
}

export default App
