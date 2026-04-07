/**
 * Task Validation Service
 * Phase 1: Zod validation for task create/update operations
 */

import { z } from 'zod';

import { MoodState, TaskStatus, DurationEstimate } from '@/types';

// ============================================
// Validation Schemas
// ============================================

/**
 * Task title validation
 * - Required, 1-200 characters, trimmed
 */
export const taskTitleSchema = z
  .string()
  .min(1, 'Task title is required')
  .max(200, 'Task title must be less than 200 characters')
  .transform((val) => val.trim());

/**
 * Task notes validation
 * - Optional, max 2000 characters
 */
export const taskNotesSchema = z
  .string()
  .max(2000, 'Notes must be less than 2000 characters')
  .nullable()
  .optional();

/**
 * Mood state validation
 */
export const moodStateSchema = z
  .enum(['focused', 'low_energy', 'between_things', 'creative', 'quick_clear', 'any'])
  .nullable()
  .optional();

/**
 * Duration estimate validation
 * - Must be one of: 5, 15, 30, 60, 120 minutes
 */
export const durationEstimateSchema = z
  .union([
    z.number(),
    z.string().transform((val) => parseInt(val, 10)),
  ])
  .refine(
    (val) => [5, 15, 30, 60, 120].includes(val),
    'Duration must be 5, 15, 30, 60, or 120 minutes'
  )
  .transform((val) => val as DurationEstimate)
  .nullable()
  .optional();

/**
 * Person tag validation
 * - Optional, 1-100 characters, trimmed
 */
export const personTagSchema = z
  .string()
  .max(100, 'Person name must be less than 100 characters')
  .transform((val) => val.trim())
  .refine((val) => val.length === 0 || val.length >= 1, {
    message: 'Person name must be at least 1 character',
  })
  .nullable()
  .optional();

/**
 * Due date validation
 * - Must be a valid timestamp (optional)
 */
export const dueDateSchema = z
  .number()
  .positive('Due date must be a valid timestamp')
  .nullable()
  .optional();

/**
 * Sort order validation
 */
export const sortOrderSchema = z.number().optional();

/**
 * Task input schema (for creating tasks)
 */
export const taskInputSchema = z.object({
  title: taskTitleSchema,
  notes: taskNotesSchema,
  requiredMood: moodStateSchema,
  estimatedDuration: durationEstimateSchema,
  personTag: personTagSchema,
  dueDate: dueDateSchema,
  sortOrder: sortOrderSchema,
});

/**
 * Task update schema (all fields optional except title if provided)
 */
export const taskUpdateSchema = z.object({
  title: taskTitleSchema.optional(),
  notes: taskNotesSchema,
  requiredMood: moodStateSchema,
  estimatedDuration: durationEstimateSchema,
  personTag: personTagSchema,
  dueDate: dueDateSchema,
  status: z
    .enum(['active', 'completed', 'someday', 'deleted'])
    .optional(),
  sortOrder: sortOrderSchema,
});

// ============================================
// Type Exports
// ============================================

export type TaskInputValidated = z.infer<typeof taskInputSchema>;
export type TaskUpdateValidated = z.infer<typeof taskUpdateSchema>;

// ============================================
// Validation Functions
// ============================================

/**
 * Validate task input data
 */
export function validateTaskInput(data: unknown): {
  success: boolean;
  data?: TaskInputValidated;
  errors?: string[];
} {
  const result = taskInputSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

/**
 * Validate task update data
 */
export function validateTaskUpdate(data: unknown): {
  success: boolean;
  data?: TaskUpdateValidated;
  errors?: string[];
} {
  const result = taskUpdateSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

/**
 * Validate task title
 */
export function validateTaskTitle(title: string): {
  success: boolean;
  value?: string;
  error?: string;
} {
  const result = taskTitleSchema.safeParse(title);

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message };
  }

  return { success: true, value: result.data };
}

/**
 * Validate person tag
 */
export function validatePersonTag(tag: string | null | undefined): {
  success: boolean;
  value?: string | null;
  error?: string;
} {
  const result = personTagSchema.safeParse(tag ?? null);

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message };
  }

  return { success: true, value: result.data };
}

/**
 * Validate duration
 */
export function validateDuration(
  duration: number | string | null | undefined
): {
  success: boolean;
  value?: DurationEstimate | null;
  error?: string;
} {
  const strValue = duration === null || duration === undefined ? null : String(duration);
  const result = durationEstimateSchema.safeParse(strValue);

  if (!result.success) {
    return {
      success: false,
      error: 'Duration must be 5, 15, 30, 60, or 120 minutes',
    };
  }

  return { success: true, value: result.data };
}
