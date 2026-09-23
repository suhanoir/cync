import React from 'react';
import Link from 'next/link';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Clock, Flame, MapPin, Dumbbell, Image, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface WorkoutCardProps {
  workout: {
    id: string;
    type: string;
    duration: number;
    distance?: number | null;
    calories?: number | null;
    completedAt: Date | string;
    notes?: string | null;
    photo?: { storageReference: string } | null;
    exercises?: { id: string }[];
    squad?: { name: string } | null;
    reactions?: { type: string }[];
  };
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const completedDate = new Date(workout.completedAt);
  const exerciseCount = workout.exercises?.length || 0;

  return (
    <Link href={`/workouts/${workout.id}`} className="block group">
      <Card className="p-4 sm:p-5 hover:border-cync-green/40 hover:bg-muted/20 transition-all duration-150">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            {/* Top Row: Type & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-foreground group-hover:text-cync-green transition-colors">
                {workout.type}
              </span>

              <Badge variant="green" size="sm">
                <Clock className="w-3 h-3" />
                <span>{workout.duration} min</span>
              </Badge>

              {workout.distance && (
                <Badge variant="neutral" size="sm">
                  <MapPin className="w-3 h-3" />
                  <span>{workout.distance} km</span>
                </Badge>
              )}

              {workout.calories && (
                <Badge variant="orange" size="sm">
                  <Flame className="w-3 h-3" />
                  <span>{workout.calories} kcal</span>
                </Badge>
              )}

              {exerciseCount > 0 && (
                <Badge variant="neutral" size="sm">
                  <Dumbbell className="w-3 h-3" />
                  <span>{exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}</span>
                </Badge>
              )}

              {workout.photo && (
                <Badge variant="neutral" size="sm" title="Proof photo attached">
                  <Image className="w-3 h-3 text-cync-green" />
                  <span>Proof</span>
                </Badge>
              )}

              {workout.squad && (
                <Badge variant="neutral" size="sm">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span>{workout.squad.name}</span>
                </Badge>
              )}
            </div>

            {/* Notes snippet */}
            {workout.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {workout.notes}
              </p>
            )}

            {/* Reactions preview */}
            {workout.reactions && workout.reactions.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                {Array.from(new Set(workout.reactions.map((r) => r.type))).map((type) => {
                  const emoji =
                    type === 'fire'
                      ? '🔥'
                      : type === 'muscle'
                      ? '💪'
                      : type === 'clap'
                      ? '👏'
                      : '⚡';
                  const count = workout.reactions!.filter((r) => r.type === type).length;
                  return (
                    <span
                      key={type}
                      className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full bg-muted/60 border border-border"
                    >
                      <span>{emoji}</span>
                      <span className="text-[10px] text-muted-foreground">{count}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right side: Date and arrow */}
          <div className="flex items-center gap-2 text-right shrink-0">
            <div className="text-right">
              <span className="block text-xs font-medium text-foreground">
                {format(completedDate, 'MMM d')}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {format(completedDate, 'h:mm a')}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-cync-green transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

