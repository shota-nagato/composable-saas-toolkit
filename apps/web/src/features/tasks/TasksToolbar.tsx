import { Link, useRouterState } from '@tanstack/react-router'
import { Button, cn } from '@toolkit/ui'
import { useState } from 'react'
import BoardIcon from '../../assets/svg/modules/board.svg?react'
import ListIcon from '../../assets/svg/modules/list.svg?react'
import { TaskCreateDialog } from './TaskCreateDialog'

const filterTabs = [
  { label: 'All issues', value: 'all' as const },
  { label: 'Active', value: 'active' as const },
  { label: 'Backlog', value: 'backlog' as const },
]

type FilterValue = (typeof filterTabs)[number]['value']

interface TasksToolbarProps {
  filter?: FilterValue
}

export function TasksToolbar({ filter }: TasksToolbarProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const routerState = useRouterState()
  const isBoard = routerState.location.pathname === '/tasks/board'

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        {/* Left: Filter tabs (list view only) */}
        <div className="flex items-center gap-1">
          {filter != null &&
            filterTabs.map((tab) => (
              <Link
                key={tab.value}
                to="/tasks"
                search={{ filter: tab.value }}
                className={cn(
                  'rounded-md px-2.5 py-1 text-sm transition-colors',
                  filter === tab.value
                    ? 'bg-surface-hover font-medium text-foreground'
                    : 'text-muted hover:text-foreground',
                )}
              >
                {tab.label}
              </Link>
            ))}
        </div>

        {/* Right: View toggle + Create */}
        <div className="flex items-center gap-1">
          {/* View toggle */}
          <div className="flex items-center rounded-md border border-border">
            <Link
              to="/tasks"
              search={{ filter: filter ?? 'all' }}
              className={cn(
                'inline-flex items-center justify-center rounded-l-md p-1.5 transition-colors',
                !isBoard
                  ? 'bg-surface-hover text-foreground'
                  : 'text-muted hover:text-foreground',
              )}
              aria-label="List view"
            >
              <ListIcon className="h-4 w-4" />
            </Link>
            <Link
              to="/tasks/board"
              className={cn(
                'inline-flex items-center justify-center rounded-r-md p-1.5 transition-colors',
                isBoard
                  ? 'bg-surface-hover text-foreground'
                  : 'text-muted hover:text-foreground',
              )}
              aria-label="Board view"
            >
              <BoardIcon className="h-4 w-4" />
            </Link>
          </div>

          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            Create
          </Button>
        </div>
      </div>

      <TaskCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  )
}
