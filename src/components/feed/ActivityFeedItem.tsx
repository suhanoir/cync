import React from 'react';
import Link from 'next/link';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { ReactionPicker } from './ReactionPicker';
import { Clock, MapPin, Dumbbell, Flame, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedItemProps {
  workout: {
    id: string;
    type: string;
    duration: number;
    distance?: number | null;
    calories?: number | null;
    completedAt: string | Date;
    notes?: string | null;
    photo?: { storageReference: string } | null;
    user: {
      id: string;
      name: string;
      username: string;
      avatar?: string | null;
    };
    exercises?: { id: string }[];
    reactions: Array<{
      id: string;
      type: string;
      userId: string;
    }>;
  };
  currentUserId: string;
}

export function ActivityFeedItem({ workout, currentUserId }: ActivityFeedItemProps) {
  const relativeTime = formatDistanceToNow(new Date(workout.completedAt), {
    addSuffix: true,
  });

  return (
    <Card className="p-4 sm:p-5 space-y-3 hover:border-border/80 transition-colors">
      {/* Header: User & Timestamp */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={workout.user.name} avatarUrl={workout.user.avatar} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground">
                {workout.user.name}
              </span>
              <span className="text-[11px] text-muted-foreground">
                @{workout.user.username}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">{relativeTime}</span>
          </div>
        </div>

        <Link
          href={`/workouts/${workout.id}`}
          className="text-xs font-medium text-muted-foreground hover:text-cync-green transition-colors"
        >
          View details →
        </Link>
      </div>

      {/* Workout Overview Pill & Stats */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-foreground">
          Completed {workout.type}
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

        {workout.exercises && workout.exercises.length > 0 && (
          <Badge variant="neutral" size="sm">
            <Dumbbell className="w-3 h-3" />
            <span>{workout.exercises.length} exercises</span>
          </Badge>
        )}
      </div>

      {/* Notes if present */}
      {workout.notes && (
        <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/60 leading-relaxed">
          &ldquo;{workout.notes}&rdquo;
        </p>
      )}

      {/* Proof Photo if present */}
      {workout.photo && (
        <div className="rounded-lg overflow-hidden border border-border max-w-xs">
          <img
            src={workout.photo.storageReference}
            alt="Workout proof"
            className="w-full h-36 object-cover"
          />
        </div>
      )}

      {/* Social Reactions Footer */}
      <div className="pt-2 border-t border-border flex items-center justify-between">
        <ReactionPicker
          workoutId={workout.id}
          reactions={workout.reactions}
          currentUserId={currentUserId}
        />
      </div>
    </Card>
  );
}

