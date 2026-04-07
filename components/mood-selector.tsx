/**
 * Mood Selector Component
 * Phase 1: Mood-state entry screen (PRD 6.1)
 * Mobile-optimized: horizontal scrollable chips for compact layout
 */

import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Text, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MOOD_OPTIONS } from '@/services/mood/mood-matching.service';
import type { MoodState } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ============================================
// Props
// ============================================

export interface MoodSelectorProps {
  selectedMood: MoodState | null;
  onMoodSelect: (mood: MoodState) => void;
  showFullSelector?: boolean;
}

// ============================================
// Component
// ============================================

export function MoodSelector({
  selectedMood,
  onMoodSelect,
  showFullSelector = true,
}: MoodSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Show summary view when mood is selected and not showing full selector
  if (!showFullSelector && selectedMood) {
    const currentMoodOption = MOOD_OPTIONS.find((m) => m.id === selectedMood);
    return (
      <View style={[styles.moodSummary, { backgroundColor: colors.background }]}>
        <Text style={styles.moodEmoji}>{currentMoodOption?.emoji}</Text>
        <ThemedText style={styles.moodLabel}>{currentMoodOption?.label}</ThemedText>
      </View>
    );
  }

  // Show compact horizontal selector (default for mobile)
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
      <ThemedText type="subtitle" style={styles.question}>
        How are you walking in today?
      </ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
        decelerationRate="fast"
        snapToInterval={100}
      >
        {MOOD_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => onMoodSelect(option.id)}
            style={[
              styles.option,
              {
                backgroundColor: selectedMood === option.id ? colors.tint : colors.background,
                borderColor: selectedMood === option.id ? colors.tint : colors.icon,
              },
            ]}
            activeOpacity={0.7}
            accessibilityLabel={`Select ${option.label} mood`}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedMood === option.id }}
          >
            <Text
              style={[
                styles.optionEmoji,
                { transform: [{ scale: selectedMood === option.id ? 1.2 : 1 }] },
              ]}
            >
              {option.emoji}
            </Text>
            <ThemedText
              numberOfLines={1}
              style={[
                styles.optionLabel,
                {
                  color: selectedMood === option.id ? colors.background : colors.text,
                },
              ]}
            >
              {option.label.split(' ')[0]}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  question: {
    marginBottom: 12,
    fontSize: 18,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 16,
  },
  option: {
    width: 90,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  optionEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  moodSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
