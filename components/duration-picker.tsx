/**
 * Duration Picker Component
 * Phase 1: Select task duration estimate
 */

import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DurationEstimate } from '@/types';
import { DURATION_OPTIONS } from '@/constants';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ============================================
// Props
// ============================================

export interface DurationPickerProps {
  value: DurationEstimate | null;
  onChange: (duration: DurationEstimate | null) => void;
  label?: string;
  showClear?: boolean;
}

// ============================================
// Component
// ============================================

export function DurationPicker({
  value,
  onChange,
  label = 'Duration',
  showClear = true,
}: DurationPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
      >
        {showClear && (
          <TouchableOpacity
            onPress={() => onChange(null)}
            style={[
              styles.optionButton,
              {
                backgroundColor: value === null ? colors.tint : colors.background,
                borderColor: colors.icon,
              },
            ]}
            accessibilityLabel="Clear duration"
            accessibilityRole="button"
            accessibilityState={{ selected: value === null }}
          >
            <ThemedText
              style={[
                styles.optionText,
                {
                  color: value === null ? colors.background : colors.text,
                },
              ]}
            >
              Any
            </ThemedText>
          </TouchableOpacity>
        )}

        {DURATION_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.optionButton,
              {
                backgroundColor: value === option.value ? colors.tint : colors.background,
                borderColor: colors.icon,
              },
            ]}
            accessibilityLabel={`Select ${option.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: value === option.value }}
          >
            <ThemedText
              style={[
                styles.optionText,
                {
                  color: value === option.value ? colors.background : colors.text,
                },
              ]}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
