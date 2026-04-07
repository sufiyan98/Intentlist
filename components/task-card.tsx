/**
 * Task Card Component
 * Phase 1: Display individual task in focused view
 */

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Task } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ============================================
// Props
// ============================================

export interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onComplete?: () => void;
  onSnooze?: () => void;
  showActions?: boolean;
}

// ============================================
// Component
// ============================================

export function TaskCard({
  task,
  onPress,
  onComplete,
  onSnooze,
  showActions = false,
}: TaskCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const durationDisplay = task.estimatedDuration?.toString() ?? null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.background, borderColor: colors.icon }]}
      activeOpacity={0.7}
      accessibilityLabel={`Task: ${task.title}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
    >
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={2}>
          {task.title}
        </ThemedText>

        <View style={styles.metadata}>
          {durationDisplay && (
            <ThemedText type="small" style={styles.duration}>
              {durationDisplay}
            </ThemedText>
          )}

          {task.personTag && (
            <ThemedText type="small" style={styles.personTag}>
              👤 {task.personTag}
            </ThemedText>
          )}

          {task.frictionScore > 0 && (
            <View style={[styles.frictionIndicator, { backgroundColor: colors.tint }]}>
              <ThemedText type="small" style={styles.frictionText}>
                {task.frictionScore}
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      {showActions && (
        <View style={styles.actions}>
          {onSnooze && (
            <TouchableOpacity
              onPress={onSnooze}
              style={styles.actionButton}
              accessibilityLabel="Snooze task"
              accessibilityRole="button"
            >
              <ThemedText type="small">Snooze</ThemedText>
            </TouchableOpacity>
          )}
          {onComplete && (
            <TouchableOpacity
              onPress={onComplete}
              style={[styles.actionButton, styles.completeButton]}
              accessibilityLabel="Complete task"
              accessibilityRole="button"
            >
              <ThemedText type="small" style={styles.completeButtonText}>
                Complete
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  duration: {
    opacity: 0.7,
  },
  personTag: {
    opacity: 0.7,
  },
  frictionIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  frictionText: {
    color: '#ffffff',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.1)',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  completeButton: {
    backgroundColor: 'rgba(10, 126, 164, 0.2)',
  },
  completeButtonText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
});
