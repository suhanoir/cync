import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { WorkoutDetailClient } from '@/components/workouts/WorkoutDetailClient';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { format } from 'date-fns';
import { Clock, Flame, MapPin, Dumbbell, Calendar, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WorkoutDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const workout = await db.workout.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { id: true, name: true, username: true, avatar: true },
      },
      exercises: true,
      photo: true,
      squad: {
        select: { id: true, name: true },
      },
      reactions: {
        include: {
          user: {
            select: { id: true, name: true, username: true },
          },
        },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  const isOwner = workout.userId === user.id;

  // Fetch squads user belongs to for edit modal
  const memberships = await db.squadMember.findMany({
    where: { userId: user.id },
    include: { squad: { select: { id: true, name: true } } },
  });
  const squads = memberships.map((m) => m.squad);

  const completedDate = new Date(workout.completedAt);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Controls */}
      <WorkoutDetailClient
        workout={workout}
        isOwner={isOwner}
        squads={squads}
      />

      {/* Main Workout Header Card */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="green" size="md">
                {workout.type}
              </Badge>
              {workout.squad && (
                <Badge variant="neutral" size="md">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{workout.squad.name}</span>
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {workout.type} Session
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(completedDate, 'EEEE, MMMM d, yyyy • h:mm a')}</span>
            </div>
          </div>

          {/* User attribution if viewing friend's workout */}
          {!isOwner && (
            <div className="flex items-center gap-2.5 p-2 bg-muted/40 rounded-lg border border-border">
              <Avatar name={workout.user.name} avatarUrl={workout.user.avatar} size="sm" />
              <div className="text-xs">
                <span className="font-semibold text-foreground block">{workout.user.name}</span>
                <span className="text-muted-foreground">@{workout.user.username}</span>
              </div>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-cync-green" />
              <span>Duration</span>
            </div>
            <p className="text-lg font-bold text-foreground">{workout.duration} min</p>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Flame className="w-3.5 h-3.5 text-cync-orange" />
              <span>Calories</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {workout.calories ? `${workout.calories} kcal` : '—'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Distance</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {workout.distance ? `${workout.distance} km` : '—'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Dumbbell className="w-3.5 h-3.5 text-cync-gray-light" />
              <span>Exercises</span>
            </div>
            <p className="text-lg font-bold text-foreground">{workout.exercises.length}</p>
          </div>
        </div>

        {/* Exercises Table */}
        {workout.exercises.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Exercise Log
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Exercise</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Sets</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Reps</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Weight (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {workout.exercises.map((ex) => (
                    <tr key={ex.id} className="hover:bg-muted/20">
                      <td className="py-2.5 px-4 font-medium text-foreground">
                        {ex.exerciseName}
                      </td>
                      <td className="py-2.5 px-4 text-center text-muted-foreground">
                        {ex.sets ?? '—'}
                      </td>
                      <td className="py-2.5 px-4 text-center text-muted-foreground">
                        {ex.reps ?? '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-foreground">
                        {ex.weight ? `${ex.weight} kg` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes */}
        {workout.notes && (
          <div className="space-y-2 pt-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Notes
            </h2>
            <p className="text-xs text-foreground bg-muted/30 border border-border p-3.5 rounded-lg leading-relaxed whitespace-pre-wrap">
              {workout.notes}
            </p>
          </div>
        )}

        {/* Proof Photo */}
        {workout.photo && (
          <div className="space-y-2 pt-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Proof Photo
            </h2>
            <div className="rounded-xl overflow-hidden border border-border max-w-md">
              <img
                src={workout.photo.storageReference}
                alt="Workout proof"
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
          </div>
        )}

        {/* Squad Reactions */}
        {workout.reactions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Squad Reactions ({workout.reactions.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {workout.reactions.map((r) => {
                const emoji =
                  r.type === 'fire'
                    ? '🔥'
                    : r.type === 'muscle'
                    ? '💪'
                    : r.type === 'clap'
                    ? '👏'
                    : '⚡';
                return (
                  <span
                    key={r.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border text-xs"
                  >
                    <span>{emoji}</span>
                    <span className="font-medium text-foreground">{r.user.name}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
