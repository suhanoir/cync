import React from 'react';
import { DayActivityStatus } from '@/lib/types';
import { Card } from '../ui/Card';
import { QuoteBlock } from '../ui/QuoteBlock';

interface WeeklyDotsProps {
  days: DayActivityStatus[];
}

export function WeeklyDots({ days }: WeeklyDotsProps) {
  const activeDaysCount = days.filter((d) => d.hasActivity).length;

  return (
    <Card className="p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Weekly Overview
          </h3>
          <span className="text-xs font-semibold text-foreground">
            {activeDaysCount} of 7 days active
          </span>
        </div>

        <QuoteBlock variant="minimal" quote="Small steps. Every single day." />
      </div>

      {/* Mon - Sun Dot Row */}
      <div className="grid grid-cols-7 gap-2 pt-1">
        {days.map((d) => (
          <div
            key={d.dayShort}
            className="flex flex-col items-center gap-2 group cursor-default"
          >
            {/* Day name */}
            <span
              className={`text-[11px] font-medium transition-colors ${
                d.isToday
                  ? 'text-foreground font-bold'
                  : 'text-muted-foreground group-hover:text-foreground'
              }`}
            >
              {d.dayShort}
            </span>

            {/* Dot indicator */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                d.hasActivity
                  ? 'bg-cync-green text-white shadow-xs'
                  : d.isToday
                  ? 'border-2 border-dashed border-cync-green/60 bg-muted/30'
                  : 'bg-muted/40 border border-border'
              }`}
              title={`${d.dayName}: ${
                d.hasActivity
                  ? `${d.workoutCount} workout(s), ${d.totalDuration} min`
                  : 'No activity'
              }`}
            >
              {d.hasActivity ? (
                <span className="w-2 h-2 rounded-full bg-white" />
              ) : d.isToday ? (
                <span className="w-1.5 h-1.5 rounded-full bg-cync-green" />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
