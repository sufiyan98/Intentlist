/**
 * Jest Setup File
 * Phase 1: Test configuration and mocks
 */

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock expo-constants
jest.mock('expo-constants', () => ({
  Constants: {
    expoConfig: {
      name: 'IntentList',
      version: '1.0.0',
      scheme: 'intentlist',
    },
  },
  default: {
    expoConfig: {
      name: 'IntentList',
      version: '1.0.0',
      scheme: 'intentlist',
    },
  },
}));

// Mock expo
jest.mock('expo', () => ({
  Constants: {
    expoConfig: {
      name: 'IntentList',
      version: '1.0.0',
      scheme: 'intentlist',
    },
  },
}));

// Mock react-native-uuid
jest.mock('react-native-uuid', () => ({
  default: {
    v4: () => 'test-uuid-1234-5678-90ab-cdef',
  },
}));

// Mock react-native
jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'web',
      select: (obj: any) => obj.default || obj.web || obj.ios || obj.android,
    },
  };
});

// Global test timeout
jest.setTimeout(10000);
