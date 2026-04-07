/**
 * Friction Intervention Service
 * Identifies tasks needing intervention and provides guidance
 */

import { Task } from '@/types';
import { FRICTION_INTERVENTION_THRESHOLD, FRICTION_WEIGHTS } from '@/constants';

// ============================================
// Friction Event Tracking
// ============================================

export interface FrictionEvent {
  taskId: string;
  eventType: 'scroll_past' | 'snooze' | 'due_date_move' | 'session_no_interact';
  timestamp: number;
}

let frictionEvents: FrictionEvent[] = [];

/**
 * Record a friction event
 */
export function recordFrictionEvent(event: FrictionEvent): void {
  frictionEvents.push(event);
}

/**
 * Get friction events for a task
 */
export function getFrictionEventsForTask(taskId: string): FrictionEvent[] {
  return frictionEvents.filter((e) => e.taskId === taskId);
}

/**
 * Get recent friction events (last 24 hours)
 */
export function getRecentFrictionEvents(hours = 24): FrictionEvent[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return frictionEvents.filter((e) => e.timestamp > cutoff);
}

/**
 * Clear friction events (for testing)
 */
export function clearFrictionEvents(): void {
  frictionEvents = [];
}

// ============================================
// Friction Score Calculation
// ============================================

/**
 * Calculate friction score based on event weights
 */
export function calculateFrictionScore(events: FrictionEvent[]): number {
  return events.reduce((score, event) => {
    switch (event.eventType) {
      case 'scroll_past':
        return score + FRICTION_WEIGHTS.SCROLL_PAST;
      case 'snooze':
        return score + FRICTION_WEIGHTS.SNOOZE;
      case 'due_date_move':
        return score + FRICTION_WEIGHTS.DUE_DATE_MOVE;
      case 'session_no_interact':
        return score + FRICTION_WEIGHTS.SESSION_NO_INTERACT;
      default:
        return score;
    }
  }, 0);
}

// ============================================
// Intervention Detection
// ============================================

/**
 * Check if a task needs friction intervention
 */
export function needsIntervention(task: Task): boolean {
  return task.frictionScore >= FRICTION_INTERVENTION_THRESHOLD;
}

/**
 * Get all tasks needing intervention
 */
export function getTasksNeedingIntervention(tasks: Task[]): Task[] {
  return tasks.filter((task) => needsIntervention(task));
}

/**
 * Get intervention priority level
 */
export function getInterventionPriority(task: Task): 'low' | 'medium' | 'high' {
  const score = task.frictionScore;
  const threshold = FRICTION_INTERVENTION_THRESHOLD;

  if (score >= threshold * 1.5) return 'high';
  if (score >= threshold) return 'medium';
  return 'low';
}

// ============================================
// Intervention Suggestions
// ============================================

export interface InterventionSuggestion {
  id: string;
  title: string;
  description: string;
  action: 'break_down' | 'snooze' | 'delegate' | 'delete' | 'reframe';
  icon: string;
}

/**
 * Get intervention suggestions for a task
 */
export function getInterventionSuggestions(task: Task): InterventionSuggestion[] {
  const suggestions: InterventionSuggestion[] = [];

  // Always suggest breaking down
  suggestions.push({
    id: 'break_down',
    title: 'Break it down',
    description: 'Split this into smaller, more manageable subtasks',
    action: 'break_down',
    icon: 'scissors',
  });

  // Suggest snoozing if high friction
  if (task.frictionScore >= FRICTION_INTERVENTION_THRESHOLD) {
    suggestions.push({
      id: 'snooze',
      title: 'Snooze for now',
      description: 'Hide this for a few days and revisit with fresh eyes',
      action: 'snooze',
      icon: 'bell.slash',
    });
  }

  // Suggest delegating if has person tag
  if (task.personTag) {
    suggestions.push({
      id: 'delegate',
      title: 'Could someone else do this?',
      description: `This is related to ${task.personTag}. Maybe they can handle it?`,
      action: 'delegate',
      icon: 'person.2',
    });
  }

  // Suggest deleting if very high friction
  if (task.frictionScore >= FRICTION_INTERVENTION_THRESHOLD * 2) {
    suggestions.push({
      id: 'delete',
      title: 'Does this still matter?',
      description: 'If this isn\'t important anymore, it\'s okay to let it go',
      action: 'delete',
      icon: 'trash',
    });
  }

  // Suggest reframing
  suggestions.push({
    id: 'reframe',
    title: 'Reframe the task',
    description: 'Rewrite this task to make it more appealing or actionable',
    action: 'reframe',
    icon: 'pencil',
  });

  return suggestions;
}

/**
 * Get intervention message for a task
 */
export function getInterventionMessage(task: Task): string {
  const score = task.frictionScore;
  const threshold = FRICTION_INTERVENTION_THRESHOLD;

  if (score >= threshold * 2) {
    return `This task has been resisting your attention for a while. Maybe it's time to reconsider if it's still important?`;
  }

  if (score >= threshold * 1.5) {
    return `You've been avoiding this one. Let's figure out why and make it easier.`;
  }

  if (score >= threshold) {
    return `This task is building up friction. Want to break it down or postpone?`;
  }

  return '';
}
