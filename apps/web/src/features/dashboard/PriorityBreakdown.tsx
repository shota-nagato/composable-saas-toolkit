import { taskPriorityValues } from '@toolkit/db'
import { useMemo } from 'react'
import type { Task } from '../../lib/api'
import { priorityLabels } from '../../lib/priority'
import { PriorityIcon } from '../tasks/PriorityIcon'

interface PriorityBreakdownProps {
  tasks: Task[]
}

export function PriorityBreakdown({ tasks }: PriorityBreakdownProps) {
  const counts = useMemo(() => {
    const map = new Map<Task['priority'], number>()
    for (const p of taskPriorityValues) map.set(p, 0)
    for (const t of tasks) map.set(t.priority, (map.get(t.priority) ?? 0) + 1)
    return map
  }, [tasks])

  const total = tasks.length

  return (
    <div className="space-y-2.5">
      {taskPriorityValues.map((priority) => {
        const count = counts.get(priority) ?? 0
        const pct = total > 0 ? (count / total) * 100 : 0
        return (
          <div key={priority} className="flex items-center gap-3">
            <PriorityIcon priority={priority} />
            <span className="w-20 shrink-0 text-sm text-foreground">
              {priorityLabels[priority]}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
              <div
                className="h-full rounded-full bg-primary-subtle transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-4 shrink-0 text-right text-xs text-muted">
              {count}
            </span>
          </div>
        )
      })}
    </div>
  )
}
