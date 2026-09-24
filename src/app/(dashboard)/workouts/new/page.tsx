import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { NewWorkoutClient } from '@/components/workouts/NewWorkoutClient';

export const dynamic = 'force-dynamic';

export default async function NewWorkoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Fetch squads user belongs to
  const memberships = await db.squadMember.findMany({
    where: { userId: user.id },
    include: {
      squad: {
        select: { id: true, name: true },
      },
    },
  });

  const squads = memberships.map((m) => m.squad);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Log Workout</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Record your start and end times or track live. Duration is calculated automatically.
        </p>
      </div>

      <NewWorkoutClient squads={squads} />
    </div>
  );
}
