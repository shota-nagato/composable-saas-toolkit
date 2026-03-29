import { zodResolver } from '@hookform/resolvers/zod'
import { updateTaskSchema } from '@toolkit/tasks'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@toolkit/ui'
import { Controller, useForm } from 'react-hook-form'
import { useUpdateTask } from '../../hooks/useTasks'
import type { Task, UpdateTaskInput, WorkflowState } from '../../lib/api'

interface TaskEditFormProps {
  task: Task
  workflowStates: WorkflowState[]
  onCancel: () => void
  onSuccess?: () => void
}

export function TaskEditForm({
  task,
  workflowStates,
  onCancel,
  onSuccess,
}: TaskEditFormProps) {
  const updateTask = useUpdateTask()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm<UpdateTaskInput>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? '',
      stateId: task.stateId,
    },
    mode: 'onChange',
  })

  function onSubmit(data: UpdateTaskInput) {
    updateTask.mutate(
      {
        id: task.id,
        ...data,
        description: data.description?.trim() || null,
      },
      {
        onSuccess: () => onSuccess?.(),
      },
    )
  }

  return (
    <li>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-md border border-border bg-surface p-4 shadow-sm"
      >
        <div className="space-y-1.5">
          <Label htmlFor={`edit-title-${task.id}`}>Title</Label>
          <Input
            id={`edit-title-${task.id}`}
            autoFocus
            {...register('title')}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`edit-state-${task.id}`}>Status</Label>
          <Controller
            name="stateId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={`edit-state-${task.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workflowStates.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`edit-desc-${task.id}`}>
            Description{' '}
            <span className="font-normal text-muted">(optional)</span>
          </Label>
          <Textarea
            id={`edit-desc-${task.id}`}
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isValid || !isDirty || updateTask.isPending}
          >
            {updateTask.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </li>
  )
}
