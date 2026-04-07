/**
 * Settings Store (Zustand)
 * Phase 1: Client-side state management for user preferences
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { UserPreferences } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// ============================================
// Default Preferences
// ============================================

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  quietHoursStart: null,
  quietHoursEnd: null,
  sundayReckoningDay: 'sunday',
  sundayReckoningTime: '19:00',
  activeTaskLimit: 15,
};

// ============================================
// Store State
// ============================================

interface SettingsState {
  // Data
  preferences: UserPreferences;
  onboardingComplete: boolean;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPreferences: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  setOnboardingComplete: (complete: boolean) => Promise<void>;
  resetPreferences: () => void;
  clearError: () => void;
}

// ============================================
// Store Implementation
// ============================================

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial State
  preferences: DEFAULT_PREFERENCES,
  onboardingComplete: false,
  isLoading: false,
  error: null,

  // Actions
  loadPreferences: async () => {
    set({ isLoading: true, error: null });

    try {
      // Load preferences
      const savedPrefs = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);

      // Load onboarding status
      const onboardingStatus = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);

      set({
        preferences: savedPrefs
          ? { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) }
          : DEFAULT_PREFERENCES,
        onboardingComplete: onboardingStatus === 'true',
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load preferences';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updatePreferences: async (updates: Partial<UserPreferences>) => {
    set({ isLoading: true, error: null });

    try {
      const currentPrefs = get().preferences;
      const newPrefs = { ...currentPrefs, ...updates };

      // Persist to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(newPrefs));

      set({ preferences: newPrefs, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setOnboardingComplete: async (complete: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, complete.toString());

      set({ onboardingComplete: complete });
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
    }
  },

  resetPreferences: () => {
    set({ preferences: DEFAULT_PREFERENCES });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// ============================================
// Selectors
// ============================================

export const selectTheme = (state: SettingsState) => state.preferences.theme;

export const selectActiveTaskLimit = (state: SettingsState) => state.preferences.activeTaskLimit;

export const selectQuietHours = (state: SettingsState) => ({
  start: state.preferences.quietHoursStart,
  end: state.preferences.quietHoursEnd,
});

export const selectSundayReckoning = (state: SettingsState) => ({
  day: state.preferences.sundayReckoningDay,
  time: state.preferences.sundayReckoningTime,
});

export const selectIsOnboardingComplete = (state: SettingsState) => state.onboardingComplete;

/**
 * Check if current time is within quiet hours
 */
export const selectIsQuietHours = (state: SettingsState): boolean => {
  const { quietHoursStart, quietHoursEnd } = state.preferences;

  if (quietHoursStart === null || quietHoursEnd === null) {
    return false;
  }

  const currentHour = new Date().getHours();

  if (quietHoursStart <= quietHoursEnd) {
    // Normal range (e.g., 22:00 - 08:00)
    return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
  } else {
    // Overnight range (e.g., 22:00 - 06:00)
    return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
  }
};
