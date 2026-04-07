/**
 * Task Detail Screen
 * Phase 1: View and manage task details, notes, and subtasks
 * Mobile-optimized: safe area, proper bottom padding, responsive layout
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SubtaskList } from '@/components/subtask-list';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTaskStore } from '@/stores';
import { Task, Subtask, SubtaskInput } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  createSubtask,
  getSubtasksForTask,
  toggleSubtaskCompletion,
  deleteSubtask,
} from '@/services/task/subtask.service';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const { activeTasks, completeTask, moveToSomeday, deleteTask, loadTasks } =
    useTaskStore();

  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);

  // Load task details
  useEffect(() => {
    const loadTaskDetails = async () => {
      if (!id) {
        router.back();
        return;
      }

      try {
        // Load tasks to ensure we have the latest data
        await loadTasks('demo-user');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setIsLoading(false);
      }
    };

    loadTaskDetails();
  }, [id, loadTasks]);

  // Find task from activeTasks when loaded
  useEffect(() => {
    if (!isLoading && id && activeTasks.length > 0) {
      const foundTask = activeTasks.find((t) => String(t.id) === String(id));
      setTask(foundTask || null);
    }
  }, [id, activeTasks, isLoading]);

  // Load subtasks
  useEffect(() => {
    const loadSubtasks = async () => {
      if (id) {
        try {
          const taskSubtasks = await getSubtasksForTask(id);
          setSubtasks(taskSubtasks);
        } catch (error) {
          console.error('Failed to load subtasks:', error);
        }
      }
    };

    loadSubtasks();
  }, [id]);

  // Handle subtask actions
  const handleAddSubtask = useCallback(
    async (title: string) => {
      if (!id) return;

      try {
        const input: SubtaskInput = { title };
        const newSubtask = await createSubtask(id, input);
        setSubtasks((prev) => [...prev, newSubtask]);
      } catch (error) {
        console.error('Failed to add subtask:', error);
      }
    },
    [id]
  );

  const handleToggleSubtask = useCallback(async (subtaskId: string) => {
    try {
      const updated = await toggleSubtaskCompletion(subtaskId);
      if (updated) {
        // Refresh the entire list to ensure consistency
        const taskSubtasks = await getSubtasksForTask(id!);
        setSubtasks(taskSubtasks);
      }
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
    }
  }, [id]);

  const handleDeleteSubtask = useCallback(
    async (subtaskId: string) => {
      try {
        const success = await deleteSubtask(subtaskId);
        if (success) {
          // Refresh the entire list to ensure consistency
          const taskSubtasks = await getSubtasksForTask(id!);
          setSubtasks(taskSubtasks);
        }
      } catch (error) {
        console.error('Failed to delete subtask:', error);
      }
    },
    [id]
  );

  // Handle task actions
  const handleCompleteTask = useCallback(async () => {
    if (!task) return;

    Alert.alert(
      'Complete Task',
      `Mark "${task.title}" as done?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await completeTask(task.id);
            router.back();
          },
        },
      ]
    );
  }, [task, completeTask]);

  const handleMoveToSomeday = useCallback(async () => {
    if (!task || !task.id) {
      console.error('No task or task ID available');
      Alert.alert('Error', 'Cannot move task: task not loaded');
      return;
    }
    
    Alert.alert(
      'Move to Someday',
      `Move "${task.title}" to your someday list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move',
          style: 'default',
          onPress: async () => {
            try {
              await moveToSomeday(task.id);
              router.back();
            } catch (error) {
              console.error('Failed to move task:', error);
              Alert.alert('Error', 'Failed to move task to someday');
            }
          },
        },
      ]
    );
  }, [task, moveToSomeday]);

  const handleDeleteTask = useCallback(async () => {
    if (!task || !task.id) {
      console.error('No task or task ID available for deletion');
      Alert.alert('Error', 'Cannot delete task: task not loaded');
      return;
    }

    Alert.alert(
      'Delete Task',
      `Delete "${task.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id);
              router.back();
            } catch (error) {
              console.error('Failed to delete task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  }, [task, deleteTask]);

  const handleEditTask = useCallback(() => {
    if (!task) return;
    router.push({
      pathname: '/task/edit/[id]',
      params: { id: task.id },
    } as any);
  }, [task]);

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!task) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText type="subtitle">Task not found</ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.actionButton, { backgroundColor: colors.tint, marginTop: 16 }]}
        >
          <ThemedText style={[styles.actionButtonText, { color: colors.background }]}>
            Go Back
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {task.title}
          </ThemedText>

          {/* Mood Badge */}
          {task.requiredMood && (
            <View style={[styles.moodBadge, { backgroundColor: colors.background }]}>
              <ThemedText type="small">{getMoodLabel(task.requiredMood)}</ThemedText>
            </View>
          )}
        </View>

        {/* Metadata */}
        <View style={styles.metadata}>
          {task.estimatedDuration && (
            <View style={styles.metadataItem}>
              <IconSymbol name="clock" size={16} color={colors.icon} />
              <ThemedText type="small" style={styles.metadataText}>
                {task.estimatedDuration} min
              </ThemedText>
            </View>
          )}

          {task.personTag && (
            <View style={styles.metadataItem}>
              <IconSymbol name="person" size={16} color={colors.icon} />
              <ThemedText type="small" style={styles.metadataText}>
                {task.personTag}
              </ThemedText>
            </View>
          )}

          {totalCount > 0 && (
            <View style={styles.metadataItem}>
              <IconSymbol name="list.bullet" size={16} color={colors.icon} />
              <ThemedText type="small" style={styles.metadataText}>
                {completedCount}/{totalCount} subtasks ({progressPercent}%)
              </ThemedText>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: colors.tint,
                },
              ]}
            />
          </View>
        )}

        {/* Notes Section */}
        {task.notes && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Notes
            </ThemedText>
            <View style={[styles.notesContainer, { backgroundColor: colors.background }]}>
              <ThemedText style={styles.notesText}>{task.notes}</ThemedText>
            </View>
          </View>
        )}

        {/* Subtasks Section */}
        <SubtaskList
          subtasks={subtasks}
          onAddSubtask={handleAddSubtask}
          onToggleSubtask={handleToggleSubtask}
          onDeleteSubtask={handleDeleteSubtask}
        />

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleEditTask}
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
            accessibilityLabel="Edit task"
            accessibilityRole="button"
          >
            <IconSymbol name="pencil" size={20} color={colors.background} />
            <ThemedText style={[styles.actionButtonText, { color: colors.background }]}>
              Edit
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCompleteTask}
            style={[styles.actionButton, { backgroundColor: '#28a745' }]}
            accessibilityLabel="Complete task"
            accessibilityRole="button"
          >
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.background} />
            <ThemedText style={[styles.actionButtonText, { color: colors.background }]}>
              Done
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            onPress={handleMoveToSomeday}
            style={[styles.secondaryActionButton]}
            accessibilityLabel="Move to someday"
            accessibilityRole="button"
          >
            <ThemedText type="small">Move to Someday</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteTask}
            style={[styles.secondaryActionButton]}
            accessibilityLabel="Delete task"
            accessibilityRole="button"
          >
            <ThemedText type="small" style={styles.deleteActionText}>
              Delete
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// Helper function
function getMoodLabel(mood: string): string {
  const labels: Record<string, string> = {
    focused: '🔥 Focused',
    low_energy: '🪫 Low Energy',
    between_things: '⚡ Between Things',
    creative: '🎨 Creative',
    quick_clear: '✅ Quick Clear',
    any: 'Any Mood',
  };
  return labels[mood] || mood;
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
  },
  moodBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    opacity: 0.8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  notesContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.1)',
  },
  secondaryActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  deleteActionText: {
    color: '#dc3545',
  },
});
