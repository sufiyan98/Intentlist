/**
 * Task Service with Cap Enforcement
 * Phase 1: Task CRUD operations with in-memory storage
 * Phase 2: Supabase sync integration
 */

import uuid from 'react-native-uuid';

import { Task, TaskInput, TaskUpdate, TaskStatus, CapResolutionCandidate } from '@/types';
import { DEFAULT_ACTIVE_TASK_LIMIT } from './task-cap.service';

// In-memory storage for Phase 1 (Phase 2: Supabase + SQLite)
let inMemoryTasks: Map<string, Task> = new Map();

/**
 * Check if user can add an active task (under cap)
 */
export async function canAddActiveTask(userId: string): Promise<boolean> {
  const activeCount = Array.from(inMemoryTasks.values()).filter(
    (t) => t.userId === userId && t.status === 'active'
  ).length;
  return activeCount < DEFAULT_ACTIVE_TASK_LIMIT;
}

/**
 * Get count of active tasks for a user
 */
export async function getActiveTaskCount(userId: string): Promise<number> {
  return Array.from(inMemoryTasks.values()).filter(
    (t) => t.userId === userId && t.status === 'active'
  ).length;
}

/**
 * Get cap resolution candidates when user is at cap
 */
export async function getCapResolutionCandidates(
  userId: string
): Promise<CapResolutionCandidate[]> {
  const activeTasks = Array.from(inMemoryTasks.values())
    .filter((t) => t.userId === userId && t.status === 'active')
    .sort((a, b) => b.frictionScore - a.frictionScore)
    .slice(0, 3);

  return activeTasks.map((task) => ({
    task,
    reason: task.frictionScore > 0 ? 'high_friction' : 'oldest',
  }));
}

/**
 * Check if adding a task would exceed cap and return resolution info
 */
export async function checkTaskCap(userId: string): Promise<{
  canAdd: boolean;
  needsResolution: boolean;
  candidates?: CapResolutionCandidate[];
}> {
  const count = await getActiveTaskCount(userId);

  if (count >= DEFAULT_ACTIVE_TASK_LIMIT) {
    const candidates = await getCapResolutionCandidates(userId);
    return {
      canAdd: false,
      needsResolution: true,
      candidates,
    };
  }

  return {
    canAdd: true,
    needsResolution: false,
  };
}

/**
 * Create a new task
 */
export async function createTask(userId: string, input: TaskInput): Promise<Task> {
  const now = Date.now();
  const taskId = uuid.v4() as string;

  // Get the highest sort order for this user
  const userTasks = Array.from(inMemoryTasks.values()).filter((t) => t.userId === userId);
  const maxSortOrder = userTasks.reduce((max, t) => Math.max(max, t.sortOrder), 0);

  const newTask: Task = {
    id: taskId,
    userId,
    title: input.title,
    notes: input.notes ?? null,
    status: 'active',
    requiredMood: input.requiredMood ?? null,
    estimatedDuration: input.estimatedDuration ?? null,
    personTag: input.personTag ?? null,
    locationTag: null,
    locationLat: null,
    locationLng: null,
    locationRadiusMeters: null,
    dueDate: input.dueDate ?? null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    sortOrder: input.sortOrder ?? maxSortOrder + 1,
    frictionScore: 0,
    frictionIntervenedAt: null,
    timesSnoozed: 0,
    timesDueDateMoved: 0,
    timesScrolledPast: 0,
    isSynced: false,
    serverUpdatedAt: null,
  };

  inMemoryTasks.set(taskId, newTask);
  return newTask;
}

/**
 * Get a task by ID
 */
export async function getTaskById(taskId: string): Promise<Task | null> {
  return inMemoryTasks.get(taskId) ?? null;
}

/**
 * Get all active tasks for a user
 */
export async function getActiveTasks(userId: string): Promise<Task[]> {
  return Array.from(inMemoryTasks.values())
    .filter((t) => t.userId === userId && t.status === 'active')
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get all tasks for a user (including completed, someday, etc.)
 */
export async function getAllTasks(userId: string): Promise<Task[]> {
  return Array.from(inMemoryTasks.values())
    .filter((t) => t.userId === userId && t.status === 'deleted')
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Update a task
 */
export async function updateTask(taskId: string, update: TaskUpdate): Promise<Task | null> {
  const existingTask = inMemoryTasks.get(taskId);
  if (!existingTask) return null;

  const updatedTask: Task = {
    ...existingTask,
    ...update,
    updatedAt: Date.now(),
  };

  inMemoryTasks.set(taskId, updatedTask);
  return updatedTask;
}

/**
 * Mark a task as completed
 */
export async function completeTask(taskId: string): Promise<Task | null> {
  return updateTask(taskId, {
    status: 'completed',
  });
}

/**
 * Move a task to someday list
 */
export async function moveToSomeday(taskId: string): Promise<Task | null> {
  return updateTask(taskId, {
    status: 'someday',
  });
}

/**
 * Soft delete a task
 */
export async function deleteTask(taskId: string): Promise<Task | null> {
  return updateTask(taskId, {
    status: 'deleted',
  });
}

/**
 * Permanently delete a task
 */
export async function permanentlyDeleteTask(taskId: string): Promise<void> {
  inMemoryTasks.delete(taskId);
}

/**
 * Get tasks by status for a user
 */
export async function getTasksByStatus(userId: string, status: TaskStatus): Promise<Task[]> {
  return Array.from(inMemoryTasks.values())
    .filter((t) => t.userId === userId && t.status === status)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Clear all tasks (for testing)
 */
export function clearAllTasks(): void {
  inMemoryTasks.clear();
}

/**
 * Get all tasks (for debugging)
 */
export function getAllTasksMap(): Map<string, Task> {
  return new Map(inMemoryTasks);
}
