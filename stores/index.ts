/**
 * Stores Index
 * Phase 1: Export all Zustand stores
 */

export { useTaskStore, selectActiveTaskCount, selectTaskById } from './task-store';
export {
  useMoodStore,
  selectCurrentMood,
  selectShouldShowMoodSelector,
  selectNeedsMoodRefresh,
} from './mood-store';
export {
  useSettingsStore,
  selectTheme,
  selectActiveTaskLimit,
  selectIsQuietHours,
  selectIsOnboardingComplete,
} from './settings-store';
