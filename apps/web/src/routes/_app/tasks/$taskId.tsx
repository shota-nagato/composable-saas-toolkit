import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@toolkit/ui'
import { StatusIcon } from '../../../features/tasks/StatusIcon'
import { useTask } from '../../../hooks/useTasks'
import { useWorkflowStates } from '../../../hooks/useWorkflowStates'

export const Route = createFileRoute('/_app/tasks/$taskId')({
  component: TaskDetailPage,
})

function TaskDetailPage() {
  const { taskId } = Route.useParams()
  const { data: task, isLoading: taskLoading } = useTask(taskId)
  const { data: workflowStates, isLoading: statesLoading } = useWorkflowStates()

  if (taskLoading || statesLoading) {
    return <p className="p-6 text-muted">Loading...</p>
  }

  if (!task) {
    return (
      <div className="p-6">
        <p className="text-muted">Task not found</p>
        <Link to="/tasks" className="mt-2 inline-block text-sm text-primary">
          Back to tasks
        </Link>
      </div>
    )
  }

  const currentState = workflowStates?.find((s) => s.id === task.stateId)

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4">
        <Link to="/tasks">
          <Button variant="ghost" size="sm">
            &larr; Back
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 flex items-center gap-3">
          {currentState && <StatusIcon type={currentState.type} />}
          <span className="text-sm text-muted">{currentState?.name}</span>
        </div>

        <h1 className="mb-2 text-xl font-bold text-foreground">{task.title}</h1>

        {task.description && (
          <p className="whitespace-pre-wrap text-sm text-muted">
            {task.description}
          </p>
        )}
      </div>
    </div>
  )
}
