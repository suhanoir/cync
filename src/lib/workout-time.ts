import { format } from 'date-fns';

export const MAX_WORKOUT_DURATION_MINUTES = 12 * 60; // 12 hours (720 minutes)
export const MIN_WORKOUT_DURATION_MINUTES = 1;

export interface TimeValidationResult {
  valid: boolean;
  duration: number;
  error?: string;
  isMidnightCrossing?: boolean;
}

/**
 * Calculates workout duration in minutes between two timestamps.
 * Accurately handles midnight crossing (e.g. 11:30 PM to 12:20 AM = 50 min).
 */
export function calculateWorkoutDuration(
  startTime: Date | string,
  endTime: Date | string,
  allowMidnightCrossing = true
): number {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }

  const diffMs = end.getTime() - start.getTime();
  let diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 0 && allowMidnightCrossing) {
    // If end time is earlier in the day and on the same calendar base, assume next day rollover
    diffMinutes += 24 * 60;
  }

  return Math.max(0, diffMinutes);
}

/**
 * Validates start and end time range with configurable boundaries.
 */
export function validateWorkoutTimeRange(
  startTime: Date | string | null | undefined,
  endTime: Date | string | null | undefined,
  options?: {
    allowMidnightCrossing?: boolean;
    maxDurationMinutes?: number;
  }
): TimeValidationResult {
  const allowMidnightCrossing = options?.allowMidnightCrossing ?? true;
  const maxDuration = options?.maxDurationMinutes ?? MAX_WORKOUT_DURATION_MINUTES;

  if (!startTime || !endTime) {
    return {
      valid: false,
      duration: 0,
      error: 'Both start time and end time are required.',
    };
  }

  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

  if (isNaN(start.getTime())) {
    return {
      valid: false,
      duration: 0,
      error: 'Invalid start time.',
    };
  }

  if (isNaN(end.getTime())) {
    return {
      valid: false,
      duration: 0,
      error: 'Invalid end time.',
    };
  }

  // Exact same time check
  if (start.getTime() === end.getTime()) {
    return {
      valid: false,
      duration: 0,
      error: 'End time must be after the start time.',
    };
  }

  const diffMs = end.getTime() - start.getTime();
  let durationMinutes = Math.round(diffMs / (1000 * 60));
  let isMidnightCrossing = false;

  if (durationMinutes < 0) {
    if (allowMidnightCrossing) {
      durationMinutes += 24 * 60;
      isMidnightCrossing = true;
    } else {
      return {
        valid: false,
        duration: 0,
        error: 'End time must be after the start time.',
      };
    }
  }

  if (durationMinutes < MIN_WORKOUT_DURATION_MINUTES) {
    return {
      valid: false,
      duration: durationMinutes,
      error: 'Workout duration must be at least 1 minute.',
    };
  }

  if (durationMinutes > maxDuration) {
    return {
      valid: false,
      duration: durationMinutes,
      error: `Workout duration cannot exceed ${Math.round(maxDuration / 60)} hours.`,
    };
  }

  return {
    valid: true,
    duration: durationMinutes,
    isMidnightCrossing,
  };
}

/**
 * Formats duration in minutes into a clean, human-readable string.
 * Examples:
 * - 52  -> "52 min"
 * - 60  -> "1h"
 * - 72  -> "1h 12m"
 * - 135 -> "2h 15m"
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || isNaN(minutes) || minutes <= 0) {
    return '0 min';
  }

  const totalMin = Math.round(minutes);
  if (totalMin < 60) {
    return `${totalMin} min`;
  }

  const hours = Math.floor(totalMin / 60);
  const remainingMinutes = totalMin % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Formats a Date object or ISO string to a clean time string like "5:30 PM".
 */
export function formatTime(date: Date | string, timezone?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone || undefined,
    }).format(d);
  } catch {
    return format(d, 'h:mm a');
  }
}

/**
 * Formats a clean date string like "24 Sep 2026".
 */
export function formatWorkoutDate(date: Date | string, timezone?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: timezone || undefined,
    }).format(d);
  } catch {
    return format(d, 'd MMM yyyy');
  }
}

/**
 * Formats start and end times into a clean range string.
 * Example: "5:30 PM – 6:22 PM"
 * If start/end are missing, falls back to formatted completedAt.
 */
export function formatTimeRange(
  startTime?: Date | string | null,
  endTime?: Date | string | null,
  fallbackCompletedAt?: Date | string | null,
  timezone?: string
): string {
  if (startTime && endTime) {
    const startStr = formatTime(startTime, timezone);
    const endStr = formatTime(endTime, timezone);
    if (startStr && endStr) {
      return `${startStr} – ${endStr}`;
    }
  }

  if (fallbackCompletedAt) {
    return formatTime(fallbackCompletedAt, timezone);
  }

  return '';
}

/**
 * Formats seconds into HH:MM:SS or MM:SS for the active live workout timer.
 */
export function formatElapsedSeconds(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Helper to combine date string (YYYY-MM-DD) and time string (HH:mm) into a Date object.
 */
export function combineDateAndTime(
  dateStr: string,
  timeStr: string,
  addDays = 0
): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const date = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);
  if (addDays !== 0) {
    date.setDate(date.getDate() + addDays);
  }
  return date;
}
