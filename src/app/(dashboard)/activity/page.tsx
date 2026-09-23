import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ActivityFilterList } from '@/components/workouts/ActivityFilterList';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const workouts = await db.workout.findMany({
    where: { userId: user.id },
    include: {
      exercises: { select: { id: true } },
      photo: { select: { storageReference: true } },
      squad: { select: { name: true } },
      reactions: { select: { type: true } },
    },
    orderBy: { completedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Activity History</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Every session you have shown up for. Filter and inspect workout details.
          </p>
        </div>

        <Link
          href="/workouts/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cync-green hover:bg-cync-green-muted text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Log Workout</span>
        </Link>
      </div>

      {/* Interactive Filter & List */}
      <ActivityFilterList workouts={workouts} />
    </div>
  );
}

