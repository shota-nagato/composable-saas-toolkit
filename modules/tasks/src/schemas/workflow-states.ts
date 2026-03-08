import { workflowStateTypes } from '@toolkit/db'
import { z } from 'zod'

export const createWorkflowStateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(workflowStateTypes),
  color: z.string().nullable().optional(),
  position: z.number().int().min(0).optional(),
})
