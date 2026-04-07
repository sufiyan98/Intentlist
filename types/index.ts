/**
 * IntentList Type Definitions
 * Phase 1: Core types for local-first task management
 */

// ============================================
// Mood State Types (PRD 6.1, TRD 6.1)
// ============================================

export type MoodState = 'focused' | 'low_energy' | 'between_things' | 'creative' | 'quick_clear' | 'any';

export interface MoodOption {
  id: MoodState;
  label: string;
  emoji: string;
  description: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'focused',
    label: 'Focused and sharp',
    emoji: '🔥',
    description: 'Deep work available',
  },
  {
    id: 'low_energy',
    label: 'Running on low',
    emoji: '🪫',
    description: 'Need easy wins',
  },
  {
    id: 'between_things',
    label: 'In between things',
    emoji: '⚡',
    description: 'Have 20–30 minutes',
  },
  {
    id: 'creative',
    label: 'Creative headspace',
    emoji: '🎨',
    description: 'Good for brainstorming/writing',
  },
  {
    id: 'quick_clear',
    label: 'Just want to clear',
    emoji: '✅',
    description: 'Errands and quick tasks',
  },
] as const;

// ============================================
// Task Types (PRD 6.2, TRD 4.1)
// ============================================

export type TaskStatus = 'active' | 'completed' | 'someday' | 'deleted';

export type DurationEstimate = 5 | 15 | 30 | 60 | 120; // minutes

export interface Task {
  // Core fields
  id: string;
  userId: string;
  title: string;
  notes: string | null;
  status: TaskStatus;

  // Context fields
  requiredMood: MoodState | null;
  estimatedDuration: DurationEstimate | null;
  personTag: string | null;

  // Location fields (Phase 3)
  locationTag: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationRadiusMeters: number | null;

  // Timing
  dueDate: number | null; // Unix timestamp
  completedAt: number | null; // Unix timestamp
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  sortOrder: number;

  // Friction tracking (Phase 2)
  frictionScore: number;
  frictionIntervenedAt: number | null;
  timesSnoozed: number;
  timesDueDateMoved: number;
  timesScrolledPast: number;

  // Sync fields (Phase 2)
  isSynced: boolean;
  serverUpdatedAt: number | null;
}

export interface TaskInput {
  title: string;
  notes?: string | null;
  requiredMood?: MoodState | null;
  estimatedDuration?: DurationEstimate | null;
  personTag?: string | null;
  dueDate?: number | null;
  sortOrder?: number;
}

export interface TaskUpdate {
  title?: string;
  notes?: string | null;
  requiredMood?: MoodState | null;
  estimatedDuration?: DurationEstimate | null;
  personTag?: string | null;
  dueDate?: number | null;
  status?: TaskStatus;
  sortOrder?: number;
  frictionScore?: number;
  timesSnoozed?: number;
  timesDueDateMoved?: number;
  timesScrolledPast?: number;
}

// ============================================
// Sub-task Types (TRD 4.1)
// ============================================

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: number;
}

export interface SubtaskInput {
  title: string;
  isCompleted?: boolean;
  sortOrder?: number;
}

// ============================================
// Mood Session Types (TRD 4.1)
// ============================================

export interface MoodSession {
  id: string;
  userId: string;
  mood: MoodState;
  sessionStart: number;
  sessionEnd: number | null;
  tasksCompletedInSession: number;
  tasksSkippedInSession: number;
}

// ============================================
// Friction Event Types (TRD 4.1)
// ============================================

export type FrictionEventType = 'scroll_past' | 'snooze' | 'due_date_move' | 'session_no_interact';

export interface FrictionEvent {
  id: string;
  taskId: string;
  eventType: FrictionEventType;
  eventData: string | null;
  createdAt: number;
}

// ============================================
// Sunday Reckoning Types (PRD 6.5, TRD 4.1)
// ============================================

export interface ReckoningSession {
  id: string;
  userId: string;
  startedAt: number;
  completedAt: number | null;
  tasksReviewed: number;
  tasksCommitted: number;
  tasksDeferred: number;
  tasksDeleted: number;
}

export type ReckoningDecision =
  | 'do_this_week'
  | 'schedule_time'
  | 'waiting_on_someone'
  | 'not_important'
  | 'already_done';

// ============================================
// User Types (TRD 4.1)
// ============================================

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  sundayReckoningDay: 'saturday' | 'sunday';
  sundayReckoningTime: string;
  activeTaskLimit: 10 | 15 | 20;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
  preferences: UserPreferences;
}

// ============================================
// Cap Resolution Types (PRD 6.2)
// ============================================

export type CapResolutionAction = 'done' | 'someday' | 'delete';

export interface CapResolutionCandidate {
  task: Task;
  reason: 'oldest' | 'lowest_priority' | 'high_friction';
}

export interface CapResolutionResult {
  success: boolean;
  needsResolution: boolean;
  candidates?: CapResolutionCandidate[];
}

// ============================================
// Snooze Types (PRD 6.3)
// ============================================

export type SnoozeOption = 'later_today' | 'tomorrow_morning' | 'this_weekend';
