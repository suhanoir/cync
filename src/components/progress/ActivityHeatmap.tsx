'use client';

import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { QuoteBlock } from '../ui/QuoteBlock';
import { formatDateToTz } from '@/lib/analytics';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';

interface RawWorkout {
  id: string;
  type: string;
  duration: number;
  completedAt: string | Date;
}

interface ActivityHeatmapProps {
  workouts: RawWorkout[];
  userTimezone: string;
}

export function ActivityHeatmap({ workouts, userTimezone }: ActivityHeatmapProps) {
  // Build 12-week matrix ending today
  const { weeks, totalActiveDays, streakDays } = useMemo(() => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday

    // Map workout dates to counts and durations
    const workoutMap: Record<string, { count: number; minutes: number }> = {};

    for (const w of workouts) {
      const dayStr = formatDateToTz(new Date(w.completedAt), userTimezone);
      if (!workoutMap[dayStr]) {
        workoutMap[dayStr] = { count: 0, minutes: 0 };
      }
      workoutMap[dayStr].count += 1;
      workoutMap[dayStr].minutes += w.duration;
    }

    const weeksList: Array<Array<{
      date: Date;
      dateStr: string;
      count: number;
      minutes: number;
      isFuture: boolean;
    }>> = [];

    // 12 weeks back
    for (let w = 11; w >= 0; w--) {
      const weekStart = subDays(currentWeekStart, w * 7);
      const days = [];

      for (let d = 0; d < 7; d++) {
        const dayDate = addDays(weekStart, d);
        const dayStr = formatDateToTz(dayDate, userTimezone);
        const data = workoutMap[dayStr] || { count: 0, minutes: 0 };
        const isFuture = dayDate > today && !isSameDay(dayDate, today);

        days.push({
          date: dayDate,
          dateStr: dayStr,
          count: data.count,
          minutes: data.minutes,
          isFuture,
        });
      }

      weeksList.push(days);
    }

    const activeDaysCount = Object.keys(workoutMap).length;

    return {
      weeks: weeksList,
      totalActiveDays: activeDaysCount,
      streakDays: activeDaysCount,
    };
  }, [workouts, userTimezone]);

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Activity Calendar</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Your 12-week showing-up rhythm across each day.
          </p>
        </div>
        <QuoteBlock variant="minimal" quote="Consistency compounds." />
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex gap-1.5 min-w-full justify-between items-center sm:justify-start">
          {/* Day of Week Labels */}
          <div className="flex flex-col gap-1.5 mr-1 text-[9px] font-semibold text-muted-foreground/60 select-none">
            {dayLabels.map((label, idx) => (
              <span key={idx} className="w-3.5 h-3.5 flex items-center justify-center">
                {idx % 2 === 0 ? label : ''}
              </span>
            ))}
          </div>

          {/* Week Columns */}
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day, dIdx) => {
                if (day.isFuture) {
                  return (
                    <div
                      key={dIdx}
                      className="w-3.5 h-3.5 rounded-[3px] bg-transparent opacity-0 pointer-events-none"
                    />
                  );
                }

                let colorClass = 'bg-muted/40 border border-border/40';
                if (day.count === 1) {
                  colorClass = 'bg-emerald-500/60 border border-emerald-500/80 shadow-xs';
                } else if (day.count >= 2) {
                  colorClass = 'bg-cync-green border border-emerald-400 shadow-xs';
                }

                const tooltip = day.count > 0
                  ? `${format(day.date, 'EEE, MMM d')}: ${day.count} ${day.count === 1 ? 'workout' : 'workouts'} (${day.minutes} min)`
                  : `${format(day.date, 'EEE, MMM d')}: No workout`;

                return (
                  <div
                    key={dIdx}
                    title={tooltip}
                    className={`w-3.5 h-3.5 rounded-[3px] ${colorClass} hover:ring-1 hover:ring-cync-green transition-all cursor-pointer`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Footer Legend */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
        <span>
          <strong className="text-foreground">{totalActiveDays}</strong> active {totalActiveDays === 1 ? 'day' : 'days'} logged
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted/40 border border-border/40" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500/60 border border-emerald-500/80" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-cync-green border border-emerald-400" />
          <span className="text-[10px]">More</span>
        </div>
      </div>
    </Card>
  );
}

