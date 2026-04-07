/**
 * useTaskForm Hook
 * Phase 1: Form state management for task create/edit
 */

import { useCallback, useState } from 'react';

import { Task, TaskInput, MoodState, DurationEstimate } from '@/types';
import { validateTaskInput, validateTaskUpdate, validateTaskTitle } from '@/services/task/task-validation.service';

// ============================================
// Types
// ============================================

export interface TaskFormData {
  title: string;
  notes: string;
  requiredMood: MoodState | null;
  estimatedDuration: DurationEstimate | null;
  personTag: string;
}

export interface TaskFormErrors {
  title?: string;
  notes?: string;
  personTag?: string;
}

export interface UseTaskFormResult {
  // Form data
  formData: TaskFormData;
  
  // Errors
  errors: TaskFormErrors;
  hasErrors: boolean;
  
  // Loading state
  isSaving: boolean;
  
  // Actions
  updateField: <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => void;
  setTitle: (title: string) => void;
  setNotes: (notes: string) => void;
  setMood: (mood: MoodState | null) => void;
  setDuration: (duration: DurationEstimate | null) => void;
  setPersonTag: (tag: string) => void;
  clearErrors: () => void;
  validateForm: () => boolean;
  resetForm: () => void;
  loadTask: (task: Task) => void;
}

// ============================================
// Default Values
// ============================================

const DEFAULT_FORM_DATA: TaskFormData = {
  title: '',
  notes: '',
  requiredMood: null,
  estimatedDuration: null,
  personTag: '',
};

const DEFAULT_ERRORS: TaskFormErrors = {};

// ============================================
// Hook Implementation
// ============================================

export function useTaskForm(initialData?: Partial<TaskFormData>): UseTaskFormResult {
  const [formData, setFormData] = useState<TaskFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  });
  
  const [errors, setErrors] = useState<TaskFormErrors>(DEFAULT_ERRORS);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Update a single field
   */
  const updateField = useCallback(<K extends keyof TaskFormData>(
    field: K,
    value: TaskFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts editing
    if (errors[field as keyof TaskFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  /**
   * Set title with validation
   */
  const setTitle = useCallback((title: string) => {
    setFormData((prev) => ({ ...prev, title }));
    
    // Validate on change
    if (title.trim().length > 0 || formData.title.length > 0) {
      const result = validateTaskTitle(title);
      if (!result.success && title.length > 0) {
        setErrors((prev) => ({ ...prev, title: result.error }));
      } else {
        setErrors((prev) => ({ ...prev, title: undefined }));
      }
    }
  }, [formData.title]);

  /**
   * Set notes
   */
  const setNotes = useCallback((notes: string) => {
    setFormData((prev) => ({ ...prev, notes }));
  }, []);

  /**
   * Set mood
   */
  const setMood = useCallback((mood: MoodState | null) => {
    setFormData((prev) => ({ ...prev, requiredMood: mood }));
  }, []);

  /**
   * Set duration
   */
  const setDuration = useCallback((duration: DurationEstimate | null) => {
    setFormData((prev) => ({ ...prev, estimatedDuration: duration }));
  }, []);

  /**
   * Set person tag
   */
  const setPersonTag = useCallback((tag: string) => {
    setFormData((prev) => ({ ...prev, personTag: tag }));
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors(DEFAULT_ERRORS);
  }, []);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(() => {
    const dataToValidate: TaskInput = {
      title: formData.title,
      notes: formData.notes || null,
      requiredMood: formData.requiredMood,
      estimatedDuration: formData.estimatedDuration,
      personTag: formData.personTag || null,
    };

    const result = validateTaskInput(dataToValidate);

    if (!result.success && result.errors) {
      const newErrors: TaskFormErrors = {};
      
      result.errors.forEach((error) => {
        if (error.includes('title')) {
          newErrors.title = error;
        } else if (error.includes('notes')) {
          newErrors.notes = error;
        } else if (error.includes('Person')) {
          newErrors.personTag = error;
        }
      });

      setErrors(newErrors);
      return false;
    }

    setErrors(DEFAULT_ERRORS);
    return true;
  }, [formData]);

  /**
   * Reset form to defaults
   */
  const resetForm = useCallback(() => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      ...initialData,
    });
    setErrors(DEFAULT_ERRORS);
  }, [initialData]);

  /**
   * Load task data into form (for edit mode)
   */
  const loadTask = useCallback((task: Task) => {
    setFormData({
      title: task.title,
      notes: task.notes ?? '',
      requiredMood: task.requiredMood,
      estimatedDuration: task.estimatedDuration,
      personTag: task.personTag ?? '',
    });
    setErrors(DEFAULT_ERRORS);
  }, []);

  return {
    formData,
    errors,
    hasErrors: Object.values(errors).some((e) => e !== undefined),
    isSaving,
    updateField,
    setTitle,
    setNotes,
    setMood,
    setDuration,
    setPersonTag,
    clearErrors,
    validateForm,
    resetForm,
    loadTask,
  };
}
