import { DayActivityStatus } from './types';

/**
 * Format a Date object to YYYY-MM-DD based on a specific timezone
 */
export function formatDateToTz(date: Date, timezone: string = 'UTC'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    // Fallback if timezone string is invalid
    return date.toISOString().split('T')[0];
  }
}

/**
 * Get date string offset from today in days (e.g. -1 is yesterday)
 */
export function getDateOffsetStr(offsetDays: number, timezone: string = 'UTC'): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateToTz(d, timezone);
}

/**
 * Calculates current streak and longest streak accurately
 * A streak day is counted if at least one workout occurred on that local date.
 * If user hasn't worked out yet today, current streak remains active if they worked out yesterday.
 */
export function calculateStreaks(
  workoutDates: Date[],
  userTimezone: string = 'UTC'
): { currentStreak: number; longestStreak: number; workedOutToday: boolean } {
  if (!workoutDates || workoutDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, workedOutToday: false };
  }

  // Deduplicate and sort dates ascending (YYYY-MM-DD)
  const uniqueDateSet = new Set<string>();
  for (const d of workoutDates) {
    uniqueDateSet.add(formatDateToTz(new Date(d), userTimezone));
  }

  const sortedDates = Array.from(uniqueDateSet).sort();
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, workedOutToday: false };
  }

  // Calculate Longest Streak
  let longestStreak = 1;
  let runningStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1] + 'T00:00:00Z');
    const curr = new Date(sortedDates[i] + 'T00:00:00Z');
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 1;
    }
  }

  // Calculate Current Streak
  const todayStr = formatDateToTz(new Date(), userTimezone);
  const yesterdayStr = getDateOffsetStr(-1, userTimezone);

  const workedOutToday = uniqueDateSet.has(todayStr);
  const workedOutYesterday = uniqueDateSet.has(yesterdayStr);

  let currentStreak = 0;

  if (workedOutToday || workedOutYesterday) {
    // Walk backwards starting from the latest active anchor (today or yesterday)
    let checkOffset = workedOutToday ? 0 : -1;
    while (true) {
      const targetDateStr = getDateOffsetStr(checkOffset, userTimezone);
      if (uniqueDateSet.has(targetDateStr)) {
        currentStreak++;
        checkOffset--;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    workedOutToday,
  };
}

/**
 * Consistency Score:
 * Transparent, non-medical score calculated over a rolling 30-day window.
 * Compares active workout days against target frequency:
 * expectedDays = (weeklyTarget / 7) * 30
 * score = Math.min(100, Math.round((activeDays / expectedDays) * 100))
 */
export function calculateConsistencyScore(
  activeDays30d: number,
  weeklyTarget: number = 4
): { score: number; explanation: string } {
  const safeWeeklyTarget = Math.max(1, Math.min(7, weeklyTarget));
  const expectedDays = (safeWeeklyTarget / 7) * 30;
  const score = Math.min(100, Math.max(0, Math.round((activeDays30d / expectedDays) * 100)));

  let explanation = 'Based on your recent workout frequency and consistency over the past 30 days.';
  if (score >= 90) {
    explanation = 'Exceptional consistency. You are reliably hitting your weekly targets.';
  } else if (score >= 70) {
    explanation = 'Solid momentum. Keep showing up to maintain and grow your streak.';
  } else if (score > 0) {
    explanation = 'Building momentum. Log consistent workouts each week to increase your score.';
  } else {
    explanation = 'No logged workouts in the last 30 days. Log your next session to begin.';
  }

  return { score, explanation };
}

/**
 * Returns Monday - Sunday activity status for the current calendar week
 */
export function getWeeklyOverview(
  workouts: { completedAt: Date; duration: number }[],
  userTimezone: string = 'UTC'
): DayActivityStatus[] {
  const now = new Date();
  const todayStr = formatDateToTz(now, userTimezone);

  // Determine Monday of current week
  // Sunday is 0, Monday is 1, ..., Saturday is 6
  const currentDayOfWeek = now.getDay();
  // In Monday-first week: Mon=0, Tue=1, ..., Sun=6
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() + mondayOffset);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayShorts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const days: DayActivityStatus[] = [];

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(mondayDate);
    targetDate.setDate(mondayDate.getDate() + i);
    const dateStr = formatDateToTz(targetDate, userTimezone);

    const dayWorkouts = workouts.filter(
      (w) => formatDateToTz(new Date(w.completedAt), userTimezone) === dateStr
    );

    const totalDuration = dayWorkouts.reduce((acc, curr) => acc + curr.duration, 0);

    days.push({
      dayName: dayNames[i],
      dayShort: dayShorts[i],
      dateStr,
      isToday: dateStr === todayStr,
      hasActivity: dayWorkouts.length > 0,
      totalDuration,
      workoutCount: dayWorkouts.length,
    });
  }

  return days;
}
