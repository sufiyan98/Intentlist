/**
 * Friction Score Service
 * Phase 2: Calculate and track task friction (PRD 6.4, TRD 6.2)
 * Note: This service is defined for Phase 2 but included in Phase 1 for future use
 */

import { FrictionEventType } from '@/types';
import { FRICTION_WEIGHTS, FRICTION_INTERVENTION_THRESHOLD } from '@/constants';

/**
 * Get the friction weight for an event type
 * @param eventType - Type of friction event
 * @returns Weight value for the event type
 */
export function getFrictionWeight(eventType: FrictionEventType): number {
  const weightMap = {
    scroll_past: FRICTION_WEIGHTS.SCROLL_PAST,
    snooze: FRICTION_WEIGHTS.SNOOZE,
    due_date_move: FRICTION_WEIGHTS.DUE_DATE_MOVE,
    session_no_interact: FRICTION_WEIGHTS.SESSION_NO_INTERACT,
  } as const;

  return weightMap[eventType];
}

/**
 * Calculate new friction score after an event
 * @param currentScore - Current friction score
 * @param eventType - Type of friction event
 * @returns New friction score
 */
export function calculateNewFrictionScore(
  currentScore: number,
  eventType: FrictionEventType
): number {
  const weight = getFrictionWeight(eventType);
  return currentScore + weight;
}

/**
 * Check if a task needs friction intervention
 * @param frictionScore - Current friction score
 * @returns True if intervention is needed
 */
export function needsFrictionIntervention(frictionScore: number): boolean {
  return frictionScore >= FRICTION_INTERVENTION_THRESHOLD;
}

/**
 * Get the friction intervention threshold
 * @returns Threshold value
 */
export function getInterventionThreshold(): number {
  return FRICTION_INTERVENTION_THRESHOLD;
}

/**
 * Calculate friction score from event counts
 * @param scrollPastCount - Number of times scrolled past
 * @param snoozeCount - Number of times snoozed
 * @param dueDateMoveCount - Number of times due date moved
 * @param sessionNoInteractCount - Number of sessions without interaction
 * @returns Calculated friction score
 */
export function calculateFrictionScoreFromCounts(
  scrollPastCount: number,
  snoozeCount: number,
  dueDateMoveCount: number,
  sessionNoInteractCount: number
): number {
  return (
    scrollPastCount * FRICTION_WEIGHTS.SCROLL_PAST +
    snoozeCount * FRICTION_WEIGHTS.SNOOZE +
    dueDateMoveCount * FRICTION_WEIGHTS.DUE_DATE_MOVE +
    sessionNoInteractCount * FRICTION_WEIGHTS.SESSION_NO_INTERACT
  );
}
