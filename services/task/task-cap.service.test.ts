/**
 * Task Cap Enforcement Service Tests
 */

import { Task, TaskId, TaskTitle } from '@/types/task';
import type { TaskStatus } from '@/types/task';
import {
  canAddActiveTask,
  getCapResolutionCandidates,
  checkTaskCap,
  getActiveTaskLimit,
  isValidTaskLimit,
  DEFAULT_ACTIVE_TASK_LIMIT,
} from '@/services/task/task-cap.service';

// ============================================
// Test Helpers
// ============================================

function createTask(overrides: Partial<Task> = {}): Task {
  const now = Date.now();
  return new Task({
    id: TaskId.create('test-id'),
    userId: 'test-user',
    title: TaskTitle.create('Test Task'),
    notes: null,
    status: 'active' as TaskStatus,
    requiredMood: null,
    estimatedDuration: null,
    personTag: null,
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
  });
}

// ============================================
// Tests
// ============================================

describe('Task Cap Enforcement Service', () => {
  describe('canAddActiveTask', () => {
    it('should return true when under limit', () => {
      const tasks = [
        createTask({ id: TaskId.create('1') }),
        createTask({ id: TaskId.create('2') }),
      ];

      expect(canAddActiveTask(tasks, 15)).toBe(true);
    });

    it('should return false when at limit', () => {
      const tasks = Array.from({ length: 15 }, (_, i) =>
        createTask({ id: TaskId.create(`task-${i}`) })
      );

      expect(canAddActiveTask(tasks, 15)).toBe(false);
    });

    it('should return false when over limit', () => {
      const tasks = Array.from({ length: 16 }, (_, i) =>
        createTask({ id: TaskId.create(`task-${i}`) })
      );

      expect(canAddActiveTask(tasks, 15)).toBe(false);
    });

    it('should use default limit when not specified', () => {
      const tasks = Array.from({ length: DEFAULT_ACTIVE_TASK_LIMIT }, (_, i) =>
        createTask({ id: TaskId.create(`task-${i}`) })
      );

      expect(canAddActiveTask(tasks)).toBe(false);
    });
  });

  describe('getCapResolutionCandidates', () => {
    it('should return tasks sorted by friction score (highest first)', () => {
      const tasks = [
        createTask({ id: TaskId.create('1'), frictionScore: 5 }),
        createTask({ id: TaskId.create('2'), frictionScore: 10 }),
        createTask({ id: TaskId.create('3'), frictionScore: 2 }),
      ];

      const result = getCapResolutionCandidates(tasks);

      expect(result).toHaveLength(3);
      expect(result[0].task.frictionScore).toBe(10);
      expect(result[1].task.frictionScore).toBe(5);
      expect(result[2].task.frictionScore).toBe(2);
    });

    it('should limit results to 3 by default', () => {
      const tasks = Array.from({ length: 10 }, (_, i) =>
        createTask({ id: TaskId.create(`task-${i}`), frictionScore: i })
      );

      const result = getCapResolutionCandidates(tasks);

      expect(result).toHaveLength(3);
      expect(result[0].task.frictionScore).toBe(9);
      expect(result[1].task.frictionScore).toBe(8);
      expect(result[2].task.frictionScore).toBe(7);
    });

    it('should mark high friction tasks appropriately', () => {
      const tasks = [
        createTask({ id: TaskId.create('1'), frictionScore: 5 }),
        createTask({ id: TaskId.create('2'), frictionScore: 0 }),
      ];

      const result = getCapResolutionCandidates(tasks);

      expect(result[0].reason).toBe('high_friction');
      expect(result[1].reason).toBe('oldest');
    });

    it('should sort by creation date when friction scores are equal', () => {
      const now = Date.now();
      const tasks = [
        createTask({
          id: TaskId.create('1'),
          frictionScore: 5,
          createdAt: now - 10000,
        }),
        createTask({
          id: TaskId.create('2'),
          frictionScore: 5,
          createdAt: now - 5000,
        }),
        createTask({
          id: TaskId.create('3'),
          frictionScore: 5,
          createdAt: now,
        }),
      ];

      const result = getCapResolutionCandidates(tasks);

      expect(result[0].task.id.toString()).toBe('1');
      expect(result[1].task.id.toString()).toBe('2');
      expect(result[2].task.id.toString()).toBe('3');
    });

    it('should return empty array when no tasks', () => {
      const result = getCapResolutionCandidates([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('checkTaskCap', () => {
    it('should return canAdd: true when under limit', () => {
      const tasks = [
        createTask({ id: TaskId.create('1') }),
        createTask({ id: TaskId.create('2') }),
      ];

      const result = checkTaskCap(tasks, 15);

      expect(result.canAdd).toBe(true);
      expect(result.needsResolution).toBe(false);
      expect(result.candidates).toBeUndefined();
    });

    it('should return canAdd: false with candidates when at limit', () => {
      const tasks = Array.from({ length: 15 }, (_, i) =>
        createTask({ id: TaskId.create(`task-${i}`), frictionScore: i })
      );

      const result = checkTaskCap(tasks, 15);

      expect(result.canAdd).toBe(false);
      expect(result.needsResolution).toBe(true);
      expect(result.candidates).toHaveLength(3);
    });

    it('should work with custom limit', () => {
      const tasks = Array.from({ length: 10 }, (_, i) =>
        createTask({ id: TaskId.create(`task-${i}`) })
      );

      const result = checkTaskCap(tasks, 10);

      expect(result.canAdd).toBe(false);
      expect(result.needsResolution).toBe(true);
    });
  });

  describe('getActiveTaskLimit', () => {
    it('should return default limit when no preferences', () => {
      expect(getActiveTaskLimit()).toBe(15);
    });

    it('should return custom limit from preferences', () => {
      expect(getActiveTaskLimit({ activeTaskLimit: 10 })).toBe(10);
      expect(getActiveTaskLimit({ activeTaskLimit: 20 })).toBe(20);
    });
  });

  describe('isValidTaskLimit', () => {
    it('should return true for valid limits', () => {
      expect(isValidTaskLimit(10)).toBe(true);
      expect(isValidTaskLimit(15)).toBe(true);
      expect(isValidTaskLimit(20)).toBe(true);
    });

    it('should return false for invalid limits', () => {
      expect(isValidTaskLimit(5)).toBe(false);
      expect(isValidTaskLimit(12)).toBe(false);
      expect(isValidTaskLimit(25)).toBe(false);
      expect(isValidTaskLimit(0)).toBe(false);
    });
  });
});
