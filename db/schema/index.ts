/**
 * Drizzle ORM SQLite Schema for IntentList
 * Phase 1: Local-first database schema (TRD 4.1)
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ============================================
// Users Table (local profile cache)
// ============================================

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  preferences: text('preferences', { mode: 'json' }).notNull().$type<{
    theme: 'light' | 'dark' | 'system';
    quietHoursStart: number | null;
    quietHoursEnd: number | null;
    sundayReckoningDay: 'saturday' | 'sunday';
    sundayReckoningTime: string;
    activeTaskLimit: 10 | 15 | 20;
  }>(),
});

// ============================================
// Tasks Table
// ============================================

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  notes: text('notes'),
  status: text('status', { enum: ['active', 'completed', 'someday', 'deleted'] })
    .notNull()
    .default('active'),
  requiredMood: text('required_mood', {
    enum: ['focused', 'low_energy', 'between_things', 'creative', 'quick_clear', 'any'],
  }),
  estimatedDuration: integer('estimated_duration'),
  personTag: text('person_tag'),
  locationTag: text('location_tag'),
  locationLat: integer('location_lat'),
  locationLng: integer('location_lng'),
  locationRadiusMeters: integer('location_radius_meters').default(200),
  dueDate: integer('due_date', { mode: 'timestamp_ms' }),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  sortOrder: integer('sort_order').notNull(),
  frictionScore: integer('friction_score').default(0),
  frictionIntervenedAt: integer('friction_intervened_at', { mode: 'timestamp_ms' }),
  timesSnoozed: integer('times_snoozed').default(0),
  timesDueDateMoved: integer('times_due_date_moved').default(0),
  timesScrolledPast: integer('times_scrolled_past').default(0),
  isSynced: integer('is_synced', { mode: 'boolean' }).default(false),
  serverUpdatedAt: integer('server_updated_at', { mode: 'timestamp_ms' }),
});

// ============================================
// Sub-tasks Table
// ============================================

export const subtasks = sqliteTable('subtasks', {
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  sortOrder: integer('sort_order').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

// ============================================
// Mood Sessions Table (behavioral data for ML)
// ============================================

export const moodSessions = sqliteTable('mood_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  mood: text('mood', {
    enum: ['focused', 'low_energy', 'between_things', 'creative', 'quick_clear'],
  }).notNull(),
  sessionStart: integer('session_start', { mode: 'timestamp_ms' }).notNull(),
  sessionEnd: integer('session_end', { mode: 'timestamp_ms' }),
  tasksCompletedInSession: integer('tasks_completed_in_session').default(0),
  tasksSkippedInSession: integer('tasks_skipped_in_session').default(0),
});

// ============================================
// Friction Events Table
// ============================================

export const frictionEvents = sqliteTable('friction_events', {
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  eventType: text('event_type', {
    enum: ['scroll_past', 'snooze', 'due_date_move', 'session_no_interact'],
  }).notNull(),
  eventData: text('event_data'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

// ============================================
// Sunday Reckoning Log
// ============================================

export const reckoningSessions = sqliteTable('reckoning_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
  tasksReviewed: integer('tasks_reviewed').default(0),
  tasksCommitted: integer('tasks_committed').default(0),
  tasksDeferred: integer('tasks_deferred').default(0),
  tasksDeleted: integer('tasks_deleted').default(0),
});

// ============================================
// Sync Queue (pending server operations)
// ============================================

export const syncQueue = sqliteTable('sync_queue', {
  id: text('id').primaryKey(),
  operation: text('operation', { enum: ['INSERT', 'UPDATE', 'DELETE', 'UPSERT'] }).notNull(),
  tableName: text('table_name').notNull(),
  recordId: text('record_id').notNull(),
  payload: text('payload').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  retryCount: integer('retry_count').default(0),
});
