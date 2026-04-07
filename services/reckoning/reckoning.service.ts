/**
 * Sunday Reckoning Service
 * Handles weekly review workflow: identify stale tasks, guide decisions, log outcomes
 */

import { Task, ReckoningSession, ReckoningDecision } from '@/types';
import { RECKONING_CRITERIA } from '@/constants';

// ============================================
// Reckoning Task Identification
// ============================================

export interface ReckoningTask extends Task {
  reckoningReason: string;
  daysUntouched: number;
}

/**
 * Identify tasks that need reckoning review
 * Criteria: moved/snoozed 2+ times, or untouched for 7+ days
 */
export function identifyReckoningTasks(tasks: Task[]): ReckoningTask[] {
  const now = Date.now();
  const sevenDaysMs = RECKONING_CRITERIA.UNTOUCHED_DAYS * 24 * 60 * 60 * 1000;

  return tasks
    .filter((task) => {
      if (task.status !== 'active') return false;

      // Check if task meets reckoning criteria
      const isHighFriction =
        task.timesSnoozed >= RECKONING_CRITERIA.MIN_TIMES_SNOOZED ||
        task.timesScrolledPast >= RECKONING_CRITERIA.MIN_TIMES_MOVED;

      const isStale = now - task.updatedAt > sevenDaysMs;

      return isHighFriction || isStale;
    })
    .map((task) => {
      const daysUntouched = Math.floor((now - task.updatedAt) / (24 * 60 * 60 * 1000));
      let reason = '';

      if (task.timesSnoozed >= RECKONING_CRITERIA.MIN_TIMES_SNOOZED) {
        reason = `Snoozed ${task.timesSnoozed} times`;
      } else if (task.timesScrolledPast >= RECKONING_CRITERIA.MIN_TIMES_MOVED) {
        reason = `Scrolled past ${task.timesScrolledPast} times`;
      } else if (daysUntouched >= RECKONING_CRITERIA.UNTOUCHED_DAYS) {
        reason = `Untouched for ${daysUntouched} days`;
      }

      return {
        ...task,
        reckoningReason: reason,
        daysUntouched,
      };
    })
    .sort((a, b) => b.frictionScore - a.frictionScore);
}

/**
 * Check if reckoning session should be triggered
 * Returns true if there are tasks needing review
 */
export function shouldTriggerReckoning(tasks: Task[]): boolean {
  return identifyReckoningTasks(tasks).length > 0;
}

// ============================================
// Reckoning Session Management
// ============================================

let currentSession: ReckoningSession | null = null;

/**
 * Start a new reckoning session
 */
export function startReckoningSession(userId: string): ReckoningSession {
  currentSession = {
    id: `reckoning_${Date.now()}`,
    userId,
    startedAt: Date.now(),
    completedAt: null,
    tasksReviewed: 0,
    tasksCommitted: 0,
    tasksDeferred: 0,
    tasksDeleted: 0,
  };

  return currentSession;
}

/**
 * Process a task decision during reckoning
 */
export function processTaskDecision(
  decision: ReckoningDecision
): { reviewed: number; committed: number; deferred: number; deleted: number } {
  if (!currentSession) {
    throw new Error('No active reckoning session');
  }

  currentSession.tasksReviewed += 1;

  switch (decision) {
    case 'do_this_week':
      currentSession.tasksCommitted += 1;
      break;
    case 'schedule_time':
      currentSession.tasksCommitted += 1;
      break;
    case 'waiting_on_someone':
      currentSession.tasksDeferred += 1;
      break;
    case 'not_important':
      currentSession.tasksDeleted += 1;
      break;
    case 'already_done':
      currentSession.tasksDeleted += 1;
      break;
  }

  return {
    reviewed: currentSession.tasksReviewed,
    committed: currentSession.tasksCommitted,
    deferred: currentSession.tasksDeferred,
    deleted: currentSession.tasksDeleted,
  };
}

/**
 * End the reckoning session and return summary
 */
export function endReckoningSession(): ReckoningSession | null {
  if (!currentSession) return null;

  currentSession.completedAt = Date.now();
  const session = currentSession;
  currentSession = null;

  return session;
}

/**
 * Get current session progress
 */
export function getSessionProgress(): {
  reviewed: number;
  committed: number;
  deferred: number;
  deleted: number;
} | null {
  if (!currentSession) return null;

  return {
    reviewed: currentSession.tasksReviewed,
    committed: currentSession.tasksCommitted,
    deferred: currentSession.tasksDeferred,
    deleted: currentSession.tasksDeleted,
  };
}

/**
 * Get decision options for a task
 */
export function getDecisionOptions(task: ReckoningTask): {
  label: string;
  value: ReckoningDecision;
  description: string;
  icon: string;
}[] {
  return [
    {
      label: 'Do this week',
      value: 'do_this_week',
      description: 'Commit to completing this task',
      icon: 'checkmark.circle.fill',
    },
    {
      label: 'Schedule for later',
      value: 'schedule_time',
      description: 'Set a specific time to do it',
      icon: 'calendar',
    },
    {
      label: 'Waiting on someone',
      value: 'waiting_on_someone',
      description: 'Move to someday until unblocked',
      icon: 'person',
    },
    {
      label: 'Not important anymore',
      value: 'not_important',
      description: 'Delete this task',
      icon: 'trash',
    },
    {
      label: 'Already done',
      value: 'already_done',
      description: 'Mark as completed',
      icon: 'checkmark.circle',
    },
  ];
}
