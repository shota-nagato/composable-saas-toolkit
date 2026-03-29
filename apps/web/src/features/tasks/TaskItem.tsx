import { Link } from '@tanstack/react-router'
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@toolkit/ui'
import { useState } from 'react'
import CheckIcon from '../../assets/svg/actions/check.svg?react'
import EditIcon from '../../assets/svg/actions/edit.svg?react'
import MoreVerticalIcon from '../../assets/svg/actions/more-vertical.svg?react'
import PriorityNoneIcon from '../../assets/svg/actions/priority-none.svg?react'
import TrashIcon from '../../assets/svg/actions/trash.svg?react'
import { useDeleteTask, useUpdateTask } from '../../hooks/useTasks'
import type { Task, WorkflowState } from '../../lib/api'
import { StatusIcon } from './StatusIcon'
import { TaskEditForm } from './TaskEditForm'

interface TaskItemProps {
  task: Task
  workflowStates: WorkflowState[]
  displayId?: string
}

export function TaskItem({ task, workflowStates, displayId }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const currentState = workflowStates.find((s) => s.id === task.stateId)

  function handleStatusChange(stateId: string) {
    updateTask.mutate({ id: task.id, stateId })
    setShowStatusMenu(false)
  }

  function handleDelete() {
    deleteTask.mutate(task.id, {
      onSuccess: () => setShowDeleteDialog(false),
    })
  }

  if (isEditing) {
    return (
      <TaskEditForm
        task={task}
        workflowStates={workflowStates}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => setIsEditing(false)}
      />
    )
  }

  return (
    <>
      <li className="group flex items-center gap-2.5 rounded-md px-3 py-1.5 transition-colors hover:bg-surface-hover">
        {/* Priority (placeholder) */}
        <PriorityNoneIcon className="h-4 w-4 shrink-0 text-muted/50" />

        {/* Display ID */}
        {displayId && (
          <span className="w-16 shrink-0 text-xs text-muted">{displayId}</span>
        )}

        {/* Status icon — click to open status picker */}
        <DropdownMenu open={showStatusMenu} onOpenChange={setShowStatusMenu}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="shrink-0 rounded p-0.5 transition-colors hover:bg-surface-active"
            >
              <StatusIcon type={currentState?.type ?? 'unstarted'} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-50">
            {workflowStates.map((state) => (
              <DropdownMenuItem
                key={state.id}
                onSelect={() => handleStatusChange(state.id)}
                className="gap-2.5"
              >
                <StatusIcon type={state.type} />
                <span className="flex-1">{state.name}</span>
                {state.id === task.stateId && (
                  <CheckIcon className="text-primary" width={14} height={14} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Title — click to navigate to detail */}
        <Link
          to="/tasks/$taskId"
          params={{ taskId: task.id }}
          className="min-w-0 flex-1 truncate text-sm text-foreground hover:text-primary"
        >
          {task.title}
        </Link>

        {/* ⋮ More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-surface-active group-hover:opacity-100"
            >
              <MoreVerticalIcon />
              <span className="sr-only">Actions</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-45">
            <DropdownMenuItem
              onSelect={() => setIsEditing(true)}
              className="gap-2"
            >
              <EditIcon width={14} height={14} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              isDestructive
              onSelect={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <TrashIcon width={14} height={14} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{task.title}&rdquo;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
            >
              {deleteTask.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
