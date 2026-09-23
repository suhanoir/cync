import React from 'react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { NudgeButton } from './NudgeButton';
import { Flame, Check, Minus } from 'lucide-react';

export interface SquadMemberData {
  userId: string;
  name: string;
  username: string;
  avatar: string | null;
  role: string;
  currentStreak: number;
  weeklyWorkoutsCount: number;
  weeklyMinutes: number;
  todayWorkoutDuration: number | null;
  todayWorkoutType: string | null;
}

interface SquadMemberListProps {
  members: SquadMemberData[];
  currentUserId: string;
  squadId: string;
}

export function SquadMemberList({ members, currentUserId, squadId }: SquadMemberListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Members ({members.length})
        </h3>
        <span className="text-[11px] text-muted-foreground">Today&apos;s Status</span>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const hasWorkedOutToday = member.todayWorkoutDuration !== null;

          return (
            <div
              key={member.userId}
              className="flex items-center justify-between gap-4 p-4 hover:bg-muted/20 transition-colors"
            >
              {/* Member Profile */}
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={member.name} avatarUrl={member.avatar} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {member.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-muted text-muted-foreground rounded font-medium">
                        You
                      </span>
                    )}
                    {member.role === 'OWNER' && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded font-medium border border-emerald-500/20">
                        Owner
                      </span>
                    )}
                  </div>

                  {/* Streak & Weekly Stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {member.currentStreak > 0 ? (
                      <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{member.currentStreak} day streak</span>
                      </span>
                    ) : (
                      <span>0 streak</span>
                    )}
                    <span>•</span>
                    <span>{member.weeklyWorkoutsCount} workouts</span>
                    <span>•</span>
                    <span>{member.weeklyMinutes} min</span>
                  </div>
                </div>
              </div>

              {/* Status & Nudge Button */}
              <div className="flex items-center gap-3 shrink-0">
                {hasWorkedOutToday ? (
                  <Badge variant="green" size="md">
                    <Check className="w-3 h-3 text-cync-green" />
                    <span>
                      {member.todayWorkoutDuration} min
                      {member.todayWorkoutType ? ` • ${member.todayWorkoutType}` : ''}
                    </span>
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="md">
                    <Minus className="w-3 h-3 text-muted-foreground" />
                    <span>No workout</span>
                  </Badge>
                )}

                {!isCurrentUser && !hasWorkedOutToday && (
                  <NudgeButton
                    recipientId={member.userId}
                    recipientName={member.name}
                    squadId={squadId}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

