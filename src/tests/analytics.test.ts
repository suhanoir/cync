import { describe, it, expect } from 'vitest';
import {
  calculateStreaks,
  calculateConsistencyScore,
  getWeeklyOverview,
  formatDateToTz,
  getDateOffsetStr,
} from '../lib/analytics';

describe('Analytics Calculations', () => {
  describe('calculateStreaks', () => {
    it('returns 0 for empty workouts', () => {
      const result = calculateStreaks([], 'UTC');
      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
      expect(result.workedOutToday).toBe(false);
    });

    it('calculates current streak when workout completed today', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const result = calculateStreaks([twoDaysAgo, yesterday, today], 'UTC');
      expect(result.currentStreak).toBe(3);
      expect(result.longestStreak).toBe(3);
      expect(result.workedOutToday).toBe(true);
    });

    it('keeps streak intact if worked out yesterday but not yet today', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const result = calculateStreaks([twoDaysAgo, yesterday], 'UTC');
      expect(result.currentStreak).toBe(2);
      expect(result.longestStreak).toBe(2);
      expect(result.workedOutToday).toBe(false);
    });

    it('resets current streak to 0 if missed yesterday and today', () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const fourDaysAgo = new Date(today);
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      const result = calculateStreaks([fourDaysAgo, threeDaysAgo], 'UTC');
      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(2);
      expect(result.workedOutToday).toBe(false);
    });

    it('handles multiple workouts on the same day without double counting streak', () => {
      const today = new Date();
      const morning = new Date(today);
      morning.setHours(8, 0, 0, 0);
      const evening = new Date(today);
      evening.setHours(18, 0, 0, 0);

      const result = calculateStreaks([morning, evening], 'UTC');
      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
    });
  });

  describe('calculateConsistencyScore', () => {
    it('calculates 100% when active days meet or exceed expected target', () => {
      // 4 workouts/wk => expected in 30 days is (4/7)*30 = ~17.14 days
      const result = calculateConsistencyScore(18, 4);
      expect(result.score).toBe(100);
      expect(result.explanation).toContain('Exceptional consistency');
    });

    it('calculates proportionate percentage for partial consistency', () => {
      // 4 workouts/wk => expected ~17.14 days. 10 days active => ~58%
      const result = calculateConsistencyScore(10, 4);
      expect(result.score).toBe(58);
      expect(result.explanation).toContain('momentum');
    });

    it('handles 0 active days', () => {
      const result = calculateConsistencyScore(0, 4);
      expect(result.score).toBe(0);
    });
  });

  describe('getWeeklyOverview', () => {
    it('returns 7 days starting with Monday and marks active days', () => {
      const today = new Date();
      const workouts = [{ completedAt: today, duration: 45 }];
      const week = getWeeklyOverview(workouts, 'UTC');

      expect(week.length).toBe(7);
      expect(week[0].dayShort).toBe('Mon');
      expect(week[6].dayShort).toBe('Sun');

      const todayEntry = week.find((d) => d.isToday);
      expect(todayEntry).toBeDefined();
      expect(todayEntry?.hasActivity).toBe(true);
      expect(todayEntry?.totalDuration).toBe(45);
    });
  });
});

