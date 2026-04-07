/**
 * Task Cap Enforcement Service
 * Phase 1: Enforce active task limit (PRD 6.2)
 */

import { Task } from '@/types/task';

// ============================================
// Configuration
// ============================================

export const DEFAULT_ACTIVE_TASK_LIMIT = 15;

export interface CapResolutionCandidate {
  task: Task;
  reason: 'oldest' | 'lowest_priority' | 'high_friction';
}

export interface CapCheckResult {
  canAdd: boolean;
  needsResolution: boolean;
  candidates?: CapResolutionCandidate[];
}

// ============================================
// Service Functions
// ============================================

/**
 * Check if user can add an active task (under cap)
 */
export function canAddActiveTask(
  activeTasks: Task[],
  limit: number = DEFAULT_ACTIVE_TASK_LIMIT
): boolean {
  return activeTasks.length < limit;
}

/**
 * Get cap resolution candidates when user is at cap
 * Shows 3 oldest/lowest-priority tasks with high friction
 */
export function getCapResolutionCandidates(
  activeTasks: Task[],
  limit: number = 3
): CapResolutionCandidate[] {
  // Sort by friction score (descending), then by creation date (ascending)
  const sorted = [...activeTasks].sort((a, b) => {
    if (b.frictionScore !== a.frictionScore) {
      return b.frictionScore - a.frictionScore;
    }
    return a.createdAt - b.createdAt;
  });

  return sorted.slice(0, limit).map((task) => ({
    task,
    reason: task.frictionScore > 0 ? 'high_friction' : 'oldest',
  }));
}

/**
 * Check if adding a task would exceed cap and return resolution info
 */
export function checkTaskCap(
  activeTasks: Task[],
  limit: number = DEFAULT_ACTIVE_TASK_LIMIT
): CapCheckResult {
  if (activeTasks.length >= limit) {
    const candidates = getCapResolutionCandidates(activeTasks);
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
 * Get the active task limit from preferences
 */
export function getActiveTaskLimit(preferences?: { activeTaskLimit?: 10 | 15 | 20 }): number {
  return preferences?.activeTaskLimit ?? DEFAULT_ACTIVE_TASK_LIMIT;
}

/**
 * Validate active task limit value
 */
export function isValidTaskLimit(value: number): value is 10 | 15 | 20 {
  return [10, 15, 20].includes(value);
}
