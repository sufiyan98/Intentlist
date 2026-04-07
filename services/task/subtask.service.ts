/**
 * Subtask Service
 * Phase 1: Subtask management for tasks
 */

import { Subtask, SubtaskInput } from '@/types';

// In-memory storage for subtasks (Phase 1)
// Phase 2: Move to SQLite
let inMemorySubtasks: Map<string, Subtask> = new Map();

// Map to track subtasks by task ID
let taskSubtaskMap: Map<string, Set<string>> = new Map();

// Counter for generating unique IDs
let subtaskCounter = 0;

/**
 * Generate a unique subtask ID
 */
function generateSubtaskId(): string {
  subtaskCounter++;
  return `subtask_${Date.now()}_${subtaskCounter}`;
}

// ============================================
// Service Functions
// ============================================

/**
 * Create a new subtask
 */
export async function createSubtask(
  taskId: string,
  input: SubtaskInput
): Promise<Subtask> {
  const now = Date.now();
  const subtaskId = generateSubtaskId();

  // Get the highest sort order for this task
  const taskSubtasks = await getSubtasksForTask(taskId);
  const maxSortOrder = taskSubtasks.reduce(
    (max: number, st: Subtask) => Math.max(max, st.sortOrder),
    0
  );

  const newSubtask: Subtask = {
    id: subtaskId,
    taskId,
    title: input.title.trim(),
    isCompleted: input.isCompleted ?? false,
    sortOrder: input.sortOrder ?? maxSortOrder + 1,
    createdAt: now,
  };

  inMemorySubtasks.set(subtaskId, newSubtask);

  // Add to task mapping
  if (!taskSubtaskMap.has(taskId)) {
    taskSubtaskMap.set(taskId, new Set());
  }
  taskSubtaskMap.get(taskId)!.add(subtaskId);

  return newSubtask;
}

/**
 * Get a subtask by ID
 */
export async function getSubtaskById(subtaskId: string): Promise<Subtask | null> {
  return inMemorySubtasks.get(subtaskId) ?? null;
}

/**
 * Get all subtasks for a task
 */
export async function getSubtasksForTask(taskId: string): Promise<Subtask[]> {
  const subtaskIds = taskSubtaskMap.get(taskId);

  if (!subtaskIds) {
    return [];
  }

  const subtasks: Subtask[] = [];
  for (const id of subtaskIds) {
    const subtask = inMemorySubtasks.get(id);
    if (subtask) {
      subtasks.push(subtask);
    }
  }

  return subtasks.sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Update a subtask
 */
export async function updateSubtask(
  subtaskId: string,
  updates: Partial<SubtaskInput>
): Promise<Subtask | null> {
  const existingSubtask = inMemorySubtasks.get(subtaskId);
  if (!existingSubtask) {
    return null;
  }

  const updatedSubtask: Subtask = {
    ...existingSubtask,
    ...updates,
    title: updates.title !== undefined ? updates.title.trim() : existingSubtask.title,
  };

  inMemorySubtasks.set(subtaskId, updatedSubtask);
  return updatedSubtask;
}

/**
 * Toggle subtask completion
 */
export async function toggleSubtaskCompletion(
  subtaskId: string
): Promise<Subtask | null> {
  const existingSubtask = inMemorySubtasks.get(subtaskId);
  if (!existingSubtask) {
    return null;
  }

  const updatedSubtask: Subtask = {
    ...existingSubtask,
    isCompleted: !existingSubtask.isCompleted,
  };

  inMemorySubtasks.set(subtaskId, updatedSubtask);
  return updatedSubtask;
}

/**
 * Delete a subtask
 */
export async function deleteSubtask(subtaskId: string): Promise<boolean> {
  const subtask = inMemorySubtasks.get(subtaskId);
  if (!subtask) {
    return false;
  }

  // Remove from task mapping
  const taskSubtasks = taskSubtaskMap.get(subtask.taskId);
  if (taskSubtasks) {
    taskSubtasks.delete(subtaskId);
    if (taskSubtasks.size === 0) {
      taskSubtaskMap.delete(subtask.taskId);
    }
  }

  // Remove from storage
  inMemorySubtasks.delete(subtaskId);
  return true;
}

/**
 * Delete all subtasks for a task
 */
export async function deleteAllSubtasksForTask(taskId: string): Promise<void> {
  const subtaskIds = taskSubtaskMap.get(taskId);

  if (subtaskIds) {
    for (const id of subtaskIds) {
      inMemorySubtasks.delete(id);
    }
    taskSubtaskMap.delete(taskId);
  }
}

/**
 * Reorder subtasks
 */
export async function reorderSubtasks(
  taskId: string,
  subtaskIds: string[]
): Promise<Subtask[]> {
  const subtasks: Subtask[] = [];

  for (let i = 0; i < subtaskIds.length; i++) {
    const subtask = inMemorySubtasks.get(subtaskIds[i]);
    if (subtask && subtask.taskId === taskId) {
      const updated: Subtask = {
        ...subtask,
        sortOrder: i,
      };
      inMemorySubtasks.set(subtaskIds[i], updated);
      subtasks.push(updated);
    }
  }

  return subtasks.sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get completion stats for a task's subtasks
 */
export async function getSubtaskStats(taskId: string): Promise<{
  total: number;
  completed: number;
  percentComplete: number;
}> {
  const subtasks = await getSubtasksForTask(taskId);
  const total = subtasks.length;
  const completed = subtasks.filter((st) => st.isCompleted).length;
  const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, percentComplete };
}

/**
 * Clear all subtasks (for testing)
 */
export function clearAllSubtasks(): void {
  inMemorySubtasks.clear();
  taskSubtaskMap.clear();
  subtaskCounter = 0;
}
