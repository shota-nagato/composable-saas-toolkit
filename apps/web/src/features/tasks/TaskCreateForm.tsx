import { useState } from 'react'
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
import { useCreateTask } from '../../hooks/useTasks'
import { useWorkflowStates } from '../../hooks/useWorkflowStates'

interface TaskCreateFormProps {
  onCancel: () => void
  onSuccess?: () => void
}

export function TaskCreateForm({ onCancel, onSuccess }: TaskCreateFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stateId, setStateId] = useState('')

  const { data: workflowStates, isLoading: statesLoading } = useWorkflowStates()
  const createTask = useCreateTask()

  const canSubmit = title.trim().length > 0 && stateId.length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    createTask.mutate(
      {
        title: title.trim(),
        description: description.trim() || null,
        stateId,
      },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
          setStateId('')
          onSuccess?.()
        },
      },
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-border bg-surface p-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-state">Status</Label>
        <Select value={stateId} onValueChange={setStateId}>
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
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-description">
          Description <span className="text-muted font-normal">(optional)</span>
        </Label>
        <Textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={3}
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || createTask.isPending}>
          {createTask.isPending ? 'Creating...' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}
