import React from 'react';
import { Card } from '../ui/Card';
import { Dumbbell, Clock, Users, Activity } from 'lucide-react';

interface SquadAnalyticsCardProps {
  totalWorkouts: number;
  totalMinutes: number;
  activeMembersCount: number;
  totalMembersCount: number;
  memberMinutes: Array<{
    name: string;
    minutes: number;
    workoutsCount: number;
  }>;
}

export function SquadAnalyticsCard({
  totalWorkouts,
  totalMinutes,
  activeMembersCount,
  totalMembersCount,
  memberMinutes,
}: SquadAnalyticsCardProps) {
  const maxMinutes = Math.max(...memberMinutes.map((m) => m.minutes), 60);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-base font-semibold text-foreground">Squad Analytics</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Shared collective activity for the current week.
          </p>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Dumbbell className="w-3.5 h-3.5 text-cync-green" />
            <span>Total Workouts</span>
          </div>
          <p className="text-lg font-bold text-foreground">{totalWorkouts}</p>
        </div>

        <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-cync-green" />
            <span>Total Time</span>
          </div>
          <p className="text-lg font-bold text-foreground">{totalMinutes} min</p>
        </div>

        <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Active Members</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {activeMembersCount} / {totalMembersCount}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Consistency</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {totalMembersCount > 0
              ? `${Math.round((activeMembersCount / totalMembersCount) * 100)}%`
              : '0%'}
          </p>
        </div>
      </div>

      {/* Neutral Comparison: Weekly Workout Minutes */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Weekly Workout Minutes Comparison
          </h4>
          <span className="text-[11px] text-muted-foreground">This week</span>
        </div>

        <div className="space-y-3">
          {memberMinutes.map((member) => {
            const percentage = Math.min(100, Math.round((member.minutes / maxMinutes) * 100));

            return (
              <div key={member.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">{member.name}</span>
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{member.minutes} min</strong> ({member.workoutsCount} {member.workoutsCount === 1 ? 'session' : 'sessions'})
                  </span>
                </div>
                {/* Clean minimal progress bar */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cync-green/80 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
