import { taskPriorityValues } from '@toolkit/db'
import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(10000).nullable().optional(),
  stateId: z.string().min(1),
  priority: z.enum(taskPriorityValues).optional().default('no_priority'),
})

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).max(255),
    description: z.string().max(10000).nullable().optional(),
    stateId: z.string().min(1),
    priority: z.enum(taskPriorityValues),
  })
  .partial()
