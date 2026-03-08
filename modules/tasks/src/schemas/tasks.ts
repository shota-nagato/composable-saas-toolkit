import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  stateId: z.string().min(1),
})

export const updateTaskSchema = createTaskSchema.partial()
