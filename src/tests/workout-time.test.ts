import { describe, it, expect } from 'vitest';
import {
  calculateWorkoutDuration,
  validateWorkoutTimeRange,
  formatDuration,
  formatTimeRange,
  formatWorkoutDate,
  formatElapsedSeconds,
  combineDateAndTime,
} from '../lib/workout-time';

describe('Workout Time & Duration System', () => {
  it('Test 1: Calculates exact duration between 5:30 PM and 6:22 PM (52 min)', () => {
    const start = new Date(2026, 8, 24, 17, 30); // 5:30 PM
    const end = new Date(2026, 8, 24, 18, 22);   // 6:22 PM

    const duration = calculateWorkoutDuration(start, end);
    expect(duration).toBe(52);

    const validation = validateWorkoutTimeRange(start, end);
    expect(validation.valid).toBe(true);
    expect(validation.duration).toBe(52);
  });

  it('Test 2: Rejects same start and end time (6:00 PM to 6:00 PM)', () => {
    const start = new Date(2026, 8, 24, 18, 0);
    const end = new Date(2026, 8, 24, 18, 0);

    const validation = validateWorkoutTimeRange(start, end);
    expect(validation.valid).toBe(false);
    expect(validation.error).toBe('End time must be after the start time.');
  });

  it('Test 3: Rejects end time before start time when midnight crossing is disabled', () => {
    const start = new Date(2026, 8, 24, 18, 0);  // 6:00 PM
    const end = new Date(2026, 8, 24, 17, 30);  // 5:30 PM

    const validation = validateWorkoutTimeRange(start, end, {
      allowMidnightCrossing: false,
    });
    expect(validation.valid).toBe(false);
    expect(validation.error).toBe('End time must be after the start time.');
  });

  it('Test 4: Correctly calculates midnight crossing from 11:30 PM to 12:20 AM (50 min)', () => {
    const start = new Date(2026, 8, 24, 23, 30); // 11:30 PM
    const end = new Date(2026, 8, 24, 0, 20);    // 12:20 AM same calendar date input

    const duration = calculateWorkoutDuration(start, end, true);
    expect(duration).toBe(50);

    const validation = validateWorkoutTimeRange(start, end, {
      allowMidnightCrossing: true,
    });
    expect(validation.valid).toBe(true);
    expect(validation.duration).toBe(50);
    expect(validation.isMidnightCrossing).toBe(true);
  });

  it('Test 5: Rejects workouts exceeding maximum 12 hours (720 minutes)', () => {
    const start = new Date(2026, 8, 24, 6, 0);   // 6:00 AM
    const end = new Date(2026, 8, 24, 19, 0);    // 7:00 PM (13 hours)

    const validation = validateWorkoutTimeRange(start, end);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('cannot exceed 12 hours');
  });

  it('Test 6: Formats duration with consistent standards', () => {
    expect(formatDuration(52)).toBe('52 min');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(72)).toBe('1h 12m');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(135)).toBe('2h 15m');
    expect(formatDuration(0)).toBe('0 min');
  });

  it('Test 7: Combines date and time inputs correctly', () => {
    const date = combineDateAndTime('2026-09-24', '17:30');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8); // September (0-indexed)
    expect(date.getDate()).toBe(24);
    expect(date.getHours()).toBe(17);
    expect(date.getMinutes()).toBe(30);

    // Midnight rollover with +1 day
    const nextDay = combineDateAndTime('2026-09-24', '00:20', 1);
    expect(nextDay.getDate()).toBe(25);
    expect(nextDay.getHours()).toBe(0);
    expect(nextDay.getMinutes()).toBe(20);
  });

  it('Test 8: Formats elapsed live workout seconds', () => {
    expect(formatElapsedSeconds(42)).toBe('00:42');
    expect(formatElapsedSeconds(2538)).toBe('42:18');
    expect(formatElapsedSeconds(3725)).toBe('01:02:05');
  });
});
