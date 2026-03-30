import { Link } from '@tanstack/react-router'
import { cn } from '@toolkit/ui'
import type { Task, WorkflowState } from '../../lib/api'

interface StatCardsProps {
  tasks: Task[]
  workflowStates: WorkflowState[]
}

export function StatCards({ tasks, workflowStates }: StatCardsProps) {
  const stateTypeMap = new Map(workflowStates.map((s) => [s.id, s.type]))

  const total = tasks.length
  const active = tasks.filter((t) => {
    const type = stateTypeMap.get(t.stateId)
    return type === 'started' || type === 'in_review'
  }).length
  const completed = tasks.filter(
    (t) => stateTypeMap.get(t.stateId) === 'completed',
  ).length

  const cards = [
    {
      label: 'Total tasks',
      value: total,
      accentClass: 'border-t-border-hover',
      search: { filter: 'all' as const },
    },
    {
      label: 'Active',
      value: active,
      accentClass: 'border-t-primary',
      search: { filter: 'active' as const },
    },
    {
      label: 'Completed',
      value: completed,
      accentClass: 'border-t-success',
      search: { filter: 'all' as const },
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <Link
          key={card.label}
          to="/tasks"
          search={card.search}
          className={cn(
            'rounded-lg border border-border border-t-2 bg-surface p-4 transition-colors hover:bg-surface-hover',
            card.accentClass,
          )}
        >
          <div className="text-2xl font-bold text-foreground">{card.value}</div>
          <div className="mt-1 text-xs text-muted">{card.label}</div>
        </Link>
      ))}
    </div>
  )
}
