import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { calculateStreaks } from '@/lib/analytics';
import { GoalsViewClient } from '@/components/goals/GoalsViewClient';

export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const goals = await db.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const allWorkouts = await db.workout.findMany({
    where: { userId: user.id },
    select: {
      completedAt: true,
      duration: true,
    },
  });

  // Calculate Monday of current week for weekly goals
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + mondayOffset);
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekWorkouts = allWorkouts.filter(
    (w) => new Date(w.completedAt) >= startOfWeek
  );

  const thisWeekWorkoutCount = thisWeekWorkouts.length;
  const thisWeekMinutes = thisWeekWorkouts.reduce((sum, w) => sum + w.duration, 0);

  const workoutDates = allWorkouts.map((w) => new Date(w.completedAt));
  const { currentStreak } = calculateStreaks(workoutDates, user.timezone || 'UTC');

  const goalsWithProgress = goals.map((goal) => {
    let current = 0;
    if (goal.type === 'WORKOUTS_PER_WEEK') {
      current = thisWeekWorkoutCount;
    } else if (goal.type === 'WORKOUT_MINUTES') {
      current = thisWeekMinutes;
    } else if (goal.type === 'STREAK_DAYS') {
      current = currentStreak;
    }

    const percentage = Math.min(100, Math.round((current / Math.max(1, goal.target)) * 100));

    return {
      id: goal.id,
      title: goal.title,
      type: goal.type,
      target: goal.target,
      current,
      percentage,
      status: goal.status,
    };
  });

  return <GoalsViewClient goals={goalsWithProgress} />;
}

