import { useCreateTask, useTasks } from './hooks/useTasks'

function App() {
  const { data: tasks, isLoading } = useTasks()
  const createTask = useCreateTask()

  if (isLoading) return <p className="p-4">Loading...</p>

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      <button
        type="button"
        onClick={() =>
          createTask.mutate({ title: 'New Task', stateId: 'ws-todo' })
        }
      >
        Add Task
      </button>
      <ul className="mt-4 space-y-2">
        {tasks?.map((task) => (
          <li key={task.id} className="p-3 border rounded">
            {task.title}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
