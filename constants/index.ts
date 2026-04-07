/**
 * App Constants
 * Phase 1: Core constants for task management
 */

import { MoodState, DurationEstimate } from '@/types';

// ============================================
// Task Constraints (PRD 6.2, TRD 6.3)
// ============================================

export const ACTIVE_TASK_LIMIT = 15;
export const FOCUSED_TASK_VIEW_LIMIT = 6;

// ============================================
// Friction Configuration (PRD 6.4, TRD 6.2)
// ============================================

export const FRICTION_WEIGHTS = {
  SCROLL_PAST: 1,
  SNOOZE: 2,
  DUE_DATE_MOVE: 3,
  SESSION_NO_INTERACT: 1,
} as const;

export const FRICTION_INTERVENTION_THRESHOLD = 8;

// ============================================
// Mood Configuration (PRD 6.1, TRD 6.1)
// ============================================

export const MOOD_COMPATIBILITY: Record<MoodState, string[]> = {
  focused: ['focused', 'any'],
  low_energy: ['low_energy', 'quick_clear', 'any'],
  between_things: ['between_things', 'quick_clear', 'any'],
  creative: ['creative', 'focused', 'any'],
  quick_clear: ['quick_clear', 'low_energy', 'any'],
  any: ['focused', 'low_energy', 'between_things', 'creative', 'quick_clear', 'any'],
} as const;

export const MOOD_MAX_DURATION: Record<MoodState, number | null> = {
  focused: null,
  low_energy: 30,
  between_things: 30,
  creative: null,
  quick_clear: 15,
  any: null,
} as const;

// ============================================
// Duration Options (PRD 6.2)
// ============================================

export const DURATION_OPTIONS: { value: DurationEstimate; label: string }[] = [
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2+ hours' },
] as const;

// ============================================
// Time Constants
// ============================================

export const MILLISECONDS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

export const HOURS = {
  DAY_START: 8,
  DAY_END: 20,
  LATE_NIGHT: 21,
} as const;

// ============================================
// Sunday Reckoning Configuration (PRD 6.5, TRD 6.4)
// ============================================

export const RECKONING_CRITERIA = {
  MIN_TIMES_MOVED: 2,
  MIN_TIMES_SNOOZED: 2,
  UNTOUCHED_DAYS: 7,
} as const;

export const RECKONING_DEFAULT_TIME = '19:00'; // 7:00 PM

// ============================================
// Sync Configuration (TRD 9.1, 13.2)
// ============================================

export const SYNC_RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BACKOFF_MS: [1000, 5000, 30000],
  RETRY_ON: [408, 429, 500, 502, 503, 504],
} as const;

export const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// ============================================
// Geofencing Configuration (TRD 8.2)
// ============================================

export const GEOFENCING = {
  MAX_ACTIVE_GEOFENCES: 10,
  DEFAULT_RADIUS_METERS: 200,
  MIN_RADIUS_METERS: 100,
  MAX_RADIUS_METERS: 500,
} as const;

// ============================================
// Animation Configuration (PRD 6.3)
// ============================================

export const ANIMATION = {
  SWIPE_THRESHOLD: 100,
  COMPLETION_ANIMATION_DURATION: 300,
  MOOD_SELECTION_DURATION: 300,
} as const;

// ============================================
// Storage Keys
// ============================================

export const STORAGE_KEYS = {
  CURRENT_MOOD: 'intentlist_current_mood',
  USER_PREFERENCES: 'intentlist_preferences',
  ONBOARDING_COMPLETE: 'intentlist_onboarding_complete',
  LAST_SYNC: 'intentlist_last_sync',
} as const;

// ============================================
// Error Messages
// ============================================

export const ERROR_MESSAGES = {
  TASK_CAP_REACHED: `You're at ${ACTIVE_TASK_LIMIT} active tasks. To add a new task, let's clear space.`,
  DATABASE_INIT_FAILED: 'Failed to initialize database. Please restart the app.',
  SYNC_FAILED: 'Sync failed. Changes saved locally and will sync when online.',
  MOOD_SELECTION_FAILED: 'Failed to update mood state. Please try again.',
} as const;

// ============================================
// Success Messages
// ============================================

export const SUCCESS_MESSAGES = {
  TASK_COMPLETED: 'Nice! Task completed.',
  CAP_RESOLUTION_COMPLETE: 'Space cleared. Ready to add your new task.',
  RECKONING_COMPLETE: "Nice. You're ready for the week.",
} as const;
