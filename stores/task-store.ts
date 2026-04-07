/**
 * Task Store (Zustand)
 * Phase 1: Client-side state management for tasks
 */

import { create } from 'zustand';

import { Task, TaskInput, TaskUpdate, CapResolutionCandidate, Subtask } from '@/types';
import {
  createTask,
  getActiveTasks,
  updateTask as updateTaskService,
  completeTask,
  moveToSomeday,
  deleteTask,
  checkTaskCap,
} from '@/services/task';
import {
  createSubtask as createSubtaskService,
  getSubtasksForTask as getSubtasksForTaskService,
  updateSubtask as updateSubtaskService,
  toggleSubtaskCompletion as toggleSubtaskCompletionService,
  deleteSubtask as deleteSubtaskService,
} from '@/services/task/subtask.service';

// ============================================
// Store State
// ============================================

interface TaskState {
  // Data
  tasks: Task[];
  activeTasks: Task[];
  selectedTask: Task | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  capResolutionCandidates: CapResolutionCandidate[] | null;

  // Actions
  loadTasks: (userId: string) => Promise<void>;
  refreshTasks: (userId: string) => Promise<void>;
  addTask: (userId: string, input: TaskInput) => Promise<Task | null>;
  updateTask: (taskId: string, update: TaskUpdate) => Promise<Task | null>;
  completeTask: (taskId: string) => Promise<Task | null>;
  moveToSomeday: (taskId: string) => Promise<Task | null>;
  deleteTask: (taskId: string) => Promise<Task | null>;
  selectTask: (task: Task | null) => void;
  clearError: () => void;
  clearCapResolutionCandidates: () => void;

  // Subtask Actions
  addSubtask: (taskId: string, title: string) => Promise<Subtask | null>;
  getSubtasks: (taskId: string) => Promise<Subtask[]>;
  updateSubtask: (subtaskId: string, updates: Partial<Subtask>) => Promise<Subtask | null>;
  toggleSubtask: (subtaskId: string) => Promise<Subtask | null>;
  deleteSubtask: (subtaskId: string) => Promise<boolean>;
}

// ============================================
// Store Implementation
// ============================================

export const useTaskStore = create<TaskState>((set, get) => ({
  // Initial State
  tasks: [],
  activeTasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
  capResolutionCandidates: null,

  // Actions
  loadTasks: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const activeTasks = await getActiveTasks(userId);
      set({ activeTasks, tasks: activeTasks, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tasks';
      set({ error: errorMessage, isLoading: false });
    }
  },

  refreshTasks: async (userId: string) => {
    try {
      const activeTasks = await getActiveTasks(userId);
      set({ activeTasks, tasks: activeTasks });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh tasks';
      set({ error: errorMessage });
    }
  },

  addTask: async (userId: string, input: TaskInput) => {
    set({ isLoading: true, error: null });

    try {
      // Check cap before adding
      const capResult = await checkTaskCap(userId);

      if (!capResult.canAdd && capResult.candidates) {
        set({
          capResolutionCandidates: capResult.candidates,
          isLoading: false,
        });
        return null;
      }

      const task = await createTask(userId, input);

      // Update local state
      const activeTasks = [...get().activeTasks, task];
      set({
        activeTasks,
        tasks: activeTasks,
        isLoading: false,
      });

      return task;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add task';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateTask: async (taskId: string, update: TaskUpdate) => {
    set({ isLoading: true, error: null });

    try {
      const updatedTask = await updateTaskService(taskId, update);

      if (updatedTask) {
        // Update local state
        const activeTasks = get().activeTasks.map((t) => (t.id === taskId ? updatedTask : t));
        set({
          activeTasks,
          tasks: activeTasks,
          selectedTask: get().selectedTask?.id === taskId ? updatedTask : get().selectedTask,
          isLoading: false,
        });
        return updatedTask;
      }

      set({ isLoading: false });
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  completeTask: async (taskId: string) => {
    set({ isLoading: true, error: null });

    try {
      const completedTask = await completeTask(taskId);

      if (completedTask) {
        // Remove from active tasks
        const activeTasks = get().activeTasks.filter((t) => t.id !== taskId);
        set({
          activeTasks,
          selectedTask: get().selectedTask?.id === taskId ? null : get().selectedTask,
          isLoading: false,
        });
        return completedTask;
      }

      set({ isLoading: false });
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete task';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  moveToSomeday: async (taskId: string) => {
    set({ isLoading: true, error: null });

    try {
      const movedTask = await moveToSomeday(taskId);

      if (movedTask) {
        // Remove from active tasks
        const activeTasks = get().activeTasks.filter((t) => t.id !== taskId);
        set({
          activeTasks,
          selectedTask: get().selectedTask?.id === taskId ? null : get().selectedTask,
          isLoading: false,
        });
        return movedTask;
      }

      set({ isLoading: false });
      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to move task to someday';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  deleteTask: async (taskId: string) => {
    set({ isLoading: true, error: null });

    try {
      const deletedTask = await deleteTask(taskId);

      if (deletedTask) {
        // Remove from active tasks
        const activeTasks = get().activeTasks.filter((t) => t.id !== taskId);
        set({
          activeTasks,
          selectedTask: get().selectedTask?.id === taskId ? null : get().selectedTask,
          isLoading: false,
        });
        return deletedTask;
      }

      set({ isLoading: false });
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  selectTask: (task: Task | null) => {
    set({ selectedTask: task });
  },

  clearError: () => {
    set({ error: null });
  },

  clearCapResolutionCandidates: () => {
    set({ capResolutionCandidates: null });
  },

  // Subtask Actions
  addSubtask: async (taskId: string, title: string) => {
    try {
      const subtask = await createSubtaskService(taskId, { title });
      return subtask;
    } catch (error) {
      console.error('Failed to add subtask:', error);
      return null;
    }
  },

  getSubtasks: async (taskId: string) => {
    try {
      const subtasks = await getSubtasksForTaskService(taskId);
      return subtasks;
    } catch (error) {
      console.error('Failed to get subtasks:', error);
      return [];
    }
  },

  updateSubtask: async (subtaskId: string, updates: Partial<Subtask>) => {
    try {
      const subtask = await updateSubtaskService(subtaskId, updates);
      return subtask;
    } catch (error) {
      console.error('Failed to update subtask:', error);
      return null;
    }
  },

  toggleSubtask: async (subtaskId: string) => {
    try {
      const subtask = await toggleSubtaskCompletionService(subtaskId);
      return subtask;
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
      return null;
    }
  },

  deleteSubtask: async (subtaskId: string) => {
    try {
      const success = await deleteSubtaskService(subtaskId);
      return success;
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      return false;
    }
  },
}));

// ============================================
// Selectors (for performance optimization)
// ============================================

export const selectActiveTaskCount = (state: TaskState) => state.activeTasks.length;

export const selectTaskById = (taskId: string) => (state: TaskState) =>
  state.activeTasks.find((t) => t.id === taskId) ?? null;

export const selectHasCapResolutionCandidates = (state: TaskState) =>
  state.capResolutionCandidates !== null;
