import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { SettingsFormClient } from '@/components/settings/SettingsFormClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      timezone: true,
      primaryGoal: true,
      weeklyTarget: true,
      profilePrivate: true,
      workoutsPrivate: true,
      notifyWorkouts: true,
      notifyReactions: true,
      notifyNudges: true,
      notifyChallenges: true,
    },
  });

  if (!user) redirect('/login');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your account, preferences, notifications, and privacy.
        </p>
      </div>

      <SettingsFormClient user={user} />
    </div>
  );
}
