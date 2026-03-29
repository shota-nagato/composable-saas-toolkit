import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/tasks/board')({
  component: TaskBoardPage,
})

function TaskBoardPage() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">Board</h1>
      <p className="text-sm text-muted">Kanban board view coming soon.</p>
    </div>
  )
}
