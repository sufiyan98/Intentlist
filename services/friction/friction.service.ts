/**
 * Friction Score Service
 * Phase 2: Calculate and track task friction (PRD 6.4, TRD 6.2)
 */

// ============================================
// Configuration (PRD 6.4, TRD 6.2)
// ============================================

export const FRICTION_WEIGHTS = {
  SCROLL_PAST: 1,
  SNOOZE: 2,
  DUE_DATE_MOVE: 3,
  SESSION_NO_INTERACT: 1,
} as const;

export const FRICTION_INTERVENTION_THRESHOLD = 8;

export type FrictionEventType = keyof typeof FRICTION_WEIGHTS;

// ============================================
// Service Functions
// ============================================

/**
 * Get the friction weight for an event type
 */
export function getFrictionWeight(eventType: FrictionEventType): number {
  return FRICTION_WEIGHTS[eventType];
}

/**
 * Calculate new friction score after an event
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
 */
export function needsFrictionIntervention(
  frictionScore: number,
  threshold: number = FRICTION_INTERVENTION_THRESHOLD
): boolean {
  return frictionScore >= threshold;
}

/**
 * Get the friction intervention threshold
 */
export function getInterventionThreshold(): number {
  return FRICTION_INTERVENTION_THRESHOLD;
}

/**
 * Calculate friction score from event counts
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

/**
 * Calculate friction score from task data
 */
export function calculateFrictionScoreFromTask(task: {
  timesScrolledPast: number;
  timesSnoozed: number;
  timesDueDateMoved: number;
}): number {
  return calculateFrictionScoreFromCounts(
    task.timesScrolledPast,
    task.timesSnoozed,
    task.timesDueDateMoved,
    0 // sessionNoInteractCount would come from session tracking
  );
}

/**
 * Reset friction score (after intervention or completion)
 */
export function resetFrictionScore(): number {
  return 0;
}
