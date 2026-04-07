/**
 * Friction Intervention Modal Component
 * Shows when a task reaches friction threshold
 * Mobile-optimized: safe area, full-width dismiss, proper touch targets
 */

import React from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Task } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getInterventionSuggestions,
  getInterventionMessage,
  InterventionSuggestion,
} from '@/services/friction/friction-intervention.service';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// Props
// ============================================

export interface FrictionInterventionModalProps {
  visible: boolean;
  task: Task | null;
  onSuggestionSelect: (action: InterventionSuggestion) => void;
  onDismiss: () => void;
}

// ============================================
// Component
// ============================================

export function FrictionInterventionModal({
  visible,
  task,
  onSuggestionSelect,
  onDismiss,
}: FrictionInterventionModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  if (!task) return null;

  const suggestions = getInterventionSuggestions(task);
  const message = getInterventionMessage(task);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={[styles.overlay, { paddingBottom: insets.bottom }]}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <IconSymbol name="exclamationmark.triangle.fill" size={28} color="#ffc107" />
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Friction Alert
            </ThemedText>
          </View>

          {/* Task Info */}
          <View style={styles.taskInfo}>
            <ThemedText type="defaultSemiBold" style={styles.taskTitle} numberOfLines={2}>
              {task.title}
            </ThemedText>
            <View style={styles.frictionBadge}>
              <ThemedText type="small" style={styles.frictionText}>
                Friction score: {task.frictionScore}
              </ThemedText>
            </View>
            {message && (
              <ThemedText type="small" style={styles.message}>
                {message}
              </ThemedText>
            )}
          </View>

          {/* Suggestions */}
          <View style={styles.suggestionsSection}>
            <ThemedText type="defaultSemiBold" style={styles.suggestionsTitle}>
              What would you like to do?
            </ThemedText>
            <ScrollView
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  onPress={() => onSuggestionSelect(suggestion)}
                  style={[styles.suggestionItem, { borderColor: colors.icon }]}
                  activeOpacity={0.7}
                  accessibilityLabel={suggestion.title}
                  accessibilityRole="button"
                >
                  <View style={styles.suggestionContent}>
                    <IconSymbol name={suggestion.icon as any} size={22} color={colors.tint} />
                    <View style={styles.suggestionText}>
                      <ThemedText type="defaultSemiBold">{suggestion.title}</ThemedText>
                      <ThemedText type="small" style={styles.suggestionDescription}>
                        {suggestion.description}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Dismiss Button - full width, sticky bottom */}
          <TouchableOpacity
            onPress={onDismiss}
            style={styles.dismissButton}
            activeOpacity={0.7}
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
          >
            <ThemedText type="defaultSemiBold">Maybe later</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    maxHeight: SCREEN_HEIGHT * 0.75,
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
  },
  taskInfo: {
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 17,
    marginBottom: 8,
  },
  frictionBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  frictionText: {
    color: '#e6a800',
    fontWeight: '600',
  },
  message: {
    opacity: 0.8,
    lineHeight: 20,
  },
  suggestionsSection: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    marginBottom: 10,
  },
  suggestionsList: {
    maxHeight: 250,
  },
  suggestionItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    minHeight: 56,
    justifyContent: 'center',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionDescription: {
    opacity: 0.7,
    marginTop: 2,
  },
  dismissButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
    paddingTop: 14,
    minHeight: 50,
  },
});
