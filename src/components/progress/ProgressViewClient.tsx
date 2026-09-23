'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { WorkoutFrequencyChart } from './WorkoutFrequencyChart';
import { WorkoutDurationChart } from './WorkoutDurationChart';
import { WeeklyDayDistributionChart, WorkoutTypeDistributionChart } from './WeeklyDayDistributionChart';
import { formatDateToTz } from '@/lib/analytics';
import { Clock, Dumbbell, Flame, Trophy, Activity, Target } from 'lucide-react';
import { format, subDays } from 'date-fns';

type TimeRange = '7d' | '30d' | '3m' | '6m' | '1y';

interface RawWorkout {
  id: string;
  type: string;
  duration: number;
  completedAt: string | Date;
}

interface ProgressViewClientProps {
  workouts: RawWorkout[];
  userTimezone: string;
  currentStreak: number;
  longestStreak: number;
  weeklyTarget: number;
}

export function ProgressViewClient({
  workouts,
  userTimezone,
  currentStreak,
  longestStreak,
  weeklyTarget,
}: ProgressViewClientProps) {
  const [range, setRange] = useState<TimeRange>('30d');

  const rangeDays = {
    '7d': 7,
    '30d': 30,
    '3m': 90,
    '6m': 180,
    '1y': 365,
  }[range];

  // Filter workouts by selected range
  const filteredWorkouts = useMemo(() => {
    const cutoff = subDays(new Date(), rangeDays);
    return workouts.filter((w) => new Date(w.completedAt) >= cutoff);
  }, [workouts, rangeDays]);

  // Aggregate stats in range
  const totalWorkouts = filteredWorkouts.length;
  const totalDuration = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  const uniqueActiveDays = new Set(
    filteredWorkouts.map((w) => formatDateToTz(new Date(w.completedAt), userTimezone))
  ).size;

  // Consistency Score
  const expectedDays = (Math.max(1, weeklyTarget) / 7) * rangeDays;
  const consistencyScore = Math.min(
    100,
    Math.round((uniqueActiveDays / Math.max(1, expectedDays)) * 100)
  );

  // Frequency & Duration charts data points
  const chartData = useMemo(() => {
    const numBuckets = range === '7d' ? 7 : range === '30d' ? 15 : 20;
    const bucketSizeDays = Math.max(1, Math.floor(rangeDays / numBuckets));

    const points: Array<{
      date: string;
      label: string;
      count: number;
      minutes: number;
    }> = [];

    const now = new Date();

    for (let i = numBuckets - 1; i >= 0; i--) {
      const start = subDays(now, (i + 1) * bucketSizeDays);
      const end = subDays(now, i * bucketSizeDays);

      const bucketWorkouts = workouts.filter((w) => {
        const d = new Date(w.completedAt);
        return d >= start && d <= end;
      });

      const count = bucketWorkouts.length;
      const minutes = bucketWorkouts.reduce((sum, w) => sum + w.duration, 0);
      const label = format(end, range === '7d' ? 'EEE' : 'MMM d');

      points.push({
        date: end.toISOString(),
        label,
        count,
        minutes,
      });
    }

    return points;
  }, [workouts, range, rangeDays]);

  // Day-of-week distribution (Mon - Sun)
  const dayDistribution = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // In JS: Sun=0, Mon=1, ..., Sat=6
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayMinutes = [0, 0, 0, 0, 0, 0, 0];

    for (const w of filteredWorkouts) {
      const d = new Date(w.completedAt);
      const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1; // Mon=0, Sun=6
      dayCounts[dayIndex]++;
      dayMinutes[dayIndex] += w.duration;
    }

    return days.map((day, i) => ({
      day,
      count: dayCounts[i],
      minutes: dayMinutes[i],
    }));
  }, [filteredWorkouts]);

  // Workout type distribution
  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const w of filteredWorkouts) {
      counts[w.type] = (counts[w.type] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / Math.max(1, totalWorkouts)) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredWorkouts, totalWorkouts]);

  return (
    <div className="space-y-6">
      {/* Date Range Selector Bar */}
      <div className="flex items-center justify-between gap-3 p-2 bg-card/60 border border-border rounded-xl">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Time Period
        </span>
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border text-xs">
          {(['7d', '30d', '3m', '6m', '1y'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                range === r
                  ? 'bg-card text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Workouts */}
        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Dumbbell className="w-3.5 h-3.5 text-cync-green" />
            <span>Total Workouts</span>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{totalWorkouts}</p>
          <span className="text-[11px] text-muted-foreground">in selected period</span>
        </Card>

        {/* Total Time */}
        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-cync-green" />
            <span>Total Active Time</span>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{totalDuration} min</p>
          <span className="text-[11px] text-muted-foreground">avg {avgDuration} min / workout</span>
        </Card>

        {/* Current & Longest Streak */}
        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="w-3.5 h-3.5 text-cync-orange" />
            <span>Current Streak</span>
          </div>
          <p className="text-2xl font-extrabold text-foreground">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </p>
          <span className="text-[11px] text-muted-foreground">longest: {longestStreak} days</span>
        </Card>

        {/* Consistency Score */}
        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="w-3.5 h-3.5 text-cync-green" />
            <span>Consistency</span>
          </div>
          <p className="text-2xl font-extrabold text-cync-green">{consistencyScore}%</p>
          <span className="text-[11px] text-muted-foreground">
            {uniqueActiveDays} active days of {Math.round(expectedDays)} target
          </span>
        </Card>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WorkoutFrequencyChart data={chartData} />
        <WorkoutDurationChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WeeklyDayDistributionChart data={dayDistribution} />
        <WorkoutTypeDistributionChart distribution={typeDistribution} />
      </div>
    </div>
  );
}

