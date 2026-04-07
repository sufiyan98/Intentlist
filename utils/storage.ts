/**
 * Local Storage Service
 * Phase 1: AsyncStorage wrapper with type safety
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// Storage Keys
// ============================================

export const STORAGE_KEYS = {
  // Mood
  CURRENT_MOOD: '@intentlist:current_mood',
  LAST_MOOD_CHANGE: '@intentlist:last_mood_change',

  // User
  USER_ID: '@intentlist:user_id',
  USER_PREFERENCES: '@intentlist:user_preferences',

  // Settings
  ONBOARDING_COMPLETE: '@intentlist:onboarding_complete',
  THEME: '@intentlist:theme',

  // Feature flags
  SUNDAY_RECKONING_DISMISSED: '@intentlist:reckoning_dismissed',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ============================================
// User Preferences Type
// ============================================

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  sundayReckoningDay: 'saturday' | 'sunday';
  sundayReckoningTime: string;
  activeTaskLimit: 10 | 15 | 20;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  quietHoursStart: null,
  quietHoursEnd: null,
  sundayReckoningDay: 'sunday',
  sundayReckoningTime: '19:00',
  activeTaskLimit: 15,
};

// ============================================
// Storage Service
// ============================================

export class StorageError extends Error {
  constructor(message: string, public readonly key: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Local Storage Service
 * Provides type-safe AsyncStorage operations
 */
export class LocalStorage {
  /**
   * Get a string value from storage
   */
  static async getString(key: StorageKey): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      throw new StorageError(`Failed to get ${key}`, key);
    }
  }

  /**
   * Set a string value in storage
   */
  static async setString(key: StorageKey, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      throw new StorageError(`Failed to set ${key}`, key);
    }
  }

  /**
   * Remove a value from storage
   */
  static async remove(key: StorageKey): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      throw new StorageError(`Failed to remove ${key}`, key);
    }
  }

  /**
   * Get a JSON-parsed value from storage
   */
  static async getJSON<T>(key: StorageKey): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      throw new StorageError(`Failed to parse JSON for ${key}`, key);
    }
  }

  /**
   * Set a JSON-stringified value in storage
   */
  static async setJSON<T>(key: StorageKey, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      throw new StorageError(`Failed to stringify JSON for ${key}`, key);
    }
  }

  /**
   * Get current mood state
   */
  static async getCurrentMood(): Promise<string | null> {
    return this.getString(STORAGE_KEYS.CURRENT_MOOD);
  }

  /**
   * Set current mood state
   */
  static async setCurrentMood(mood: string): Promise<void> {
    await this.setString(STORAGE_KEYS.CURRENT_MOOD, mood);
    await this.setString(STORAGE_KEYS.LAST_MOOD_CHANGE, Date.now().toString());
  }

  /**
   * Get last mood change timestamp
   */
  static async getLastMoodChange(): Promise<number | null> {
    const value = await this.getString(STORAGE_KEYS.LAST_MOOD_CHANGE);
    return value ? parseInt(value, 10) : null;
  }

  /**
   * Get user preferences
   */
  static async getPreferences(): Promise<UserPreferences> {
    const prefs = await this.getJSON<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
    return prefs ? { ...DEFAULT_PREFERENCES, ...prefs } : DEFAULT_PREFERENCES;
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(updates: Partial<UserPreferences>): Promise<void> {
    const current = await this.getPreferences();
    const updated = { ...current, ...updates };
    await this.setJSON(STORAGE_KEYS.USER_PREFERENCES, updated);
  }

  /**
   * Check if onboarding is complete
   */
  static async isOnboardingComplete(): Promise<boolean> {
    const value = await this.getString(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  }

  /**
   * Set onboarding complete status
   */
  static async setOnboardingComplete(complete: boolean): Promise<void> {
    await this.setString(STORAGE_KEYS.ONBOARDING_COMPLETE, complete.toString());
  }

  /**
   * Get or create user ID
   */
  static async getUserId(): Promise<string> {
    let userId = await this.getString(STORAGE_KEYS.USER_ID);
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.setString(STORAGE_KEYS.USER_ID, userId);
    }
    return userId;
  }

  /**
   * Clear all storage (for testing/debugging)
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch {
      throw new StorageError('Failed to clear storage', 'ALL');
    }
  }

  /**
   * Get all keys (for debugging)
   */
  static async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch {
      throw new StorageError('Failed to get all keys', 'ALL');
    }
  }
}
