/**
 * Mood Store (Zustand)
 * Phase 1: Client-side state management for mood state
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { MoodState, MoodSession } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// ============================================
// Store State
// ============================================

interface MoodStateStore {
  // Data
  currentMood: MoodState | null;
  moodSession: MoodSession | null;
  lastMoodChange: number | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  shouldShowMoodSelector: boolean;

  // Actions
  setCurrentMood: (mood: MoodState) => Promise<void>;
  clearMood: () => void;
  startMoodSession: (userId: string, mood: MoodState) => void;
  endMoodSession: () => void;
  setShowMoodSelector: (show: boolean) => void;
  loadPersistedMood: () => Promise<void>;
  clearError: () => void;
}

// ============================================
// Store Implementation
// ============================================

export const useMoodStore = create<MoodStateStore>((set, get) => ({
  // Initial State
  currentMood: null,
  moodSession: null,
  lastMoodChange: null,
  isLoading: false,
  error: null,
  shouldShowMoodSelector: true, // Show on first open

  // Actions
  setCurrentMood: async (mood: MoodState) => {
    set({ isLoading: true, error: null });

    try {
      // Persist to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_MOOD, mood);

      set({
        currentMood: mood,
        lastMoodChange: Date.now(),
        isLoading: false,
        shouldShowMoodSelector: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set mood';
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearMood: () => {
    set({ currentMood: null, lastMoodChange: null });
  },

  startMoodSession: (userId: string, mood: MoodState) => {
    const session: MoodSession = {
      id: `session_${Date.now()}`,
      userId,
      mood,
      sessionStart: Date.now(),
      sessionEnd: null,
      tasksCompletedInSession: 0,
      tasksSkippedInSession: 0,
    };

    set({ moodSession: session });
  },

  endMoodSession: () => {
    const session = get().moodSession;

    if (session) {
      // Here you would persist the session to the database
      // For Phase 1, we just clear it from state
    }

    set({ moodSession: null });
  },

  setShowMoodSelector: (show: boolean) => {
    set({ shouldShowMoodSelector: show });
  },

  loadPersistedMood: async () => {
    try {
      const savedMood = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_MOOD);

      if (savedMood && isValidMoodState(savedMood)) {
        set({
          currentMood: savedMood as MoodState,
          lastMoodChange: Date.now(),
        });
      }
    } catch (error) {
      console.error('Failed to load persisted mood:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// ============================================
// Helper Functions
// ============================================

function isValidMoodState(value: string): boolean {
  const validMoods = ['focused', 'low_energy', 'between_things', 'creative', 'quick_clear'];
  return validMoods.includes(value);
}

// ============================================
// Selectors
// ============================================

export const selectCurrentMood = (state: MoodStateStore) => state.currentMood;

export const selectShouldShowMoodSelector = (state: MoodStateStore) => state.shouldShowMoodSelector;

export const selectActiveMoodSession = (state: MoodStateStore) => state.moodSession;

/**
 * Check if mood session should be refreshed (after 4+ hours of inactivity)
 * Per PRD 6.1: Mood-state screen appears after 4+ hours of inactivity
 */
export const selectNeedsMoodRefresh = (state: MoodStateStore): boolean => {
  const { lastMoodChange } = state;

  if (!lastMoodChange) return true;

  const fourHoursInMs = 4 * 60 * 60 * 1000;
  return Date.now() - lastMoodChange > fourHoursInMs;
};
