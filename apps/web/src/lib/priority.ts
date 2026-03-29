import type { Task } from './api'

type TaskPriority = Task['priority']

export const priorityLabels: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  no_priority: 'No priority',
}
