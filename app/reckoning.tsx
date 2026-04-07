/**
 * Sunday Reckoning Screen
 * Weekly review workflow: review stale tasks, make decisions, clear mental clutter
 * Mobile-optimized: safe area, proper touch targets (44dp min), press feedback
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTaskStore } from '@/stores';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  identifyReckoningTasks,
  startReckoningSession,
  processTaskDecision,
  endReckoningSession,
  getDecisionOptions,
  ReckoningTask,
} from '@/services/reckoning';
import { ReckoningDecision } from '@/types';

export default function ReckoningScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { activeTasks, updateTask, completeTask, moveToSomeday, deleteTask, loadTasks } =
    useTaskStore();

  const [reckoningTasks, setReckoningTasks] = useState<ReckoningTask[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState({
    reviewed: 0,
    committed: 0,
    deferred: 0,
    deleted: 0,
  });

  useEffect(() => {
    loadTasks('demo-user').then(() => {
      setIsLoading(false);
    });
  }, [loadTasks]);

  useEffect(() => {
    if (!isLoading && activeTasks.length > 0) {
      const tasks = identifyReckoningTasks(activeTasks);
      setReckoningTasks(tasks);
    }
  }, [activeTasks, isLoading]);

  const handleStartSession = useCallback(() => {
    startReckoningSession('demo-user');
    setSessionStarted(true);
    setCurrentIndex(0);
  }, []);

  const handleDecision = useCallback(
    async (decision: ReckoningDecision) => {
      const task = reckoningTasks[currentIndex];
      if (!task) return;

      try {
        const newProgress = processTaskDecision(decision);
        setProgress(newProgress);

        switch (decision) {
          case 'do_this_week':
            await updateTask(task.id, {
              frictionScore: 0,
              timesSnoozed: 0,
              timesScrolledPast: 0,
            });
            break;
          case 'schedule_time':
            await updateTask(task.id, {
              frictionScore: 0,
              timesSnoozed: 0,
              timesScrolledPast: 0,
            });
            break;
          case 'waiting_on_someone':
            await moveToSomeday(task.id);
            break;
          case 'not_important':
            await deleteTask(task.id);
            break;
          case 'already_done':
            await completeTask(task.id);
            break;
        }

        if (currentIndex < reckoningTasks.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          endReckoningSession();
          setSessionComplete(true);
        }
      } catch (error) {
        console.error('Failed to process decision:', error);
        Alert.alert('Error', 'Failed to process your decision. Please try again.');
      }
    },
    [reckoningTasks, currentIndex, updateTask, moveToSomeday, deleteTask, completeTask]
  );

  const handleFinishSession = useCallback(() => {
    router.back();
  }, []);

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading tasks...</ThemedText>
      </ThemedView>
    );
  }

  if (!sessionStarted && reckoningTasks.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText type="title">Sunday Reckoning</ThemedText>
            <ThemedText type="small" style={styles.headerSubtitle}>
              Weekly review to clear mental clutter
            </ThemedText>
          </View>

          <View style={[styles.emptyCard, { backgroundColor: colors.background }]}>
            <IconSymbol name="checkmark.seal" size={56} color={colors.tint} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              All clear!
            </ThemedText>
            <ThemedText type="small" style={styles.emptySubtitle}>
              No tasks need review right now. Your active tasks are in good shape.
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  if (sessionComplete) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText type="title">Session Complete</ThemedText>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.background }]}>
            <IconSymbol name="checkmark.seal" size={56} color="#28a745" />
            <ThemedText type="subtitle" style={styles.summaryTitle}>
              Nice. You're ready for the week.
            </ThemedText>

            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <ThemedText type="largeTitle" style={styles.summaryCount}>
                  {progress.reviewed}
                </ThemedText>
                <ThemedText type="small">Reviewed</ThemedText>
              </View>
              <View style={styles.summaryStat}>
                <ThemedText type="largeTitle" style={[styles.summaryCount, { color: '#28a745' }]}>
                  {progress.committed}
                </ThemedText>
                <ThemedText type="small">Committed</ThemedText>
              </View>
              <View style={styles.summaryStat}>
                <ThemedText type="largeTitle" style={[styles.summaryCount, { color: '#ffc107' }]}>
                  {progress.deferred}
                </ThemedText>
                <ThemedText type="small">Deferred</ThemedText>
              </View>
              <View style={styles.summaryStat}>
                <ThemedText type="largeTitle" style={[styles.summaryCount, { color: '#dc3545' }]}>
                  {progress.deleted}
                </ThemedText>
                <ThemedText type="small">Cleared</ThemedText>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleFinishSession}
            style={[styles.finishButton, { backgroundColor: colors.tint }]}
            accessibilityLabel="Finish"
            accessibilityRole="button"
          >
            <ThemedText style={[styles.finishButtonText, { color: colors.background }]}>
              Done
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  }

  if (!sessionStarted) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText type="title">Sunday Reckoning</ThemedText>
            <ThemedText type="small" style={styles.headerSubtitle}>
              Weekly review to clear mental clutter
            </ThemedText>
          </View>

          <View style={[styles.introCard, { backgroundColor: colors.background }]}>
            <IconSymbol name="calendar.badge.clock" size={44} color={colors.tint} />
            <ThemedText type="subtitle" style={styles.introTitle}>
              Time for your weekly review
            </ThemedText>
            <ThemedText type="small" style={styles.introText}>
              You have {reckoningTasks.length} task{reckoningTasks.length !== 1 ? 's' : ''} that
              need attention. We'll go through each one and help you decide what to do.
            </ThemedText>

            <View style={styles.criteriaList}>
              <View style={styles.criteriaItem}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={colors.tint} />
                <ThemedText type="small">Tasks snoozed 2+ times</ThemedText>
              </View>
              <View style={styles.criteriaItem}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={colors.tint} />
                <ThemedText type="small">Tasks scrolled past repeatedly</ThemedText>
              </View>
              <View style={styles.criteriaItem}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={colors.tint} />
                <ThemedText type="small">Tasks untouched for 7+ days</ThemedText>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleStartSession}
            style={[styles.startButton, { backgroundColor: colors.tint }]}
            accessibilityLabel="Start review"
            accessibilityRole="button"
          >
            <ThemedText style={[styles.startButtonText, { color: colors.background }]}>
              Start Review ({reckoningTasks.length} tasks)
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  }

  const currentTask = reckoningTasks[currentIndex];
  const decisionOptions = currentTask ? getDecisionOptions(currentTask) : [];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <ThemedText type="defaultSemiBold">
              Task {currentIndex + 1} of {reckoningTasks.length}
            </ThemedText>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${((currentIndex + 1) / reckoningTasks.length) * 100}%`,
                    backgroundColor: colors.tint,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Task Card */}
        {currentTask && (
          <View style={[styles.taskCard, { backgroundColor: colors.background }]}>
            <ThemedText type="subtitle" style={styles.taskTitle}>
              {currentTask.title}
            </ThemedText>

            {currentTask.notes && (
              <ThemedText type="small" style={styles.taskNotes} numberOfLines={2}>
                {currentTask.notes}
              </ThemedText>
            )}

            <View style={styles.taskMetadata}>
              {currentTask.estimatedDuration && (
                <View style={styles.metadataItem}>
                  <IconSymbol name="clock" size={14} color={colors.icon} />
                  <ThemedText type="small">{currentTask.estimatedDuration} min</ThemedText>
                </View>
              )}
              {currentTask.personTag && (
                <View style={styles.metadataItem}>
                  <IconSymbol name="person" size={14} color={colors.icon} />
                  <ThemedText type="small">{currentTask.personTag}</ThemedText>
                </View>
              )}
            </View>

            <View style={styles.reasonBadge}>
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#ffc107" />
              <ThemedText type="small" style={styles.reasonText}>
                {currentTask.reckoningReason}
              </ThemedText>
            </View>

            {currentTask.frictionScore > 0 && (
              <View style={styles.frictionRow}>
                <ThemedText type="small">Friction score:</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.frictionValue}>
                  {currentTask.frictionScore}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Decision Options */}
        <View style={styles.decisionSection}>
          <ThemedText type="defaultSemiBold" style={styles.decisionTitle}>
            What should we do with this?
          </ThemedText>
          <View style={styles.decisionOptions}>
            {decisionOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => handleDecision(option.value)}
                style={({ pressed }) => [
                  styles.decisionOption,
                  {
                    backgroundColor: colors.background,
                    opacity: pressed ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
                accessibilityLabel={option.label}
                accessibilityRole="button"
              >
                <View style={styles.optionContent}>
                  <IconSymbol name={option.icon as any} size={22} color={colors.tint} />
                  <View style={styles.optionText}>
                    <ThemedText type="defaultSemiBold">{option.label}</ThemedText>
                    <ThemedText type="small" style={styles.optionDescription}>
                      {option.description}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
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
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerSubtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  emptyCard: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 14,
  },
  emptySubtitle: {
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
  introCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  introTitle: {
    marginTop: 14,
    textAlign: 'center',
  },
  introText: {
    opacity: 0.7,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  criteriaList: {
    marginTop: 20,
    width: '100%',
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    minHeight: 44,
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  startButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  summaryCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryTitle: {
    marginTop: 14,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 20,
    justifyContent: 'center',
  },
  summaryStat: {
    alignItems: 'center',
    minWidth: 75,
  },
  summaryCount: {
    fontWeight: '700',
    fontSize: 36,
  },
  finishButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 52,
  },
  finishButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  progressHeader: {
    marginBottom: 14,
  },
  progressInfo: {
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  taskCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  taskTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  taskNotes: {
    opacity: 0.7,
    marginBottom: 10,
    lineHeight: 20,
  },
  taskMetadata: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  reasonText: {
    color: '#e6a800',
    fontSize: 13,
  },
  frictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
  },
  frictionValue: {
    color: '#dc3545',
  },
  decisionSection: {
    marginTop: 8,
  },
  decisionTitle: {
    marginBottom: 10,
  },
  decisionOptions: {
    gap: 8,
  },
  decisionOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
    justifyContent: 'center',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  optionText: {
    flex: 1,
  },
  optionDescription: {
    opacity: 0.7,
    marginTop: 2,
  },
});
