import { z } from 'zod';

export const statementSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt is too long'),
  conversationId: z.number().positive().optional()
});

export type StatementRequest = z.infer<typeof statementSchema>; 