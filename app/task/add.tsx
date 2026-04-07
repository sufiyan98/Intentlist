/**
 * Add Task Screen
 * Phase 1: Create new task with validation
 */

import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

import { TaskForm } from '@/components/task-form';
import { useTaskStore } from '@/stores';
import { TaskFormData } from '@/hooks/use-task-form';
import { validateTaskInput } from '@/services/task/task-validation.service';

export default function AddTaskScreen() {
  const { addTask } = useTaskStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);

    try {
      // Validate input
      const validated = validateTaskInput({
        title: data.title,
        notes: data.notes || null,
        requiredMood: data.requiredMood,
        estimatedDuration: data.estimatedDuration,
        personTag: data.personTag || null,
      });

      if (!validated.success) {
        Alert.alert('Error', validated.errors?.[0] || 'Invalid data');
        setIsSubmitting(false);
        return;
      }

      // Check task cap
      const capResult = await addTask('demo-user', {
        title: data.title,
        notes: data.notes || null,
        requiredMood: data.requiredMood,
        estimatedDuration: data.estimatedDuration,
        personTag: data.personTag || null,
      });

      if (capResult) {
        router.back();
      } else {
        // Cap resolution needed - store will have candidates
        Alert.alert(
          'Task Cap Reached',
          "You're at your active task limit. Please complete or move some tasks to someday before adding a new one.",
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <TaskForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
      submitLabel="Create Task"
    />
  );
}
