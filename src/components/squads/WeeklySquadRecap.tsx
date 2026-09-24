import React from 'react';
import { Card } from '../ui/Card';
import { QuoteBlock } from '../ui/QuoteBlock';
import { Dumbbell, Clock, Users } from 'lucide-react';

interface WeeklySquadRecapProps {
  squadName: string;
  totalWorkouts: number;
  totalMinutes: number;
  activeMembersCount: number;
  totalMembersCount: number;
}

export function WeeklySquadRecap({
  squadName,
  totalWorkouts,
  totalMinutes,
  activeMembersCount,
  totalMembersCount,
}: WeeklySquadRecapProps) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

  return (
    <Card className="p-5 space-y-4 bg-card border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
        <div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Weekly Collective Recap
          </span>
          <h3 className="text-base font-bold text-foreground">
            {squadName} This Week
          </h3>
        </div>

        <QuoteBlock variant="minimal" quote="Show up together." />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Dumbbell className="w-3.5 h-3.5 text-cync-green" />
            <span>Workouts</span>
          </div>
          <p className="text-xl font-bold text-foreground">{totalWorkouts}</p>
          <span className="text-[10px] text-muted-foreground block">completed</span>
        </div>

        <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-cync-green" />
            <span>Active Time</span>
          </div>
          <p className="text-xl font-bold text-foreground">{timeFormatted}</p>
          <span className="text-[10px] text-muted-foreground block">total volume</span>
        </div>

        <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5 text-cync-green" />
            <span>Showed Up</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {activeMembersCount}/{totalMembersCount}
          </p>
          <span className="text-[10px] text-muted-foreground block">members active</span>
        </div>
      </div>
    </Card>
  );
}

