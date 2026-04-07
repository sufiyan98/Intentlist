/**
 * Mood Matching Service Tests
 */

import { Task, TaskStatus, MoodState, DurationEstimate } from '@/types';
import {
  getTasksForMood,
  getCompatibleMoods,
  getMaxDurationForMood,
  isTaskCompatibleWithMood,
  needsMoodRefresh,
  getMoodDisplayData,
  isValidMoodState,
} from '@/services/mood/mood-matching.service';

// ============================================
// Test Helpers
// ============================================

function createTask(overrides: Partial<Task> = {}): Task {
  const now = Date.now();
  return {
    id: 'test-id',
    userId: 'test-user',
    title: 'Test Task',
    notes: null,
    status: 'active' as TaskStatus,
    requiredMood: null,
    estimatedDuration: null,
    personTag: null,
    locationTag: null,
    locationLat: null,
    locationLng: null,
    locationRadiusMeters: null,
    dueDate: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    sortOrder: 0,
    frictionScore: 0,
    frictionIntervenedAt: null,
    timesSnoozed: 0,
    timesDueDateMoved: 0,
    timesScrolledPast: 0,
    isSynced: false,
    serverUpdatedAt: null,
    ...overrides,
  };
}

// ============================================
// Tests
// ============================================

describe('Mood Matching Service', () => {
  describe('getTasksForMood', () => {
    it('should return tasks compatible with focused mood', () => {
      const tasks = [
        createTask({ id: '1', requiredMood: 'focused' as MoodState }),
        createTask({ id: '2', requiredMood: 'any' as MoodState }),
        createTask({ id: '3', requiredMood: 'quick_clear' as MoodState }),
      ];

      const result = getTasksForMood(tasks, 'focused' as MoodState);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should return tasks compatible with low_energy mood (excludes long tasks)', () => {
      const tasks = [
        createTask({
          id: '1',
          requiredMood: 'low_energy' as MoodState,
          estimatedDuration: 15 as DurationEstimate,
        }),
        createTask({
          id: '2',
          requiredMood: 'low_energy' as MoodState,
          estimatedDuration: 60 as DurationEstimate,
        }),
      ];

      const result = getTasksForMood(tasks, 'low_energy' as MoodState);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should respect the limit parameter', () => {
      const tasks = [
        createTask({ id: '1', requiredMood: 'any' as MoodState }),
        createTask({ id: '2', requiredMood: 'any' as MoodState }),
        createTask({ id: '3', requiredMood: 'any' as MoodState }),
        createTask({ id: '4', requiredMood: 'any' as MoodState }),
      ];

      const result = getTasksForMood(tasks, 'focused' as MoodState, 2);

      expect(result).toHaveLength(2);
    });

    it('should sort by friction score (higher first)', () => {
      const tasks = [
        createTask({ id: '1', frictionScore: 5 }),
        createTask({ id: '2', frictionScore: 10 }),
        createTask({ id: '3', frictionScore: 2 }),
      ];

      const result = getTasksForMood(tasks, 'any' as MoodState);

      expect(result[0].frictionScore).toBe(10);
      expect(result[1].frictionScore).toBe(5);
      expect(result[2].frictionScore).toBe(2);
    });

    it('should return empty array when no tasks match', () => {
      const tasks = [
        createTask({ id: '1', requiredMood: 'focused' as MoodState }),
      ];

      const result = getTasksForMood(tasks, 'quick_clear' as MoodState);

      expect(result).toHaveLength(0);
    });
  });

  describe('getCompatibleMoods', () => {
    it('should return compatible moods for focused', () => {
      const result = getCompatibleMoods('focused' as MoodState);
      expect(result).toContain('focused');
      expect(result).toContain('any');
    });

    it('should return compatible moods for low_energy', () => {
      const result = getCompatibleMoods('low_energy' as MoodState);
      expect(result).toContain('low_energy');
      expect(result).toContain('quick_clear');
      expect(result).toContain('any');
    });

    it('should return compatible moods for creative', () => {
      const result = getCompatibleMoods('creative' as MoodState);
      expect(result).toContain('creative');
      expect(result).toContain('focused');
      expect(result).toContain('any');
    });
  });

  describe('getMaxDurationForMood', () => {
    it('should return null for focused mood (no limit)', () => {
      expect(getMaxDurationForMood('focused' as MoodState)).toBeNull();
    });

    it('should return 30 for low_energy mood', () => {
      expect(getMaxDurationForMood('low_energy' as MoodState)).toBe(30);
    });

    it('should return 15 for quick_clear mood', () => {
      expect(getMaxDurationForMood('quick_clear' as MoodState)).toBe(15);
    });

    it('should return 30 for between_things mood', () => {
      expect(getMaxDurationForMood('between_things' as MoodState)).toBe(30);
    });
  });

  describe('isTaskCompatibleWithMood', () => {
    it('should return true for task with matching mood', () => {
      const task = createTask({ requiredMood: 'focused' as MoodState });
      expect(isTaskCompatibleWithMood(task, 'focused' as MoodState)).toBe(true);
    });

    it('should return true for task with any mood', () => {
      const task = createTask({ requiredMood: null });
      expect(isTaskCompatibleWithMood(task, 'focused' as MoodState)).toBe(true);
    });

    it('should return false for incompatible mood', () => {
      const task = createTask({ requiredMood: 'focused' as MoodState });
      expect(isTaskCompatibleWithMood(task, 'quick_clear' as MoodState)).toBe(false);
    });

    it('should return false when task duration exceeds mood limit', () => {
      const task = createTask({
        requiredMood: 'any' as MoodState,
        estimatedDuration: 60 as DurationEstimate,
      });
      expect(isTaskCompatibleWithMood(task, 'quick_clear' as MoodState)).toBe(false);
    });
  });

  describe('needsMoodRefresh', () => {
    it('should return true when no last mood change', () => {
      expect(needsMoodRefresh(null)).toBe(true);
    });

    it('should return false when mood changed recently', () => {
      const recentTime = Date.now() - 1000 * 60 * 60; // 1 hour ago
      expect(needsMoodRefresh(recentTime)).toBe(false);
    });

    it('should return true when mood changed more than 4 hours ago', () => {
      const oldTime = Date.now() - 1000 * 60 * 60 * 5; // 5 hours ago
      expect(needsMoodRefresh(oldTime)).toBe(true);
    });

    it('should return true when mood changed exactly at 4 hour threshold', () => {
      const thresholdTime = Date.now() - 1000 * 60 * 60 * 4 - 1; // Just over 4 hours
      expect(needsMoodRefresh(thresholdTime)).toBe(true);
    });
  });

  describe('getMoodDisplayData', () => {
    it('should return display data for focused mood', () => {
      const result = getMoodDisplayData('focused' as MoodState);
      expect(result).toBeDefined();
      expect(result?.label).toBe('Focused and sharp');
      expect(result?.emoji).toBe('🔥');
    });

    it('should return undefined for invalid mood', () => {
      const result = getMoodDisplayData('invalid' as MoodState);
      expect(result).toBeUndefined();
    });
  });

  describe('isValidMoodState', () => {
    it('should return true for valid mood states', () => {
      expect(isValidMoodState('focused')).toBe(true);
      expect(isValidMoodState('low_energy')).toBe(true);
      expect(isValidMoodState('between_things')).toBe(true);
      expect(isValidMoodState('creative')).toBe(true);
      expect(isValidMoodState('quick_clear')).toBe(true);
      expect(isValidMoodState('any')).toBe(true);
    });

    it('should return false for invalid mood states', () => {
      expect(isValidMoodState('invalid')).toBe(false);
      expect(isValidMoodState('')).toBe(false);
      expect(isValidMoodState('Focused')).toBe(false);
    });
  });
});
