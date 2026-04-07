/**
 * Explore Screen - Analytics & Insights Dashboard
 * Displays task statistics, mood patterns, and weekly progress
 * Mobile-optimized: responsive grid, safe area, proper touch targets
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTaskStore, useMoodStore } from '@/stores';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOOD_OPTIONS } from '@/types';
import { MILLISECONDS } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STAT_CARD_MIN_WIDTH = (SCREEN_WIDTH - 48 - 24) / 2; // 2-column with padding & gap

/**
 * Explore Screen Component
 */
export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { activeTasks, tasks, isLoading } = useTaskStore();
  const { currentMood } = useMoodStore();

  const [stats, setStats] = useState<TaskStats>({
    totalActive: 0,
    totalCompleted: 0,
    totalSomeday: 0,
    completionRate: 0,
    avgFrictionScore: 0,
    highFrictionTasks: 0,
    moodDistribution: {},
    durationDistribution: {},
    tasksByPerson: {},
    recentCompletions: [],
    weekCompletionCount: 0,
  });

  useEffect(() => {
    calculateStats();
  }, [activeTasks, tasks]);

  const calculateStats = useCallback(() => {
    const allTasks = [...activeTasks, ...tasks.filter((t) => t.status !== 'active')];
    const completedTasks = allTasks.filter((t) => t.status === 'completed');
    const somedayTasks = allTasks.filter((t) => t.status === 'someday');

    const totalEver = completedTasks.length + activeTasks.length + somedayTasks.length;
    const completionRate = totalEver > 0 ? Math.round((completedTasks.length / totalEver) * 100) : 0;

    const totalFriction = activeTasks.reduce((sum, t) => sum + t.frictionScore, 0);
    const avgFriction = activeTasks.length > 0 ? Math.round(totalFriction / activeTasks.length) : 0;

    const highFrictionTasks = activeTasks.filter((t) => t.frictionScore >= 5).length;

    const moodDist: Record<string, number> = {};
    activeTasks.forEach((task) => {
      const mood = task.requiredMood || 'any';
      moodDist[mood] = (moodDist[mood] || 0) + 1;
    });

    const durationDist: Record<string, number> = {};
    activeTasks.forEach((task) => {
      const duration = task.estimatedDuration ? `${task.estimatedDuration}min` : 'No estimate';
      durationDist[duration] = (durationDist[duration] || 0) + 1;
    });

    const tasksByPerson: Record<string, number> = {};
    activeTasks.forEach((task) => {
      if (task.personTag) {
        tasksByPerson[task.personTag] = (tasksByPerson[task.personTag] || 0) + 1;
      }
    });

    const weekAgo = Date.now() - 7 * MILLISECONDS.DAY;
    const recentCompletions = completedTasks
      .filter((t) => t.completedAt && t.completedAt > weekAgo)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
      .slice(0, 5);

    setStats({
      totalActive: activeTasks.length,
      totalCompleted: completedTasks.length,
      totalSomeday: somedayTasks.length,
      completionRate,
      avgFrictionScore: avgFriction,
      highFrictionTasks,
      moodDistribution: moodDist,
      durationDistribution: durationDist,
      tasksByPerson: tasksByPerson,
      recentCompletions,
      weekCompletionCount: recentCompletions.length,
    });
  }, [activeTasks, tasks]);

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading insights...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Insights</ThemedText>
          <ThemedText type="small" style={styles.headerSubtitle}>
            Your productivity patterns
          </ThemedText>
        </View>

        {/* Current Mood Badge */}
        {currentMood && (
          <View style={[styles.moodBadge, { backgroundColor: colors.background }]}>
            <IconSymbol name="brain.head.profile" size={18} color={colors.tint} />
            <ThemedText type="defaultSemiBold" style={styles.moodBadgeText}>
              {getMoodEmoji(currentMood)} {getMoodLabel(currentMood)}
            </ThemedText>
          </View>
        )}

        {/* Overview Stats */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Overview
          </ThemedText>
          <View style={styles.statsGrid}>
            <StatCard
              icon="circle.fill"
              color={colors.tint}
              value={stats.totalActive.toString()}
              label="Active"
            />
            <StatCard
              icon="checkmark.circle.fill"
              color="#28a745"
              value={stats.totalCompleted.toString()}
              label="Completed"
            />
            <StatCard
              icon="clock.fill"
              color="#ffc107"
              value={stats.totalSomeday.toString()}
              label="Someday"
            />
            <StatCard
              icon="chart.bar.fill"
              color={colors.tint}
              value={`${stats.completionRate}%`}
              label="Completion"
            />
          </View>
        </View>

        {/* This Week */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            This Week
          </ThemedText>
          <View style={[styles.weekCard, { backgroundColor: colors.background }]}>
            <View style={styles.weekCardContent}>
              <ThemedText type="largeTitle" style={styles.weekCount}>
                {stats.weekCompletionCount}
              </ThemedText>
              <ThemedText type="small" style={styles.weekLabel}>
                tasks completed
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Friction Overview */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Friction Overview
          </ThemedText>
          <View style={[styles.frictionCard, { backgroundColor: colors.background }]}>
            <View style={styles.frictionRow}>
              <ThemedText type="small">Average friction score</ThemedText>
              <ThemedText type="defaultSemiBold">{stats.avgFrictionScore}</ThemedText>
            </View>
            <View style={[styles.frictionRow, styles.frictionRowBorder]}>
              <ThemedText type="small">High friction tasks</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.highFrictionText}>
                {stats.highFrictionTasks}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Mood Distribution */}
        {Object.keys(stats.moodDistribution).length > 0 && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Tasks by Mood
            </ThemedText>
            <View style={[styles.distributionCard, { backgroundColor: colors.background }]}>
              {Object.entries(stats.moodDistribution).map(([mood, count]) => (
                <View key={mood} style={styles.distributionRow}>
                  <ThemedText type="small" style={styles.distributionLabel}>
                    {getMoodEmoji(mood as any)} {getMoodLabel(mood as any)}
                  </ThemedText>
                  <View style={styles.distributionBarContainer}>
                    <View
                      style={[
                        styles.distributionBar,
                        {
                          width: `${(count / stats.totalActive) * 100}%`,
                          backgroundColor: colors.tint,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText type="small" style={styles.distributionCount}>
                    {count}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Duration Distribution */}
        {Object.keys(stats.durationDistribution).length > 0 && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Tasks by Duration
            </ThemedText>
            <View style={[styles.distributionCard, { backgroundColor: colors.background }]}>
              {Object.entries(stats.durationDistribution).map(([duration, count]) => (
                <View key={duration} style={styles.distributionRow}>
                  <ThemedText type="small" style={styles.distributionLabel}>
                    {duration}
                  </ThemedText>
                  <View style={styles.distributionBarContainer}>
                    <View
                      style={[
                        styles.distributionBar,
                        {
                          width: `${(count / stats.totalActive) * 100}%`,
                          backgroundColor: colors.tint,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText type="small" style={styles.distributionCount}>
                    {count}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tasks by Person */}
        {Object.keys(stats.tasksByPerson).length > 0 && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Tasks by Person
            </ThemedText>
            <View style={[styles.distributionCard, { backgroundColor: colors.background }]}>
              {Object.entries(stats.tasksByPerson).map(([person, count]) => (
                <View key={person} style={styles.distributionRow}>
                  <ThemedText type="small" style={styles.distributionLabel}>
                    👤 {person}
                  </ThemedText>
                  <ThemedText type="small" style={styles.distributionCount}>
                    {count}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Completions */}
        {stats.recentCompletions.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Recently Completed
            </ThemedText>
            <View style={[styles.completionsCard, { backgroundColor: colors.background }]}>
              {stats.recentCompletions.map((task) => (
                <View key={task.id} style={styles.completionRow}>
                  <IconSymbol name="checkmark.circle.fill" size={18} color="#28a745" />
                  <ThemedText type="small" style={styles.completionText} numberOfLines={1}>
                    {task.title}
                  </ThemedText>
                  {task.completedAt && (
                    <ThemedText type="small" style={styles.completionTime}>
                      {formatTimeAgo(task.completedAt)}
                    </ThemedText>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  icon: string;
  color: string;
  value: string;
  label: string;
}

function StatCard({ icon, color, value, label }: StatCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.statCard, { backgroundColor: colors.background }]}>
      <IconSymbol name={icon as any} size={20} color={color} />
      <ThemedText type="title" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText type="small" style={styles.statLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

// ============================================
// Types
// ============================================

interface TaskStats {
  totalActive: number;
  totalCompleted: number;
  totalSomeday: number;
  completionRate: number;
  avgFrictionScore: number;
  highFrictionTasks: number;
  moodDistribution: Record<string, number>;
  durationDistribution: Record<string, number>;
  tasksByPerson: Record<string, number>;
  recentCompletions: any[];
  weekCompletionCount: number;
}

// ============================================
// Helpers
// ============================================

function getMoodEmoji(mood: string): string {
  const moodOption = MOOD_OPTIONS.find((m) => m.id === mood);
  return moodOption?.emoji || '❓';
}

function getMoodLabel(mood: string): string {
  const moodOption = MOOD_OPTIONS.find((m) => m.id === mood);
  return moodOption?.label || mood;
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / MILLISECONDS.HOUR);
  const days = Math.floor(diff / MILLISECONDS.DAY);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
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
    marginBottom: 16,
  },
  headerSubtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  moodBadgeText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: STAT_CARD_MIN_WIDTH,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    marginTop: 6,
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
  },
  weekCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  weekCardContent: {
    alignItems: 'center',
  },
  weekCount: {
    fontSize: 42,
    fontWeight: '700',
  },
  weekLabel: {
    opacity: 0.7,
    marginTop: 4,
  },
  frictionCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  frictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  frictionRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
  },
  highFrictionText: {
    color: '#dc3545',
  },
  distributionCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  distributionLabel: {
    minWidth: 90,
  },
  distributionBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  distributionBar: {
    height: '100%',
    borderRadius: 3,
  },
  distributionCount: {
    minWidth: 20,
    textAlign: 'right',
  },
  completionsCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  completionText: {
    flex: 1,
  },
  completionTime: {
    opacity: 0.6,
    fontSize: 12,
  },
});
