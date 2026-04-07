/**
 * Friction Score Service Tests
 */

import {
  getFrictionWeight,
  calculateNewFrictionScore,
  needsFrictionIntervention,
  getInterventionThreshold,
  calculateFrictionScoreFromCounts,
  calculateFrictionScoreFromTask,
  resetFrictionScore,
  FRICTION_WEIGHTS,
  FRICTION_INTERVENTION_THRESHOLD,
} from '@/services/friction/friction.service';

describe('Friction Score Service', () => {
  describe('FRICTION_WEIGHTS', () => {
    it('should have correct weight for SCROLL_PAST', () => {
      expect(FRICTION_WEIGHTS.SCROLL_PAST).toBe(1);
    });

    it('should have correct weight for SNOOZE', () => {
      expect(FRICTION_WEIGHTS.SNOOZE).toBe(2);
    });

    it('should have correct weight for DUE_DATE_MOVE', () => {
      expect(FRICTION_WEIGHTS.DUE_DATE_MOVE).toBe(3);
    });

    it('should have correct weight for SESSION_NO_INTERACT', () => {
      expect(FRICTION_WEIGHTS.SESSION_NO_INTERACT).toBe(1);
    });
  });

  describe('FRICTION_INTERVENTION_THRESHOLD', () => {
    it('should be 8 as per TRD 6.2', () => {
      expect(FRICTION_INTERVENTION_THRESHOLD).toBe(8);
    });
  });

  describe('getFrictionWeight', () => {
    it('should return correct weight for SCROLL_PAST', () => {
      expect(getFrictionWeight('SCROLL_PAST')).toBe(1);
    });

    it('should return correct weight for SNOOZE', () => {
      expect(getFrictionWeight('SNOOZE')).toBe(2);
    });

    it('should return correct weight for DUE_DATE_MOVE', () => {
      expect(getFrictionWeight('DUE_DATE_MOVE')).toBe(3);
    });

    it('should return correct weight for SESSION_NO_INTERACT', () => {
      expect(getFrictionWeight('SESSION_NO_INTERACT')).toBe(1);
    });
  });

  describe('calculateNewFrictionScore', () => {
    it('should add SCROLL_PAST weight to current score', () => {
      expect(calculateNewFrictionScore(5, 'SCROLL_PAST')).toBe(6);
    });

    it('should add SNOOZE weight to current score', () => {
      expect(calculateNewFrictionScore(5, 'SNOOZE')).toBe(7);
    });

    it('should add DUE_DATE_MOVE weight to current score', () => {
      expect(calculateNewFrictionScore(5, 'DUE_DATE_MOVE')).toBe(8);
    });

    it('should add SESSION_NO_INTERACT weight to current score', () => {
      expect(calculateNewFrictionScore(5, 'SESSION_NO_INTERACT')).toBe(6);
    });

    it('should work with zero current score', () => {
      expect(calculateNewFrictionScore(0, 'DUE_DATE_MOVE')).toBe(3);
    });
  });

  describe('needsFrictionIntervention', () => {
    it('should return true when score equals threshold', () => {
      expect(needsFrictionIntervention(8)).toBe(true);
    });

    it('should return true when score exceeds threshold', () => {
      expect(needsFrictionIntervention(10)).toBe(true);
    });

    it('should return false when score is below threshold', () => {
      expect(needsFrictionIntervention(7)).toBe(false);
    });

    it('should return false for zero score', () => {
      expect(needsFrictionIntervention(0)).toBe(false);
    });

    it('should use custom threshold when provided', () => {
      expect(needsFrictionIntervention(5, 5)).toBe(true);
      expect(needsFrictionIntervention(4, 5)).toBe(false);
    });
  });

  describe('getInterventionThreshold', () => {
    it('should return the intervention threshold', () => {
      expect(getInterventionThreshold()).toBe(8);
    });
  });

  describe('calculateFrictionScoreFromCounts', () => {
    it('should calculate score from all event counts', () => {
      // 2 scroll-pasts (2*1) + 1 snooze (1*2) + 1 due date move (1*3) + 0 session no-interacts
      // = 2 + 2 + 3 + 0 = 7
      const score = calculateFrictionScoreFromCounts(2, 1, 1, 0);
      expect(score).toBe(7);
    });

    it('should handle all zeros', () => {
      const score = calculateFrictionScoreFromCounts(0, 0, 0, 0);
      expect(score).toBe(0);
    });

    it('should calculate complex scenario', () => {
      // 5 scroll-pasts (5*1) + 3 snoozes (3*2) + 2 due date moves (2*3) + 4 session no-interacts (4*1)
      // = 5 + 6 + 6 + 4 = 21
      const score = calculateFrictionScoreFromCounts(5, 3, 2, 4);
      expect(score).toBe(21);
    });
  });

  describe('calculateFrictionScoreFromTask', () => {
    it('should calculate score from task data', () => {
      const task = {
        timesScrolledPast: 3,
        timesSnoozed: 2,
        timesDueDateMoved: 1,
      };
      // 3*1 + 2*2 + 1*3 = 3 + 4 + 3 = 10
      expect(calculateFrictionScoreFromTask(task)).toBe(10);
    });

    it('should handle zero counts', () => {
      const task = {
        timesScrolledPast: 0,
        timesSnoozed: 0,
        timesDueDateMoved: 0,
      };
      expect(calculateFrictionScoreFromTask(task)).toBe(0);
    });
  });

  describe('resetFrictionScore', () => {
    it('should return 0', () => {
      expect(resetFrictionScore()).toBe(0);
    });
  });

  describe('Integration Scenarios', () => {
    it('should trigger intervention after multiple snoozes and scroll-pasts', () => {
      let score = 0;

      // User scrolls past 3 times
      score = calculateNewFrictionScore(score, 'SCROLL_PAST');
      score = calculateNewFrictionScore(score, 'SCROLL_PAST');
      score = calculateNewFrictionScore(score, 'SCROLL_PAST');

      // User snoozes 2 times
      score = calculateNewFrictionScore(score, 'SNOOZE');
      score = calculateNewFrictionScore(score, 'SNOOZE');

      // User moves due date once
      score = calculateNewFrictionScore(score, 'DUE_DATE_MOVE');

      // Total: 3 + 4 + 3 = 10
      expect(score).toBe(10);
      expect(needsFrictionIntervention(score)).toBe(true);
    });

    it('should not trigger intervention for minor friction', () => {
      let score = 0;

      // User scrolls past twice
      score = calculateNewFrictionScore(score, 'SCROLL_PAST');
      score = calculateNewFrictionScore(score, 'SCROLL_PAST');

      // User snoozes once
      score = calculateNewFrictionScore(score, 'SNOOZE');

      // Total: 2 + 2 = 4
      expect(score).toBe(4);
      expect(needsFrictionIntervention(score)).toBe(false);
    });
  });
});
