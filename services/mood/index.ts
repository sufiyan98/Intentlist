/**
 * Mood Matching Service
 * Phase 1: Match tasks to user's current mood state (TRD 6.1)
 */

import { MoodState, Task } from '@/types';
import { MOOD_COMPATIBILITY, MOOD_MAX_DURATION, FOCUSED_TASK_VIEW_LIMIT } from '@/constants';

/**
 * Get tasks that match the user's current mood state
 * @param allActiveTasks - All active tasks for the user
 * @param mood - Current mood state
 * @param limit - Maximum number of tasks to return (default: 6)
 * @returns Filtered and sorted task list
 */
export function getTasksForMood(
  allActiveTasks: Task[],
  mood: MoodState,
  limit: number = FOCUSED_TASK_VIEW_LIMIT
): Task[] {
  const compatibleMoods = MOOD_COMPATIBILITY[mood];
  const maxDuration = MOOD_MAX_DURATION[mood];

  return allActiveTasks
    .filter((task) => {
      const moodMatch = compatibleMoods.includes(task.requiredMood ?? 'any');
      const durationMatch = maxDuration === null || (task.estimatedDuration ?? 0) <= maxDuration;
      return moodMatch && durationMatch;
    })
    .sort((a, b) => {
      // Sort by friction score (higher first) then by sort order
      if (b.frictionScore !== a.frictionScore) {
        return b.frictionScore - a.frictionScore;
      }
      return a.sortOrder - b.sortOrder;
    })
    .slice(0, limit);
}

/**
 * Get the compatible moods for a given mood state
 * @param mood - Current mood state
 * @returns Array of compatible mood states
 */
export function getCompatibleMoods(mood: MoodState): string[] {
  return MOOD_COMPATIBILITY[mood];
}

/**
 * Get the maximum task duration for a given mood state
 * @param mood - Current mood state
 * @returns Maximum duration in minutes, or null if no limit
 */
export function getMaxDurationForMood(mood: MoodState): number | null {
  return MOOD_MAX_DURATION[mood];
}

/**
 * Check if a task is compatible with a mood state
 * @param task - Task to check
 * @param mood - Mood state to check against
 * @returns True if task is compatible
 */
export function isTaskCompatibleWithMood(task: Task, mood: MoodState): boolean {
  const compatibleMoods = MOOD_COMPATIBILITY[mood];
  const maxDuration = MOOD_MAX_DURATION[mood];

  const moodMatch = compatibleMoods.includes(task.requiredMood ?? 'any');
  const durationMatch = maxDuration === null || (task.estimatedDuration ?? 0) <= maxDuration;

  return moodMatch && durationMatch;
}
