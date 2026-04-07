/**
 * Mood Matching Service
 * Phase 1: Match tasks to user's current mood state (TRD 6.1)
 */

import { Task, MoodState } from '@/types';

export type { MoodState };

// ============================================
// Mood Configuration (PRD 6.1, TRD 6.1)
// ============================================

const MOOD_COMPATIBILITY: Record<MoodState, MoodState[]> = {
  focused: ['focused', 'any'],
  low_energy: ['low_energy', 'quick_clear', 'any'],
  between_things: ['between_things', 'quick_clear', 'any'],
  creative: ['creative', 'focused', 'any'],
  quick_clear: ['quick_clear', 'low_energy', 'any'],
  any: ['focused', 'low_energy', 'between_things', 'creative', 'quick_clear', 'any'],
} as const;

const MOOD_MAX_DURATION: Record<MoodState, number | null> = {
  focused: null,
  low_energy: 30,
  between_things: 30,
  creative: null,
  quick_clear: 15,
  any: null,
} as const;

const FOCUSED_TASK_VIEW_LIMIT = 6;

// ============================================
// Service Functions
// ============================================

/**
 * Get tasks that match the user's current mood state
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
      const taskMood = task.requiredMood ?? 'any';
      const moodMatch = compatibleMoods.includes(taskMood);
      const durationMatch =
        maxDuration === null || (task.estimatedDuration ?? 0) <= maxDuration;
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
 */
export function getCompatibleMoods(mood: MoodState): MoodState[] {
  return MOOD_COMPATIBILITY[mood];
}

/**
 * Get the maximum task duration for a given mood state
 */
export function getMaxDurationForMood(mood: MoodState): number | null {
  return MOOD_MAX_DURATION[mood];
}

/**
 * Check if a task is compatible with a mood state
 */
export function isTaskCompatibleWithMood(task: Task, mood: MoodState): boolean {
  const compatibleMoods = MOOD_COMPATIBILITY[mood];
  const maxDuration = MOOD_MAX_DURATION[mood];

  const taskMood = task.requiredMood ?? 'any';
  const moodMatch = compatibleMoods.includes(taskMood);
  const taskDuration = task.estimatedDuration ?? 0;
  const durationMatch = maxDuration === null || taskDuration <= maxDuration;

  return moodMatch && durationMatch;
}

/**
 * Check if mood needs refresh (after 4+ hours per PRD 6.1)
 */
export function needsMoodRefresh(lastMoodChange: number | null): boolean {
  if (!lastMoodChange) return true;

  const fourHoursInMs = 4 * 60 * 60 * 1000;
  return Date.now() - lastMoodChange > fourHoursInMs;
}

/**
 * Get mood display data
 */
export interface MoodDisplayData {
  id: MoodState;
  label: string;
  emoji: string;
  description: string;
}

export const MOOD_OPTIONS: MoodDisplayData[] = [
  {
    id: 'focused',
    label: 'Focused and sharp',
    emoji: '🔥',
    description: 'Deep work available',
  },
  {
    id: 'low_energy',
    label: 'Running on low',
    emoji: '🪫',
    description: 'Need easy wins',
  },
  {
    id: 'between_things',
    label: 'In between things',
    emoji: '⚡',
    description: 'Have 20–30 minutes',
  },
  {
    id: 'creative',
    label: 'Creative headspace',
    emoji: '🎨',
    description: 'Good for brainstorming/writing',
  },
  {
    id: 'quick_clear',
    label: 'Just want to clear',
    emoji: '✅',
    description: 'Errands and quick tasks',
  },
] as const;

/**
 * Get mood display data by ID
 */
export function getMoodDisplayData(moodId: MoodState): MoodDisplayData | undefined {
  return MOOD_OPTIONS.find((m) => m.id === moodId);
}

/**
 * Validate mood state value
 */
export function isValidMoodState(value: string): value is MoodState {
  return ['focused', 'low_energy', 'between_things', 'creative', 'quick_clear', 'any'].includes(value);
}
