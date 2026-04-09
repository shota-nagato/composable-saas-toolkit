import { zodResolver } from '@hookform/resolvers/zod'
import { taskPriorityValues } from '@toolkit/db'
import { createTaskSchema } from '@toolkit/tasks'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DropdownMenuItem,
  Input,
  isEmptyHtml,
  RichTextEditor,
} from '@toolkit/ui'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import CheckIcon from '../../assets/svg/actions/check.svg?react'
import { useCreateTask } from '../../hooks/useTasks'
import { useWorkflowStates } from '../../hooks/useWorkflowStates'
import type { CreateTaskInput } from '../../lib/api'
import { priorityLabels } from '../../lib/priority'
import { PriorityIcon } from './PriorityIcon'
import { PropertyButton } from './PropertyButton'
import { StatusIcon } from './StatusIcon'

interface TaskCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskCreateDialog({
  open,
  onOpenChange,
}: TaskCreateDialogProps) {
  const { data: workflowStates } = useWorkflowStates()
  const createTask = useCreateTask()
  const titleRef = useRef<HTMLInputElement | null>(null)
  const [editorInert, setEditorInert] = useState(true)

  const defaultStateId = workflowStates?.[0]?.id ?? ''

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isValid },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: null,
      stateId: defaultStateId,
      priority: 'no_priority',
    },
    mode: 'onChange',
  })

  const titleRegister = register('title')

  // inert を解除して Tiptap を操作可能にする（title にフォーカス後）
  // close 時のリセットは handleOpenChange 側で行う
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => setEditorInert(false), 150)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (defaultStateId) {
      setValue('stateId', defaultStateId, { shouldValidate: true })
    }
  }, [defaultStateId, setValue])

  const currentStateId = useWatch({ control, name: 'stateId' })
  const currentPriority =
    useWatch({ control, name: 'priority' }) ?? 'no_priority'
  const currentState = workflowStates?.find((s) => s.id === currentStateId)

  function onSubmit(data: CreateTaskInput) {
    createTask.mutate(
      {
        ...data,
        description: isEmptyHtml(data.description) ? null : data.description,
      },
      {
        onSuccess: () => {
          reset()
          onOpenChange(false)
        },
      },
    )
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setEditorInert(true)
      reset({
        title: '',
        description: null,
        stateId: defaultStateId,
        priority: 'no_priority',
      })
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          titleRef.current?.focus()
        }}
      >
        <DialogTitle className="sr-only">New Issue</DialogTitle>
        <DialogDescription className="sr-only">
          Create a new task
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Title */}
          <div className="px-5 pt-5">
            <Input
              placeholder="Issue title"
              className="border-none bg-transparent px-0 text-base font-medium shadow-none placeholder:text-muted focus-visible:ring-0"
              {...titleRegister}
              ref={(el) => {
                titleRegister.ref(el)
                titleRef.current = el
              }}
            />
          </div>

          {/* Description — inert until title is focused to prevent Tiptap from stealing focus */}
          <div className="px-5 pb-3" inert={editorInert ? true : undefined}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  content={field.value ?? ''}
                  onChange={(html) => field.onChange(html)}
                  placeholder="Add description..."
                  className="min-h-24"
                />
              )}
            />
          </div>

          {/* Property pills */}
          <div className="flex items-center gap-2 border-t border-border px-5 py-3">
            <Controller
              name="stateId"
              control={control}
              render={({ field }) => (
                <PropertyButton
                  modal={false}
                  icon={
                    <StatusIcon
                      type={currentState?.type ?? 'unstarted'}
                      className="h-3.5 w-3.5"
                    />
                  }
                  label={currentState?.name ?? 'Status'}
                >
                  {workflowStates?.map((state) => (
                    <DropdownMenuItem
                      key={state.id}
                      onSelect={() => field.onChange(state.id)}
                      className="gap-2.5"
                    >
                      <StatusIcon type={state.type} className="h-3.5 w-3.5" />
                      <span className="flex-1">{state.name}</span>
                      {state.id === currentStateId && (
                        <CheckIcon
                          className="text-primary"
                          width={14}
                          height={14}
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </PropertyButton>
              )}
            />

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <PropertyButton
                  modal={false}
                  icon={
                    <PriorityIcon
                      priority={currentPriority}
                      className="h-3.5 w-3.5"
                    />
                  }
                  label={priorityLabels[currentPriority]}
                >
                  {taskPriorityValues.map((p) => (
                    <DropdownMenuItem
                      key={p}
                      onSelect={() => field.onChange(p)}
                      className="gap-2.5"
                    >
                      <PriorityIcon priority={p} className="h-3.5 w-3.5" />
                      <span className="flex-1">{priorityLabels[p]}</span>
                      {p === currentPriority && (
                        <CheckIcon
                          className="text-primary"
                          width={14}
                          height={14}
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </PropertyButton>
              )}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-border px-5 py-3">
            <Button
              type="submit"
              size="sm"
              disabled={!isValid || createTask.isPending}
            >
              {createTask.isPending ? 'Creating...' : 'Create issue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
