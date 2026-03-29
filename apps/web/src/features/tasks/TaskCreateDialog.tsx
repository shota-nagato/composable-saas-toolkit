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
  Textarea,
} from '@toolkit/ui'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
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

  const defaultStateId = workflowStates?.[0]?.id ?? ''

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
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

  useEffect(() => {
    if (defaultStateId) {
      setValue('stateId', defaultStateId, { shouldValidate: true })
    }
  }, [defaultStateId, setValue])

  const currentStateId = watch('stateId')
  const currentPriority = watch('priority') ?? 'no_priority'
  const currentState = workflowStates?.find((s) => s.id === currentStateId)

  function onSubmit(data: CreateTaskInput) {
    createTask.mutate(
      {
        ...data,
        description: data.description?.trim() || null,
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
      <DialogContent className="max-w-lg p-0">
        <DialogTitle className="sr-only">New Issue</DialogTitle>
        <DialogDescription className="sr-only">
          Create a new task
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Title */}
          <div className="px-5 pt-5">
            <Input
              placeholder="Issue title"
              autoFocus
              className="border-none bg-transparent px-0 text-base font-medium shadow-none placeholder:text-muted focus-visible:ring-0"
              {...register('title')}
            />
          </div>

          {/* Description */}
          <div className="px-5 pb-3">
            <Textarea
              placeholder="Add description..."
              rows={3}
              className="resize-none border-none bg-transparent px-0 shadow-none placeholder:text-muted focus-visible:ring-0"
              {...register('description')}
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
