import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSettingsStore, useMoodStore } from '@/stores';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ACTIVE_TASK_LIMIT } from '@/constants';

/**
 * Settings Screen - Phase 1
 * App settings and preferences
 */

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { preferences, updatePreferences } = useSettingsStore();
  const { clearMood } = useMoodStore();

  // Theme options
  const themeOptions = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ] as const;

  // Active task limit options
  const limitOptions = [10, 15, 20] as const;

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={styles.sectionTitle}>
          Settings
        </ThemedText>
        <ThemedText type="small" style={styles.sectionSubtitle}>
          Customize your IntentList experience
        </ThemedText>
      </ThemedView>

      {/* Appearance */}
      <ThemedView style={[styles.section, { backgroundColor: colors.background }]}>
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Appearance
        </ThemedText>

        <View style={styles.optionGroup}>
          <ThemedText type="defaultSemiBold">Theme</ThemedText>
          <View style={styles.optionButtons}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => updatePreferences({ theme: option.value })}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      preferences.theme === option.value ? colors.tint : 'transparent',
                    borderColor: colors.icon,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.optionButtonText,
                    {
                      color: preferences.theme === option.value ? colors.background : colors.text,
                    },
                  ]}
                >
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ThemedView>

      {/* Task Management */}
      <ThemedView style={[styles.section, { backgroundColor: colors.background }]}>
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Task Management
        </ThemedText>

        <View style={styles.optionGroup}>
          <ThemedText type="defaultSemiBold">Active Task Limit</ThemedText>
          <ThemedText type="small" style={styles.optionDescription}>
            Maximum number of active tasks (default: {ACTIVE_TASK_LIMIT})
          </ThemedText>
          <View style={styles.optionButtons}>
            {limitOptions.map((limit) => (
              <TouchableOpacity
                key={limit}
                onPress={() => updatePreferences({ activeTaskLimit: limit as 10 | 15 | 20 })}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      preferences.activeTaskLimit === limit ? colors.tint : 'transparent',
                    borderColor: colors.icon,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.optionButtonText,
                    {
                      color:
                        preferences.activeTaskLimit === limit ? colors.background : colors.text,
                    },
                  ]}
                >
                  {limit}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ThemedView>

      {/* Mood State */}
      <ThemedView style={[styles.section, { backgroundColor: colors.background }]}>
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Mood State
        </ThemedText>

        <View style={styles.optionGroup}>
          <ThemedText type="defaultSemiBold">Reset Mood Selection</ThemedText>
          <ThemedText type="small" style={styles.optionDescription}>
            Clear your current mood and show the selector again
          </ThemedText>
          <TouchableOpacity
            onPress={clearMood}
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
          >
            <ThemedText style={[styles.actionButtonText, { color: colors.background }]}>
              Reset Mood
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* About */}
      <ThemedView style={[styles.section, { backgroundColor: colors.background }]}>
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          About
        </ThemedText>

        <View style={styles.aboutContent}>
          <ThemedText type="defaultSemiBold">IntentList</ThemedText>
          <ThemedText type="small">Version 1.0.0</ThemedText>
          <ThemedText type="small" style={styles.aboutDescription}>
            The Todo App That Takes Responsibility for Completion
          </ThemedText>
        </View>
      </ThemedView>

      <View style={styles.footer}>
        <ThemedText type="small" style={styles.footerText}>
          Phase 1: Local-First MVP
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionSubtitle: {
    opacity: 0.7,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionDescription: {
    opacity: 0.7,
    marginTop: 4,
    marginBottom: 12,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionButtonText: {
    fontWeight: '600',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    fontWeight: '600',
  },
  aboutContent: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  aboutDescription: {
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    opacity: 0.5,
  },
});
