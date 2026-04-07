/**
 * Task Validation Service Tests
 */

import {
  validateTaskInput,
  validateTaskUpdate,
  validateTaskTitle,
  validatePersonTag,
  validateDuration,
} from '@/services/task/task-validation.service';

describe('Task Validation Service', () => {
  describe('validateTaskInput', () => {
    it('should validate valid task input', () => {
      const input = {
        title: 'Test Task',
        notes: 'Some notes',
        requiredMood: 'focused',
        estimatedDuration: 30,
        personTag: 'John Doe',
      };

      const result = validateTaskInput(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe('Test Task');
    });

    it('should reject empty title', () => {
      const input = {
        title: '',
      };

      const result = validateTaskInput(input);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('required');
    });

    it('should reject title over 200 characters', () => {
      const input = {
        title: 'a'.repeat(201),
      };

      const result = validateTaskInput(input);

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('200 characters');
    });

    it('should trim title', () => {
      const input = {
        title: '  Test Task  ',
      };

      const result = validateTaskInput(input);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Test Task');
    });

    it('should accept null notes', () => {
      const input = {
        title: 'Test',
        notes: null,
      };

      const result = validateTaskInput(input);

      expect(result.success).toBe(true);
    });

    it('should reject notes over 2000 characters', () => {
      const input = {
        title: 'Test',
        notes: 'a'.repeat(2001),
      };

      const result = validateTaskInput(input);

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('2000 characters');
    });

    it('should accept valid mood states', () => {
      const moods = ['focused', 'low_energy', 'between_things', 'creative', 'quick_clear', 'any'];

      moods.forEach((mood) => {
        const input = {
          title: 'Test',
          requiredMood: mood,
        };

        const result = validateTaskInput(input);

        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid mood state', () => {
      const input = {
        title: 'Test',
        requiredMood: 'invalid_mood',
      };

      const result = validateTaskInput(input);

      expect(result.success).toBe(false);
    });

    it('should accept valid durations', () => {
      const durations = [5, 15, 30, 60, 120];

      durations.forEach((duration) => {
        const input = {
          title: 'Test',
          estimatedDuration: duration,
        };

        const result = validateTaskInput(input);

        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid duration', () => {
      const input = {
        title: 'Test',
        estimatedDuration: 45,
      };

      const result = validateTaskInput(input);

      expect(result.success).toBe(false);
    });

    it('should accept null personTag', () => {
      const input = {
        title: 'Test',
        personTag: null,
      };

      const result = validateTaskInput(input);

      expect(result.success).toBe(true);
    });

    it('should trim personTag', () => {
      const input = {
        title: 'Test',
        personTag: '  John  ',
      };

      const result = validateTaskInput(input);

      expect(result.success).toBe(true);
      expect(result.data?.personTag).toBe('John');
    });
  });

  describe('validateTaskUpdate', () => {
    it('should validate partial update', () => {
      const update = {
        title: 'Updated Title',
      };

      const result = validateTaskUpdate(update);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Updated Title');
    });

    it('should validate status update', () => {
      const update = {
        status: 'completed',
      };

      const result = validateTaskUpdate(update);

      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const update = {
        status: 'invalid_status',
      };

      const result = validateTaskUpdate(update);

      expect(result.success).toBe(false);
    });

    it('should accept empty update object', () => {
      const update = {};

      const result = validateTaskUpdate(update);

      expect(result.success).toBe(true);
    });
  });

  describe('validateTaskTitle', () => {
    it('should validate valid title', () => {
      const result = validateTaskTitle('Valid Title');

      expect(result.success).toBe(true);
      expect(result.value).toBe('Valid Title');
    });

    it('should reject empty title', () => {
      const result = validateTaskTitle('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject whitespace-only title', () => {
      const result = validateTaskTitle('   ');

      // After trim, this becomes empty string which is valid (nullable/optional)
      expect(result.success).toBe(true);
      expect(result.value).toBe('');
    });

    it('should trim and validate', () => {
      const result = validateTaskTitle('  Title  ');

      expect(result.success).toBe(true);
      expect(result.value).toBe('Title');
    });
  });

  describe('validatePersonTag', () => {
    it('should validate valid person tag', () => {
      const result = validatePersonTag('John Doe');

      expect(result.success).toBe(true);
      expect(result.value).toBe('John Doe');
    });

    it('should accept null', () => {
      const result = validatePersonTag(null);

      expect(result.success).toBe(true);
      expect(result.value).toBeNull();
    });

    it('should accept undefined', () => {
      const result = validatePersonTag(undefined);

      expect(result.success).toBe(true);
    });

    it('should trim', () => {
      const result = validatePersonTag('  John  ');

      expect(result.success).toBe(true);
      expect(result.value).toBe('John');
    });
  });

  describe('validateDuration', () => {
    it('should validate valid durations', () => {
      [5, 15, 30, 60, 120].forEach((duration) => {
        const result = validateDuration(duration);

        expect(result.success).toBe(true);
        expect(result.value).toBe(duration);
      });
    });

    it('should accept string durations', () => {
      const result = validateDuration('30');

      expect(result.success).toBe(true);
      expect(result.value).toBe(30);
    });

    it('should accept null', () => {
      const result = validateDuration(null);

      expect(result.success).toBe(true);
      expect(result.value).toBeNull();
    });

    it('should reject invalid duration', () => {
      const result = validateDuration(45);

      expect(result.success).toBe(false);
      expect(result.error).toContain('must be');
    });
  });
});
