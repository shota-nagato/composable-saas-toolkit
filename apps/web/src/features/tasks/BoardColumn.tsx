import type { Task, WorkflowState } from '../../lib/api'
import { BoardCard } from './BoardCard'
import { StatusIcon } from './StatusIcon'

interface BoardColumnProps {
  state: WorkflowState
  tasks: Task[]
  workflowStates: WorkflowState[]
}

export function BoardColumn({
  state,
  tasks,
  workflowStates,
}: BoardColumnProps) {
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-surface-hover/30">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <StatusIcon type={state.type} />
        <span className="text-sm font-medium text-foreground">
          {state.name}
        </span>
        <span className="text-xs text-muted">{tasks.length}</span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-1.5 overflow-y-auto px-2 pb-2">
        {tasks.map((task) => (
          <BoardCard
            key={task.id}
            task={task}
            workflowStates={workflowStates}
          />
        ))}
      </div>
    </div>
  )
}
