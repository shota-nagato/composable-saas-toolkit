import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema } from '@toolkit/tasks'
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
import { useCreateTask } from '../../hooks/useTasks'
import { useWorkflowStates } from '../../hooks/useWorkflowStates'
import type { CreateTaskInput } from '../../lib/api'

interface TaskCreateFormProps {
  onCancel: () => void
  onSuccess?: () => void
}

export function TaskCreateForm({ onCancel, onSuccess }: TaskCreateFormProps) {
  const { data: workflowStates, isLoading: statesLoading } = useWorkflowStates()
  const createTask = useCreateTask()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: null,
      stateId: '',
    },
    mode: 'onChange',
  })

  function onSubmit(data: CreateTaskInput) {
    createTask.mutate(
      {
        ...data,
        description: data.description?.trim() || null,
      },
      {
        onSuccess: () => {
          reset()
          onSuccess?.()
        },
      },
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg border border-border bg-surface p-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          placeholder="Task title"
          autoFocus
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-state">Status</Label>
        <Controller
          name="stateId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="task-state">
                <SelectValue
                  placeholder={statesLoading ? 'Loading...' : 'Select a status'}
                />
              </SelectTrigger>
              <SelectContent>
                {workflowStates?.map((state) => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.stateId && (
          <p className="text-sm text-destructive">{errors.stateId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-description">
          Description <span className="font-normal text-muted">(optional)</span>
        </Label>
        <Textarea
          id="task-description"
          placeholder="Add a description..."
          rows={3}
          {...register('description')}
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid || createTask.isPending}>
          {createTask.isPending ? 'Creating...' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}
