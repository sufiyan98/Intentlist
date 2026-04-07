/**
 * Edit Task Screen
 * Phase 1: Edit existing task details
 */

import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { TaskForm } from '@/components/task-form';
import { useTaskStore } from '@/stores';
import { Task } from '@/types';
import { TaskFormData } from '@/hooks/use-task-form';
import { validateTaskInput } from '@/services/task/task-validation.service';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeTasks, updateTask, loadTasks } = useTaskStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [task, setTask] = useState<Task | null>(null);

  // Load task
  useEffect(() => {
    const loadTask = async () => {
      if (!id) {
        router.back();
        return;
      }

      try {
        await loadTasks('demo-user');
        // Small delay to ensure state is updated
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      } catch (error) {
        console.error('Failed to load task:', error);
        setIsLoading(false);
      }
    };

    loadTask();
  }, [id, loadTasks]);

  // Find task from activeTasks when loaded
  useEffect(() => {
    if (!isLoading && id && activeTasks && activeTasks.length > 0) {
      const foundTask = activeTasks.find((t) => {
        // Compare as strings to handle any type differences
        const taskId = typeof t.id === 'object' ? String(t.id) : String(t.id);
        const searchId = String(id);
        return taskId === searchId;
      });
      if (foundTask) {
        setTask(foundTask);
      } else {
        console.error('Edit screen: Task not found. Available IDs:', activeTasks.map(t => String(t.id)));
      }
    }
  }, [id, activeTasks, isLoading]);

  const handleSubmit = async (data: TaskFormData) => {
    if (!task) return;

    setIsSubmitting(true);

    try {
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

      const result = await updateTask(task.id, {
        title: data.title,
        notes: data.notes || null,
        requiredMood: data.requiredMood,
        estimatedDuration: data.estimatedDuration,
        personTag: data.personTag || null,
      });

      if (result) {
        router.back();
      } else {
        Alert.alert('Error', 'Failed to update task');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <TaskForm
        onSubmit={() => {}}
        onCancel={handleCancel}
        isSubmitting={true}
        submitLabel="Loading..."
      />
    );
  }

  if (!task) {
    return (
      <TaskForm
        onSubmit={() => {}}
        onCancel={handleCancel}
        submitLabel="Task not found"
      />
    );
  }

  return (
    <TaskForm
      initialTask={task}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
      submitLabel="Save Changes"
    />
  );
}
