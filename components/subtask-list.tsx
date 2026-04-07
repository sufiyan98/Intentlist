/**
 * Subtask List Component
 * Phase 1: Manage subtasks for a task
 */

import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Subtask } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ============================================
// Props
// ============================================

export interface SubtaskListProps {
  subtasks: Subtask[];
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

// ============================================
// Component
// ============================================

export function SubtaskList({
  subtasks,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: SubtaskListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setIsAdding(false);
    }
  };

  const renderSubtask = ({ item }: { item: Subtask }) => (
    <View
      style={[
        styles.subtaskItem,
        { backgroundColor: colors.background, borderColor: colors.icon },
      ]}
    >
      <TouchableOpacity
        onPress={() => onToggleSubtask(item.id)}
        style={styles.subtaskCheckbox}
        accessibilityLabel={
          item.isCompleted ? 'Mark as incomplete' : 'Mark as complete'
        }
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.isCompleted }}
      >
        <IconSymbol
          name={item.isCompleted ? 'checkmark.circle.fill' : 'circle'}
          size={24}
          color={item.isCompleted ? colors.tint : colors.text}
        />
      </TouchableOpacity>

      <View style={styles.subtaskContent}>
        <ThemedText
          style={[
            styles.subtaskTitle,
            item.isCompleted && styles.subtaskCompleted,
          ]}
          numberOfLines={2}
        >
          {item.title}
        </ThemedText>
      </View>

      <TouchableOpacity
        onPress={() => onDeleteSubtask(item.id)}
        style={styles.deleteButton}
        accessibilityLabel="Delete subtask"
        accessibilityRole="button"
      >
        <IconSymbol name="trash" size={20} color={colors.tint} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold">Subtasks</ThemedText>
        <ThemedText type="small" style={styles.subtaskCount}>
          {subtasks.filter((s) => s.isCompleted).length} of {subtasks.length} completed
        </ThemedText>
      </View>

      {subtasks.length > 0 ? (
        <FlatList
          data={subtasks}
          renderItem={renderSubtask}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
          <ThemedText type="small" style={styles.emptyStateText}>
            No subtasks yet
          </ThemedText>
        </View>
      )}

      {isAdding ? (
        <View style={[styles.addForm, { backgroundColor: colors.background }]}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.icon,
                color: colors.text,
              },
            ]}
            placeholder="Add a subtask..."
            placeholderTextColor={colors.icon}
            value={newSubtaskTitle}
            onChangeText={setNewSubtaskTitle}
            autoFocus
            onSubmitEditing={handleAddSubtask}
            accessibilityLabel="Subtask title"
          />
          <View style={styles.addFormActions}>
            <TouchableOpacity
              onPress={handleAddSubtask}
              style={[styles.actionButton, { backgroundColor: colors.tint }]}
              accessibilityLabel="Add subtask"
            >
              <ThemedText style={[styles.actionButtonText, { color: colors.background }]}>
                Add
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsAdding(false);
                setNewSubtaskTitle('');
              }}
              style={[styles.actionButton, { backgroundColor: colors.icon }]}
              accessibilityLabel="Cancel"
            >
              <ThemedText style={[styles.actionButtonText, { color: colors.background }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setIsAdding(true)}
          style={[styles.addButton, { borderColor: colors.icon }]}
          accessibilityLabel="Add subtask"
          accessibilityRole="button"
        >
          <IconSymbol name="plus" size={20} color={colors.icon} />
          <ThemedText type="small" style={styles.addButtonText}>
            Add subtask
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtaskCount: {
    opacity: 0.7,
  },
  listContent: {
    gap: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  subtaskCheckbox: {
    padding: 4,
  },
  subtaskContent: {
    flex: 1,
  },
  subtaskTitle: {
    fontSize: 15,
  },
  subtaskCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyStateText: {
    opacity: 0.6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  addButtonText: {
    opacity: 0.7,
  },
  addForm: {
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  addFormActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
