'use client';

import React from 'react';
import { Card } from '../ui/Card';

interface DayDistributionProps {
  data: Array<{
    day: string;
    count: number;
    minutes: number;
  }>;
}

export function WeeklyDayDistributionChart({ data }: DayDistributionProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalWorkouts = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Day-of-Week Activity</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Which days you show up most consistently</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-2">
        {data.map((d) => {
          const heightPercent = totalWorkouts > 0 ? (d.count / maxCount) * 100 : 0;

          return (
            <div key={d.day} className="flex flex-col items-center gap-2">
              <div className="w-full h-24 bg-muted/40 rounded-lg p-1 flex items-end justify-center">
                <div
                  className="w-full bg-cync-green/80 hover:bg-cync-green rounded-md transition-all duration-300"
                  style={{ height: `${Math.max(heightPercent, d.count > 0 ? 12 : 0)}%` }}
                  title={`${d.day}: ${d.count} workouts (${d.minutes} min)`}
                />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{d.day}</span>
              <span className="text-[10px] font-bold text-foreground">{d.count}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

interface TypeDistributionProps {
  distribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export function WorkoutTypeDistributionChart({ distribution }: TypeDistributionProps) {
  if (distribution.length === 0) {
    return (
      <Card className="p-6 text-center space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Workout Type Distribution</h4>
        <p className="text-xs text-muted-foreground">
          No workout types logged yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Workout Type Distribution</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Diversity of your training regimen</p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {distribution.map((item) => (
          <div key={item.type} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{item.type}</span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{item.count}</strong> ({item.percentage}%)
              </span>
            </div>
            <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

