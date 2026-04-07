/**
 * Settings Screen
 * Configure preferences: theme, task limits, quiet hours, Sunday Reckoning schedule
 * Mobile-optimized: safe area, 44dp touch targets, proper contrast
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettingsStore } from '@/stores';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserPreferences } from '@/types';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { preferences, loadPreferences, updatePreferences } = useSettingsStore();

  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: 'sun.max.fill' },
    { value: 'dark' as const, label: 'Dark', icon: 'moon.fill' },
    { value: 'system' as const, label: 'System', icon: 'iphone' },
  ];

  const limitOptions = [
    { value: 10 as const, label: '10' },
    { value: 15 as const, label: '15' },
    { value: 20 as const, label: '20' },
  ];

  const dayOptions = [
    { value: 'sunday' as const, label: 'Sunday' },
    { value: 'saturday' as const, label: 'Saturday' },
  ];

  const timeOptions = [
    { value: '18:00', label: '6 PM' },
    { value: '19:00', label: '7 PM' },
    { value: '20:00', label: '8 PM' },
    { value: '21:00', label: '9 PM' },
  ];

  const handleThemeChange = async (theme: UserPreferences['theme']) => {
    await updatePreferences({ theme });
  };

  const handleLimitChange = async (limit: UserPreferences['activeTaskLimit']) => {
    await updatePreferences({ activeTaskLimit: limit });
  };

  const handleQuietHoursToggle = async (enabled: boolean) => {
    if (enabled) {
      await updatePreferences({ quietHoursStart: 22, quietHoursEnd: 8 });
    } else {
      await updatePreferences({ quietHoursStart: null, quietHoursEnd: null });
    }
  };

  const handleReckoningDayChange = async (day: UserPreferences['sundayReckoningDay']) => {
    await updatePreferences({ sundayReckoningDay: day });
  };

  const handleReckoningTimeChange = async (time: string) => {
    await updatePreferences({ sundayReckoningTime: time });
  };

  const handleStartReckoning = () => {
    router.push('/reckoning' as any);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            updatePreferences({
              theme: 'system',
              quietHoursStart: null,
              quietHoursEnd: null,
              sundayReckoningDay: 'sunday',
              sundayReckoningTime: '19:00',
              activeTaskLimit: 15,
            });
          },
        },
      ]
    );
  };

  const hasQuietHours = localPrefs.quietHoursStart !== null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Settings</ThemedText>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Appearance
          </ThemedText>
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            {themeOptions.map((option, index) => (
              <Pressable
                key={option.value}
                onPress={() => handleThemeChange(option.value)}
                style={({ pressed }) => [
                  styles.optionRow,
                  index > 0 && styles.optionRowBorder,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                accessibilityLabel={`Set theme to ${option.label}`}
                accessibilityRole="button"
              >
                <View style={styles.optionContent}>
                  <IconSymbol name={option.icon as any} size={22} color={colors.tint} />
                  <ThemedText type="default">{option.label}</ThemedText>
                </View>
                {localPrefs.theme === option.value && (
                  <IconSymbol name="checkmark" size={22} color={colors.tint} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Task Limits Section */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Active Task Limit
          </ThemedText>
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <View style={styles.limitRow}>
              {limitOptions.map((option) => {
                const isSelected = localPrefs.activeTaskLimit === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleLimitChange(option.value)}
                    style={({ pressed }) => [
                      styles.limitChip,
                      {
                        backgroundColor: isSelected ? colors.tint : 'transparent',
                        borderColor: isSelected ? colors.tint : colors.icon,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    accessibilityLabel={`Set active task limit to ${option.label}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <ThemedText
                      style={[
                        styles.limitChipText,
                        {
                          color: isSelected ? colors.background : colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Quiet Hours Section */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Quiet Hours
          </ThemedText>
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <View style={styles.optionRow}>
              <View style={styles.optionContent}>
                <IconSymbol name="moon.fill" size={22} color={colors.tint} />
                <ThemedText type="default">Enable quiet hours</ThemedText>
              </View>
              <Switch
                value={hasQuietHours}
                onValueChange={handleQuietHoursToggle}
                trackColor={{ false: 'rgba(128,128,128,0.3)', true: colors.tint }}
                thumbColor={colors.background}
                ios_backgroundColor="rgba(128,128,128,0.3)"
                accessibilityLabel="Toggle quiet hours"
              />
            </View>
            {hasQuietHours && (
              <View style={[styles.quietHoursInfo, { borderTopColor: 'rgba(128,128,128,0.15)' }]}>
                <ThemedText type="small" style={styles.quietHoursText}>
                  Notifications paused from 10:00 PM to 8:00 AM
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Sunday Reckoning Section */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Sunday Reckoning
          </ThemedText>
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            {/* Day selection */}
            <View style={styles.optionRow}>
              <View style={styles.optionContent}>
                <IconSymbol name="calendar" size={22} color={colors.tint} />
                <ThemedText type="default">Reckoning day</ThemedText>
              </View>
              <View style={styles.daySelector}>
                {dayOptions.map((option) => {
                  const isSelected = localPrefs.sundayReckoningDay === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleReckoningDayChange(option.value)}
                      style={({ pressed }) => [
                        styles.dayChip,
                        {
                          backgroundColor: isSelected ? colors.tint : 'transparent',
                          borderColor: isSelected ? colors.tint : colors.icon,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                      accessibilityLabel={`Set reckoning day to ${option.label}`}
                    >
                      <ThemedText
                        style={[
                          styles.dayChipText,
                          {
                            color: isSelected ? colors.background : colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Time selection */}
            <View style={[styles.optionRow, styles.optionRowBorder]}>
              <View style={styles.optionContent}>
                <IconSymbol name="clock" size={22} color={colors.tint} />
                <ThemedText type="default">Reckoning time</ThemedText>
              </View>
              <View style={styles.timeSelector}>
                {timeOptions.map((option) => {
                  const isSelected = localPrefs.sundayReckoningTime === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleReckoningTimeChange(option.value)}
                      style={({ pressed }) => [
                        styles.timeChip,
                        {
                          backgroundColor: isSelected ? colors.tint : 'transparent',
                          borderColor: isSelected ? colors.tint : colors.icon,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                      accessibilityLabel={`Set reckoning time to ${option.label}`}
                    >
                      <ThemedText
                        style={[
                          styles.timeChipText,
                          {
                            color: isSelected ? colors.background : colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Start Reckoning Button */}
            <Pressable
              onPress={handleStartReckoning}
              style={({ pressed }) => [
                styles.reckoningButton,
                {
                  backgroundColor: colors.tint,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              accessibilityLabel="Start Sunday Reckoning"
              accessibilityRole="button"
            >
              <IconSymbol name="calendar.badge.clock" size={20} color={colors.background} />
              <ThemedText style={[styles.reckoningButtonText, { color: colors.background }]}>
                Start Reckoning Now
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Data
          </ThemedText>
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <Pressable
              onPress={handleResetSettings}
              style={({ pressed }) => [
                styles.optionRow,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              accessibilityLabel="Reset all settings"
              accessibilityRole="button"
            >
              <View style={styles.optionContent}>
                <IconSymbol name="arrow.counterclockwise" size={22} color="#dc3545" />
                <ThemedText type="default" style={styles.dangerText}>
                  Reset all settings
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={18} color={colors.icon} />
            </Pressable>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <ThemedText type="small" style={styles.appInfoText}>
            IntentList v1.0.0
          </ThemedText>
          <ThemedText type="small" style={styles.appInfoText}>
            Built with Expo & React Native
          </ThemedText>
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
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  optionRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  limitRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  limitChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitChipText: {
    fontSize: 15,
  },
  daySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayChipText: {
    fontSize: 14,
  },
  timeSelector: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeChipText: {
    fontSize: 13,
  },
  quietHoursInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  quietHoursText: {
    opacity: 0.7,
  },
  reckoningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    margin: 12,
    borderRadius: 10,
    minHeight: 50,
  },
  reckoningButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
  dangerText: {
    color: '#dc3545',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
  },
  appInfoText: {
    opacity: 0.5,
    marginBottom: 4,
  },
});
