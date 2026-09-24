import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { calculateStreaks } from '@/lib/analytics';
import { ProgressViewClient } from '@/components/progress/ProgressViewClient';
import { QuoteBlock } from '@/components/ui/QuoteBlock';

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const workouts = await db.workout.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      type: true,
      duration: true,
      completedAt: true,
    },
    orderBy: { completedAt: 'asc' },
  });

  const workoutDates = workouts.map((w) => new Date(w.completedAt));
  const { currentStreak, longestStreak } = calculateStreaks(
    workoutDates,
    user.timezone || 'UTC'
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Progress & Analytics</h1>
          <QuoteBlock variant="minimal" quote="Consistency compounds." />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real metrics derived from your logged sessions. No hardcoded or fabricated statistics.
        </p>
      </div>

      <ProgressViewClient
        workouts={workouts}
        userTimezone={user.timezone || 'UTC'}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        weeklyTarget={user.weeklyTarget || 4}
      />
    </div>
  );
}
