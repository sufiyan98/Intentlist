/**
 * Subtask Service Tests
 */

import {
  createSubtask,
  getSubtaskById,
  getSubtasksForTask,
  updateSubtask,
  toggleSubtaskCompletion,
  deleteSubtask,
  deleteAllSubtasksForTask,
  reorderSubtasks,
  getSubtaskStats,
  clearAllSubtasks,
} from '@/services/task/subtask.service';

describe('Subtask Service', () => {
  const testTaskId = 'test-task-1';

  beforeEach(() => {
    clearAllSubtasks();
  });

  describe('createSubtask', () => {
    it('should create a subtask', async () => {
      const input = { title: 'Test Subtask' };
      const result = await createSubtask(testTaskId, input);

      expect(result.id).toBeDefined();
      expect(result.taskId).toBe(testTaskId);
      expect(result.title).toBe('Test Subtask');
      expect(result.isCompleted).toBe(false);
      expect(result.sortOrder).toBeGreaterThanOrEqual(0);
    });

    it('should trim subtask title', async () => {
      const input = { title: '  Test Subtask  ' };
      const result = await createSubtask(testTaskId, input);

      expect(result.title).toBe('Test Subtask');
    });

    it('should increment sort order', async () => {
      await createSubtask(testTaskId, { title: 'First' });
      await createSubtask(testTaskId, { title: 'Second' });
      const third = await createSubtask(testTaskId, { title: 'Third' });

      expect(third.sortOrder).toBeGreaterThanOrEqual(2);
    });

    it('should accept custom sort order', async () => {
      const input = { title: 'Test', sortOrder: 10 };
      const result = await createSubtask(testTaskId, input);

      expect(result.sortOrder).toBe(10);
    });

    it('should accept isCompleted flag', async () => {
      const input = { title: 'Test', isCompleted: true };
      const result = await createSubtask(testTaskId, input);

      expect(result.isCompleted).toBe(true);
    });
  });

  describe('getSubtaskById', () => {
    it('should return subtask by ID', async () => {
      const created = await createSubtask(testTaskId, { title: 'Test' });
      const retrieved = await getSubtaskById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe('Test');
    });

    it('should return null for non-existent ID', async () => {
      const result = await getSubtaskById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getSubtasksForTask', () => {
    it('should return empty array when no subtasks', async () => {
      const result = await getSubtasksForTask(testTaskId);

      expect(result).toHaveLength(0);
    });

    it('should return all subtasks for a task', async () => {
      await createSubtask(testTaskId, { title: 'First' });
      await createSubtask(testTaskId, { title: 'Second' });
      await createSubtask(testTaskId, { title: 'Third' });

      const result = await getSubtasksForTask(testTaskId);

      expect(result).toHaveLength(3);
      expect(result.map((s) => s.title)).toEqual(['First', 'Second', 'Third']);
    });

    it('should return subtasks sorted by sortOrder', async () => {
      await createSubtask(testTaskId, { title: 'Third', sortOrder: 2 });
      await createSubtask(testTaskId, { title: 'First', sortOrder: 0 });
      await createSubtask(testTaskId, { title: 'Second', sortOrder: 1 });

      const result = await getSubtasksForTask(testTaskId);

      expect(result.map((s) => s.title)).toEqual(['First', 'Second', 'Third']);
    });

    it('should only return subtasks for the specified task', async () => {
      const otherTaskId = 'other-task';
      await createSubtask(testTaskId, { title: 'Task 1 Subtask' });
      await createSubtask(otherTaskId, { title: 'Task 2 Subtask' });

      const result = await getSubtasksForTask(testTaskId);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Task 1 Subtask');
    });
  });

  describe('updateSubtask', () => {
    it('should update subtask title', async () => {
      const created = await createSubtask(testTaskId, { title: 'Original' });
      const updated = await updateSubtask(created.id, { title: 'Updated' });

      expect(updated?.title).toBe('Updated');
    });

    it('should trim updated title', async () => {
      const created = await createSubtask(testTaskId, { title: 'Original' });
      const updated = await updateSubtask(created.id, { title: '  Updated  ' });

      expect(updated?.title).toBe('Updated');
    });

    it('should update isCompleted', async () => {
      const created = await createSubtask(testTaskId, { title: 'Test' });
      const updated = await updateSubtask(created.id, { isCompleted: true });

      expect(updated?.isCompleted).toBe(true);
    });

    it('should return null for non-existent subtask', async () => {
      const result = await updateSubtask('non-existent', { title: 'Updated' });

      expect(result).toBeNull();
    });
  });

  describe('toggleSubtaskCompletion', () => {
    it('should toggle from false to true', async () => {
      const created = await createSubtask(testTaskId, { title: 'Test' });
      expect(created.isCompleted).toBe(false);

      const toggled = await toggleSubtaskCompletion(created.id);
      expect(toggled?.isCompleted).toBe(true);
    });

    it('should toggle from true to false', async () => {
      const created = await createSubtask(testTaskId, { title: 'Test', isCompleted: true });
      expect(created.isCompleted).toBe(true);

      const toggled = await toggleSubtaskCompletion(created.id);
      expect(toggled?.isCompleted).toBe(false);
    });

    it('should return null for non-existent subtask', async () => {
      const result = await toggleSubtaskCompletion('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('deleteSubtask', () => {
    it('should delete subtask', async () => {
      const created = await createSubtask(testTaskId, { title: 'Test' });
      const deleted = await deleteSubtask(created.id);

      expect(deleted).toBe(true);

      const retrieved = await getSubtaskById(created.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent subtask', async () => {
      const result = await deleteSubtask('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('deleteAllSubtasksForTask', () => {
    it('should delete all subtasks for a task', async () => {
      await createSubtask(testTaskId, { title: 'First' });
      await createSubtask(testTaskId, { title: 'Second' });
      await createSubtask('other-task', { title: 'Other' });

      await deleteAllSubtasksForTask(testTaskId);

      const task1Subtasks = await getSubtasksForTask(testTaskId);
      const otherSubtasks = await getSubtasksForTask('other-task');

      expect(task1Subtasks).toHaveLength(0);
      expect(otherSubtasks).toHaveLength(1);
    });
  });

  describe('reorderSubtasks', () => {
    it('should reorder subtasks', async () => {
      const first = await createSubtask(testTaskId, { title: 'First', sortOrder: 0 });
      const second = await createSubtask(testTaskId, { title: 'Second', sortOrder: 1 });
      const third = await createSubtask(testTaskId, { title: 'Third', sortOrder: 2 });

      const reordered = await reorderSubtasks(testTaskId, [third.id, first.id, second.id]);

      expect(reordered[0].sortOrder).toBe(0);
      expect(reordered[0].title).toBe('Third');
      expect(reordered[1].sortOrder).toBe(1);
      expect(reordered[1].title).toBe('First');
    });

    it('should ignore subtasks not belonging to the task', async () => {
      const subtask1 = await createSubtask(testTaskId, { title: 'Task 1' });
      const otherSubtask = await createSubtask('other-task', { title: 'Other' });

      const reordered = await reorderSubtasks(testTaskId, [otherSubtask.id, subtask1.id]);

      expect(reordered).toHaveLength(1);
      expect(reordered[0].title).toBe('Task 1');
    });
  });

  describe('getSubtaskStats', () => {
    it('should return zero stats when no subtasks', async () => {
      const stats = await getSubtaskStats(testTaskId);

      expect(stats).toEqual({
        total: 0,
        completed: 0,
        percentComplete: 0,
      });
    });

    it('should return correct stats', async () => {
      await createSubtask(testTaskId, { title: 'Done 1', isCompleted: true });
      await createSubtask(testTaskId, { title: 'Done 2', isCompleted: true });
      await createSubtask(testTaskId, { title: 'Pending' });

      const stats = await getSubtaskStats(testTaskId);

      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(2);
      expect(stats.percentComplete).toBe(67);
    });

    it('should return 100% when all completed', async () => {
      await createSubtask(testTaskId, { title: 'Done 1', isCompleted: true });
      await createSubtask(testTaskId, { title: 'Done 2', isCompleted: true });

      const stats = await getSubtaskStats(testTaskId);

      expect(stats.percentComplete).toBe(100);
    });
  });
});
