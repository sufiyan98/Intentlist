import React, { useEffect, useCallback, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MoodSelector } from '@/components/mood-selector';
import { TaskCard } from '@/components/task-card';
import { FrictionInterventionModal } from '@/components/friction-intervention-modal';
import { useTaskStore, useMoodStore } from '@/stores';
import { getTasksForMood, needsMoodRefresh } from '@/services/mood/mood-matching.service';
import { getTasksNeedingIntervention, InterventionSuggestion } from '@/services/friction/friction-intervention.service';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Task, MoodState } from '@/types';

/**
 * Home Screen - Phase 1
 * Displays mood selector and focused task view
 */

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const { currentMood, setCurrentMood, lastMoodChange } = useMoodStore();
  const { activeTasks, loadTasks, completeTask, selectTask, updateTask, moveToSomeday, deleteTask, isLoading, error } = useTaskStore();

  // Friction intervention state
  const [interventionTask, setInterventionTask] = useState<Task | null>(null);
  const [showIntervention, setShowIntervention] = useState(false);

  // Load tasks on mount
  useEffect(() => {
    loadTasks('demo-user');
  }, [loadTasks]);

  // Check for tasks needing intervention after loading
  useEffect(() => {
    if (activeTasks.length > 0) {
      const interventionTasks = getTasksNeedingIntervention(activeTasks);
      if (interventionTasks.length > 0) {
        // Show intervention for the highest friction task
        setInterventionTask(interventionTasks[0]);
        setShowIntervention(true);
      }
    }
  }, [activeTasks]);

  // Check if mood needs refresh
  const shouldShowMoodSelector = !currentMood || needsMoodRefresh(lastMoodChange);

  // Get mood-matched tasks
  const focusedTasks = currentMood
    ? getTasksForMood(activeTasks, currentMood)
    : activeTasks.slice(0, 6);

  // Handle mood selection
  const handleMoodSelect = useCallback(
    async (mood: MoodState) => {
      await setCurrentMood(mood);
    },
    [setCurrentMood]
  );

  // Handle task completion
  const handleCompleteTask = useCallback(
    async (taskId: string) => {
      await completeTask(taskId);
    },
    [completeTask]
  );

  // Handle friction intervention suggestion
  const handleInterventionSuggestion = useCallback(
    async (suggestion: InterventionSuggestion) => {
      if (!interventionTask) return;

      try {
        switch (suggestion.action) {
          case 'break_down':
            // Navigate to task detail to add subtasks
            selectTask(interventionTask);
            router.push({
              pathname: '/task/[id]',
              params: { id: interventionTask.id },
            } as any);
            break;
          case 'snooze':
            // Move to someday
            await moveToSomeday(interventionTask.id);
            break;
          case 'delegate':
            // Keep active but reset friction
            await updateTask(interventionTask.id, { frictionScore: 0 });
            break;
          case 'delete':
            await deleteTask(interventionTask.id);
            break;
          case 'reframe':
            // Navigate to task edit
            router.push({
              pathname: '/task/edit/[id]',
              params: { id: interventionTask.id },
            } as any);
            break;
        }
      } catch (error) {
        console.error('Failed to process intervention:', error);
      } finally {
        setShowIntervention(false);
        setInterventionTask(null);
      }
    },
    [interventionTask, selectTask, moveToSomeday, updateTask, deleteTask]
  );

  // Handle intervention dismiss
  const handleInterventionDismiss = useCallback(() => {
    setShowIntervention(false);
    setInterventionTask(null);
  }, []);

  // Render task card
  const renderTaskCard = useCallback(
    ({ item: task }: { item: ReturnType<typeof getTasksForMood>[number] }) => (
      <TaskCard
        task={task}
        onPress={() => {
          selectTask(task);
          router.push({
            pathname: '/task/[id]',
            params: { id: task.id },
          } as any);
        }}
        onComplete={() => handleCompleteTask(task.id)}
        showActions
      />
    ),
    [selectTask, handleCompleteTask]
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Mood Section */}
      <MoodSelector
        selectedMood={currentMood}
        onMoodSelect={handleMoodSelect}
        showFullSelector={shouldShowMoodSelector}
      />

      {/* Task Section */}
      <View style={styles.taskSection}>
        <View style={styles.taskHeader}>
          <ThemedText type="subtitle">Focused Tasks</ThemedText>
          <ThemedText type="small" style={styles.taskCount}>
            {focusedTasks.length} of {activeTasks.length} active
          </ThemedText>
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText type="small" style={styles.emptyStateHint}>
              Loading tasks...
            </ThemedText>
          </View>
        ) : error ? (
          /* Error State */
          <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
            <ThemedText type="defaultSemiBold">Error loading tasks</ThemedText>
            <ThemedText type="small" style={styles.emptyStateHint}>
              {error}
            </ThemedText>
          </View>
        ) : focusedTasks.length === 0 ? (
          /* Empty State */
          <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
            <ThemedText type="defaultSemiBold">No tasks match your mood</ThemedText>
            <ThemedText type="small" style={styles.emptyStateHint}>
              Try selecting a different mood or add new tasks
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={focusedTasks}
            renderItem={renderTaskCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.taskList}
          />
        )}
      </View>

      {/* Quick Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/task/add' as any)}
        accessibilityLabel="Add new task"
        accessibilityRole="button"
      >
        <ThemedText style={styles.addButtonText}>+</ThemedText>
      </TouchableOpacity>

      {/* Friction Intervention Modal */}
      <FrictionInterventionModal
        visible={showIntervention}
        task={interventionTask}
        onSuggestionSelect={handleInterventionSuggestion}
        onDismiss={handleInterventionDismiss}
      />
    </ThemedView>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  taskSection: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskCount: {
    opacity: 0.7,
  },
  taskList: {
    gap: 10,
  },
  emptyState: {
    padding: 28,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateHint: {
    opacity: 0.7,
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
