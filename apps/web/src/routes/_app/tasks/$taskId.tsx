import { createFileRoute, Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@toolkit/ui'
import { useRef, useState } from 'react'
import CheckIcon from '../../../assets/svg/actions/check.svg?react'
import { StatusIcon } from '../../../features/tasks/StatusIcon'
import { useTask, useUpdateTask } from '../../../hooks/useTasks'
import { useWorkflowStates } from '../../../hooks/useWorkflowStates'
import { formatDate } from '../../../lib/format'

export const Route = createFileRoute('/_app/tasks/$taskId')({
  component: TaskDetailPage,
})

function TaskDetailPage() {
  const { taskId } = Route.useParams()
  const { data: task, isLoading: taskLoading } = useTask(taskId)
  const { data: workflowStates, isLoading: statesLoading } = useWorkflowStates()
  const updateTask = useUpdateTask()

  if (taskLoading || statesLoading) {
    return <p className="p-6 text-sm text-muted">Loading...</p>
  }

  if (!task) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted">Task not found</p>
        <Link to="/tasks" className="mt-2 inline-block text-sm text-primary">
          Back to tasks
        </Link>
      </div>
    )
  }

  const currentState = workflowStates?.find((s) => s.id === task.stateId)

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 border-b border-border px-6 py-2.5 text-sm text-muted">
          <Link to="/tasks" className="hover:text-foreground">
            Tasks
          </Link>
          <span>/</span>
          <span className="truncate text-foreground">{task.title}</span>
        </div>

        {/* Content area */}
        <div className="mx-auto max-w-2xl px-8 py-8">
          {/* Title (inline editable) */}
          <EditableTitle
            value={task.title}
            onSave={(title) => updateTask.mutate({ id: task.id, title })}
          />

          {/* Description (inline editable) */}
          <div className="mt-6">
            <EditableDescription
              value={task.description ?? ''}
              onSave={(description) =>
                updateTask.mutate({
                  id: task.id,
                  description: description.trim() || null,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Right sidebar — Properties */}
      <div className="hidden w-64 shrink-0 border-l border-border bg-surface p-4 lg:block">
        <h3 className="mb-3 text-xs font-medium tracking-wide text-muted uppercase">
          Properties
        </h3>

        {/* Status */}
        <div className="mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface-hover"
              >
                <StatusIcon type={currentState?.type ?? 'unstarted'} />
                <span className="text-foreground">
                  {currentState?.name ?? 'Unknown'}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-50">
              {workflowStates?.map((state) => (
                <DropdownMenuItem
                  key={state.id}
                  onSelect={() =>
                    updateTask.mutate({ id: task.id, stateId: state.id })
                  }
                  className="gap-2.5"
                >
                  <StatusIcon type={state.type} />
                  <span className="flex-1">{state.name}</span>
                  {state.id === task.stateId && (
                    <CheckIcon
                      className="text-primary"
                      width={14}
                      height={14}
                    />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Timestamps */}
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Created</span>
            <span className="text-foreground">
              {formatDate(task.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Updated</span>
            <span className="text-foreground">
              {formatDate(task.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditableTitle({
  value,
  onSave,
}: {
  value: string
  onSave: (v: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleStartEdit() {
    setDraft(value)
    setIsEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSave() {
    setIsEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') setIsEditing(false)
        }}
        className="w-full bg-transparent text-2xl font-bold text-foreground outline-none"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={handleStartEdit}
      className="w-full cursor-text text-left text-2xl font-bold text-foreground hover:text-foreground/80"
    >
      {value}
    </button>
  )
}

function EditableDescription({
  value,
  onSave,
}: {
  value: string
  onSave: (v: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleStartEdit() {
    setDraft(value)
    setIsEditing(true)
    setTimeout(() => {
      const el = textareaRef.current
      if (el) {
        el.focus()
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
      }
    }, 0)
  }

  function handleSave() {
    setIsEditing(false)
    if (draft !== value) {
      onSave(draft)
    }
  }

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          e.target.style.height = 'auto'
          e.target.style.height = `${e.target.scrollHeight}px`
        }}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsEditing(false)
        }}
        className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none"
        rows={3}
      />
    )
  }

  if (!value) {
    return (
      <button
        type="button"
        onClick={handleStartEdit}
        className="w-full cursor-text text-left text-sm text-muted italic hover:text-muted/70"
      >
        Add description...
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleStartEdit}
      className="w-full cursor-text whitespace-pre-wrap text-left text-sm leading-relaxed text-foreground hover:text-foreground/80"
    >
      {value}
    </button>
  )
}
