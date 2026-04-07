/**
 * Mood Picker Component
 * Phase 1: Select required mood for task
 */

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MoodState, MOOD_OPTIONS } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ============================================
// Props
// ============================================

export interface MoodPickerProps {
  value: MoodState | null;
  onChange: (mood: MoodState | null) => void;
  label?: string;
  showClear?: boolean;
}

// ============================================
// Component
// ============================================

export function MoodPicker({
  value,
  onChange,
  label = 'Best for mood',
  showClear = true,
}: MoodPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>

      {showClear && (
        <TouchableOpacity
          onPress={() => onChange(null)}
          style={[
            styles.clearButton,
            {
              backgroundColor: value === null ? colors.tint : 'transparent',
              borderColor: colors.icon,
            },
          ]}
          accessibilityLabel="Clear mood requirement (any mood)"
          accessibilityRole="button"
        >
          <ThemedText
            style={[
              styles.clearButtonText,
              {
                color: value === null ? colors.background : colors.text,
              },
            ]}
          >
            Any mood
          </ThemedText>
        </TouchableOpacity>
      )}

      <View style={styles.optionsGrid}>
        {MOOD_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[
              styles.optionButton,
              {
                backgroundColor:
                  value === option.id ? colors.tint : colors.background,
                borderColor: colors.icon,
              },
            ]}
            accessibilityLabel={`Select ${option.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: value === option.id }}
          >
            <View style={styles.optionContent}>
              <ThemedText style={styles.optionEmoji}>{option.emoji}</ThemedText>
              <ThemedText
                numberOfLines={2}
                style={[
                  styles.optionLabel,
                  {
                    color: value === option.id ? colors.background : colors.text,
                  },
                ]}
              >
                {option.label}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
  label: {
    marginBottom: 8,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionsGrid: {
    gap: 8,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionEmoji: {
    fontSize: 20,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
  },
});
