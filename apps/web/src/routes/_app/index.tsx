import { createFileRoute } from '@tanstack/react-router'
import { PageLoading } from '../../components/PageLoading'
import { DashboardHeader } from '../../features/dashboard/DashboardHeader'
import { PriorityBreakdown } from '../../features/dashboard/PriorityBreakdown'
import { RecentTasksList } from '../../features/dashboard/RecentTasksList'
import { StatCards } from '../../features/dashboard/StatCards'
import { useTasks } from '../../hooks/useTasks'
import { useWorkflowStates } from '../../hooks/useWorkflowStates'
import { Route as AppRoute } from '../_app'

export const Route = createFileRoute('/_app/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { session } = AppRoute.useRouteContext()
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: workflowStates, isLoading: statesLoading } = useWorkflowStates()

  if (tasksLoading || statesLoading) {
    return <PageLoading />
  }

  const resolvedTasks = tasks ?? []
  const resolvedStates = workflowStates ?? []

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <DashboardHeader
        userName={session.user.name}
        userImage={session.user.image}
      />

      <div className="mt-8 space-y-8">
        <StatCards tasks={resolvedTasks} workflowStates={resolvedStates} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <section className="rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Recent tasks
            </h2>
            <RecentTasksList
              tasks={resolvedTasks}
              workflowStates={resolvedStates}
            />
          </section>

          <section className="rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              By priority
            </h2>
            <PriorityBreakdown tasks={resolvedTasks} />
          </section>
        </div>
      </div>
    </div>
  )
}
