import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).nullable().optional(),
  stateId: z.string().min(1),
})

export const updateTaskSchema = createTaskSchema.partial()
