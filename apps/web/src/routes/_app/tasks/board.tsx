import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { BoardColumn } from '../../../features/tasks/BoardColumn'
import { useTasks } from '../../../hooks/useTasks'
import { useWorkflowStates } from '../../../hooks/useWorkflowStates'

export const Route = createFileRoute('/_app/tasks/board')({
  component: TaskBoardPage,
})

function TaskBoardPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: workflowStates, isLoading: statesLoading } = useWorkflowStates()

  const columns = useMemo(() => {
    if (!tasks || !workflowStates) return []
    const sorted = [...workflowStates].sort((a, b) => a.position - b.position)
    return sorted.map((state) => ({
      state,
      tasks: tasks.filter((t) => t.stateId === state.id),
    }))
  }, [tasks, workflowStates])

  if (tasksLoading || statesLoading) {
    return <p className="p-6 text-sm text-muted">Loading...</p>
  }

  return (
    <div className="flex h-full overflow-x-auto p-4 gap-4">
      {columns.map((col) => (
        <BoardColumn
          key={col.state.id}
          state={col.state}
          tasks={col.tasks}
          workflowStates={workflowStates ?? []}
        />
      ))}
    </div>
  )
}
