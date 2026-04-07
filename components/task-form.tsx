/**
 * Task Form Component
 * Phase 1: Reusable form for creating/editing tasks
 * Mobile-optimized: KeyboardAvoidingView for Android/iOS
 */

import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DurationPicker } from '@/components/duration-picker';
import { MoodPicker } from '@/components/mood-picker';
import { useTaskForm, TaskFormData } from '@/hooks/use-task-form';
import { Task, DurationEstimate, MoodState } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ============================================
// Props
// ============================================

export interface TaskFormProps {
  initialTask?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

// ============================================
// Component
// ============================================

export function TaskForm({
  initialTask,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save Task',
}: TaskFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    formData,
    errors,
    setTitle,
    setNotes,
    setMood,
    setDuration,
    setPersonTag,
    validateForm,
  } = useTaskForm(initialTask ? {
    title: initialTask.title,
    notes: initialTask.notes ?? '',
    requiredMood: initialTask.requiredMood,
    estimatedDuration: initialTask.estimatedDuration,
    personTag: initialTask.personTag ?? '',
  } : undefined);

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
      {/* Title Field */}
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Task Name *
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.titleInput,
            {
              borderColor: errors.title ? '#dc3545' : colors.icon,
              color: colors.text,
            },
          ]}
          placeholder="What needs to be done?"
          placeholderTextColor={colors.icon}
          value={formData.title}
          onChangeText={setTitle}
          autoFocus={!initialTask}
          accessibilityLabel="Task title"
        />
        {errors.title && (
          <ThemedText type="small" style={styles.errorText}>
            {errors.title}
          </ThemedText>
        )}
      </View>

      {/* Notes Field */}
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Notes
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.notesInput,
            {
              borderColor: colors.icon,
              color: colors.text,
            },
          ]}
          placeholder="Add any details, context, or steps..."
          placeholderTextColor={colors.icon}
          value={formData.notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          accessibilityLabel="Task notes"
        />
        {errors.notes && (
          <ThemedText type="small" style={styles.errorText}>
            {errors.notes}
          </ThemedText>
        )}
      </View>

      {/* Duration Picker */}
      <DurationPicker
        value={formData.estimatedDuration}
        onChange={setDuration}
        label="Estimated duration"
      />

      {/* Mood Picker */}
      <MoodPicker
        value={formData.requiredMood}
        onChange={setMood}
        label="Best for mood"
      />

      {/* Person Tag Field */}
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Person (optional)
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: errors.personTag ? '#dc3545' : colors.icon,
              color: colors.text,
            },
          ]}
          placeholder="Who is this related to?"
          placeholderTextColor={colors.icon}
          value={formData.personTag}
          onChangeText={setPersonTag}
          accessibilityLabel="Person tag"
        />
        {errors.personTag && (
          <ThemedText type="small" style={styles.errorText}>
            {errors.personTag}
          </ThemedText>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={onCancel}
          style={[styles.actionButton, styles.cancelButton]}
          disabled={isSubmitting}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
        >
          <ThemedText style={[styles.actionButtonText, { color: colors.text }]}>
            Cancel
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          style={[
            styles.actionButton,
            styles.submitButton,
            {
              backgroundColor: isSubmitting ? colors.icon : colors.tint,
            },
          ]}
          disabled={isSubmitting}
          accessibilityLabel={submitLabel}
          accessibilityRole="button"
        >
          <ThemedText
            style={[
              styles.actionButtonText,
              { color: colors.background },
              isSubmitting && styles.actionButtonTextDisabled,
            ]}
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </ThemedText>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
  },
  notesInput: {
    minHeight: 100,
    fontFamily: 'System',
  },
  errorText: {
    color: '#dc3545',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.1)',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
  },
  submitButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  actionButtonTextDisabled: {
    opacity: 0.6,
  },
});
