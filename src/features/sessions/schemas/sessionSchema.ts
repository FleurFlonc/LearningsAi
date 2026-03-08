import { z } from 'zod';

// Constante arrays voor Zod enum-validatie
const SESSION_STATUS_VALUES = ['success', 'partial', 'failed'] as const;
const AI_TOOL_TYPE_VALUES = ['chatgpt', 'claude', 'cursor', 'gemini', 'copilot', 'other'] as const;
const TASK_TYPE_VALUES = ['debugging', 'prompting', 'writing', 'research', 'automation', 'ideation', 'other'] as const;
const PROBLEM_CATEGORY_VALUES = ['prompting', 'technical', 'context', 'output_quality', 'workflow', 'unknown'] as const;
const RESOLUTION_TYPE_VALUES = ['reprompt', 'more_context', 'changed_tool', 'manual_fix', 'code_fix', 'research', 'other'] as const;

/**
 * Volledig schema — spiegelt het LearningSession interface exact.
 */
export const SessionSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  taskDescription: z
    .string()
    .min(3, 'Minimaal 3 tekens vereist')
    .max(500, 'Maximaal 500 tekens toegestaan'),

  status: z.enum(SESSION_STATUS_VALUES),

  lessonLearned: z
    .string()
    .min(5, 'Minimaal 5 tekens vereist')
    .max(1000, 'Maximaal 1000 tekens toegestaan'),

  whatWentWrong: z.string().optional(),
  resolution: z.string().optional(),
  reflectionNotes: z.string().optional(),

  aiTool: z.enum(AI_TOOL_TYPE_VALUES).optional(),
  taskType: z.enum(TASK_TYPE_VALUES).optional(),
  problemCategory: z.enum(PROBLEM_CATEGORY_VALUES).optional(),
  resolutionType: z.enum(RESOLUTION_TYPE_VALUES).optional(),

  learningValue: z.number().int().min(1).max(5).optional(),
  frustrationLevel: z.number().int().min(1).max(5).optional(),
  confidenceAfter: z.number().int().min(1).max(5).optional(),

  durationMinutes: z.number().int().min(0).max(600).optional(),

  tags: z.array(z.string().max(30, 'Tag maximaal 30 tekens')).optional(),
  isFavorite: z.boolean().optional(),
});

/**
 * Schema voor het aanmaken van een sessie — zonder server-gegenereerde velden.
 */
export const CreateSessionSchema = SessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Minimaal schema voor snel invoeren — alleen de drie verplichte kernvelden.
 * Gebruikt in het snelle invoerformulier (Fase B).
 */
export const QuickEntrySchema = z.object({
  taskDescription: z
    .string()
    .min(3, 'Minimaal 3 tekens vereist')
    .max(500, 'Maximaal 500 tekens toegestaan'),
  status: z.enum(SESSION_STATUS_VALUES),
  lessonLearned: z
    .string()
    .min(5, 'Minimaal 5 tekens vereist')
    .max(1000, 'Maximaal 1000 tekens toegestaan'),
});

// Geëxporteerde inferentie-types
export type SessionSchemaType = z.infer<typeof SessionSchema>;
export type CreateSessionSchemaType = z.infer<typeof CreateSessionSchema>;
export type QuickEntrySchemaType = z.infer<typeof QuickEntrySchema>;
