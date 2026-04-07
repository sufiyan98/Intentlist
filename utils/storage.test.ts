/**
 * Local Storage Service Tests
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalStorage, STORAGE_KEYS, StorageError } from '@/utils/storage';

// ============================================
// Mock Setup
// ============================================

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// ============================================
// Tests
// ============================================

describe('LocalStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getString', () => {
    it('should return value from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('test-value');

      const result = await LocalStorage.getString(STORAGE_KEYS.CURRENT_MOOD);

      expect(result).toBe('test-value');
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_MOOD);
    });

    it('should return null when key does not exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await LocalStorage.getString(STORAGE_KEYS.CURRENT_MOOD);

      expect(result).toBeNull();
    });

    it('should throw StorageError on failure', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await expect(LocalStorage.getString(STORAGE_KEYS.CURRENT_MOOD)).rejects.toThrow(
        StorageError
      );
    });
  });

  describe('setString', () => {
    it('should set value in AsyncStorage', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await LocalStorage.setString(STORAGE_KEYS.CURRENT_MOOD, 'focused');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_MOOD,
        'focused'
      );
    });

    it('should throw StorageError on failure', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(
        LocalStorage.setString(STORAGE_KEYS.CURRENT_MOOD, 'focused')
      ).rejects.toThrow(StorageError);
    });
  });

  describe('getJSON', () => {
    it('should parse and return JSON value', async () => {
      const testData = { theme: 'dark', limit: 15 };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(testData));

      const result = await LocalStorage.getJSON(STORAGE_KEYS.USER_PREFERENCES);

      expect(result).toEqual(testData);
    });

    it('should return null when key does not exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await LocalStorage.getJSON(STORAGE_KEYS.USER_PREFERENCES);

      expect(result).toBeNull();
    });

    it('should throw StorageError on invalid JSON', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid-json');

      await expect(
        LocalStorage.getJSON(STORAGE_KEYS.USER_PREFERENCES)
      ).rejects.toThrow(StorageError);
    });
  });

  describe('setJSON', () => {
    it('should stringify and set JSON value', async () => {
      const testData = { theme: 'dark', limit: 15 };
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await LocalStorage.setJSON(STORAGE_KEYS.USER_PREFERENCES, testData);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(testData)
      );
    });
  });

  describe('getCurrentMood / setCurrentMood', () => {
    it('should get current mood', async () => {
      mockAsyncStorage.getItem.mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.CURRENT_MOOD) return Promise.resolve('focused');
        return Promise.resolve(null);
      });

      const result = await LocalStorage.getCurrentMood();

      expect(result).toBe('focused');
    });

    it('should set current mood and timestamp', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await LocalStorage.setCurrentMood('low_energy');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_MOOD,
        'low_energy'
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.LAST_MOOD_CHANGE,
        expect.any(String)
      );
    });
  });

  describe('getLastMoodChange', () => {
    it('should return parsed timestamp', async () => {
      const timestamp = Date.now();
      mockAsyncStorage.getItem.mockResolvedValue(timestamp.toString());

      const result = await LocalStorage.getLastMoodChange();

      expect(result).toBe(timestamp);
    });

    it('should return null when not set', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await LocalStorage.getLastMoodChange();

      expect(result).toBeNull();
    });
  });

  describe('getPreferences / updatePreferences', () => {
    it('should return default preferences when none exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await LocalStorage.getPreferences();

      expect(result).toEqual({
        theme: 'system',
        quietHoursStart: null,
        quietHoursEnd: null,
        sundayReckoningDay: 'sunday',
        sundayReckoningTime: '19:00',
        activeTaskLimit: 15,
      });
    });

    it('should merge with defaults when partial preferences exist', async () => {
      const existingPrefs = { theme: 'dark' };
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingPrefs)
      );

      const result = await LocalStorage.getPreferences();

      expect(result.theme).toBe('dark');
      expect(result.activeTaskLimit).toBe(15); // default
    });

    it('should update preferences', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await LocalStorage.updatePreferences({ theme: 'dark' });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_PREFERENCES,
        expect.stringContaining('"theme":"dark"')
      );
    });
  });

  describe('isOnboardingComplete / setOnboardingComplete', () => {
    it('should return false when not set', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await LocalStorage.isOnboardingComplete();

      expect(result).toBe(false);
    });

    it('should return true when set to true', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('true');

      const result = await LocalStorage.isOnboardingComplete();

      expect(result).toBe(true);
    });

    it('should set onboarding complete', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await LocalStorage.setOnboardingComplete(true);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.ONBOARDING_COMPLETE,
        'true'
      );
    });
  });

  describe('getUserId', () => {
    it('should return existing user ID', async () => {
      const existingId = 'user_123_abc';
      mockAsyncStorage.getItem.mockResolvedValue(existingId);

      const result = await LocalStorage.getUserId();

      expect(result).toBe(existingId);
    });

    it('should generate new user ID if none exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await LocalStorage.getUserId();

      expect(result).toMatch(/^user_\d+_[a-z0-9]{9}$/);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_ID,
        result
      );
    });
  });

  describe('remove', () => {
    it('should remove key from storage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await LocalStorage.remove(STORAGE_KEYS.CURRENT_MOOD);

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_MOOD);
    });
  });

  describe('clear', () => {
    it('should clear all storage', async () => {
      mockAsyncStorage.clear.mockResolvedValue(undefined);

      await LocalStorage.clear();

      expect(mockAsyncStorage.clear).toHaveBeenCalled();
    });
  });

  describe('getAllKeys', () => {
    it('should return all keys', async () => {
      const keys = [
        STORAGE_KEYS.CURRENT_MOOD,
        STORAGE_KEYS.USER_PREFERENCES,
      ];
      mockAsyncStorage.getAllKeys.mockResolvedValue(keys);

      const result = await LocalStorage.getAllKeys();

      expect(result).toEqual(keys);
    });
  });
});

describe('StorageError', () => {
  it('should create error with message and key', () => {
    const error = new StorageError('Test error', 'test-key');

    expect(error.message).toBe('Test error');
    expect(error.key).toBe('test-key');
    expect(error.name).toBe('StorageError');
  });
});
