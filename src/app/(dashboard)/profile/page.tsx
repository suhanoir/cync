import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { calculateStreaks, formatDateToTz } from '@/lib/analytics';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { QuoteBlock } from '@/components/ui/QuoteBlock';
import {
  Settings,
  Flame,
  Clock,
  Dumbbell,
  Calendar,
  Users,
  Target,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Fetch all user workouts
  const workouts = await db.workout.findMany({
    where: { userId: user.id },
    select: {
      duration: true,
      completedAt: true,
    },
  });

  const workoutDates = workouts.map((w) => new Date(w.completedAt));
  const { currentStreak, longestStreak } = calculateStreaks(
    workoutDates,
    user.timezone || 'UTC'
  );

  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  const activeDays = new Set(
    workouts.map((w) => formatDateToTz(new Date(w.completedAt), user.timezone || 'UTC'))
  ).size;

  // Fetch squads
  const memberships = await db.squadMember.findMany({
    where: { userId: user.id },
    include: {
      squad: {
        select: { id: true, name: true, _count: { select: { members: true } } },
      },
    },
  });

  // Fetch goals
  const goals = await db.goal.findMany({
    where: { userId: user.id, status: 'ACTIVE' },
    take: 3,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar name={user.name} avatarUrl={user.avatar} size="xl" />
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{user.name}</h1>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
              {user.bio && (
                <p className="text-xs text-muted-foreground pt-1 max-w-sm leading-relaxed">
                  {user.bio}
                </p>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                {user.primaryGoal && (
                  <Badge variant="green" size="sm">
                    {user.primaryGoal}
                  </Badge>
                )}
                <Badge variant="neutral" size="sm">
                  {user.weeklyTarget} days/wk target
                </Badge>
              </div>
            </div>
          </div>

          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-medium transition-colors shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </Card>

      {/* Aggregate Lifetime Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="w-3.5 h-3.5 text-cync-orange" />
            <span>Streak</span>
          </div>
          <p className="text-xl font-bold text-foreground">{currentStreak} days</p>
          <span className="text-[10px] text-muted-foreground">longest: {longestStreak}d</span>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Dumbbell className="w-3.5 h-3.5 text-cync-green" />
            <span>Workouts</span>
          </div>
          <p className="text-xl font-bold text-foreground">{totalWorkouts}</p>
          <span className="text-[10px] text-muted-foreground">all-time logged</span>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Active Days</span>
          </div>
          <p className="text-xl font-bold text-foreground">{activeDays}</p>
          <span className="text-[10px] text-muted-foreground">unique calendar dates</span>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Total Time</span>
          </div>
          <p className="text-xl font-bold text-foreground">{totalMinutes} min</p>
          <span className="text-[10px] text-muted-foreground">accumulated effort</span>
        </Card>
      </div>

      {/* Signature Cursive Reflection */}
      <QuoteBlock
        variant="banner"
        quote="Becoming takes time."
        className="border-border/30 my-2"
      />

      {/* Squads List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your Squads ({memberships.length})
          </h2>
          <Link
            href="/squads"
            className="text-xs font-medium text-muted-foreground hover:text-cync-green transition-colors"
          >
            All squads →
          </Link>
        </div>

        {memberships.length === 0 ? (
          <Card className="p-5 text-center text-xs text-muted-foreground">
            You are not in any squads yet.{' '}
            <Link href="/squads/new" className="text-cync-green font-medium hover:underline">
              Create a squad
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {memberships.map(({ squad, role }) => (
              <Link key={squad.id} href={`/squads/${squad.id}`} className="block group">
                <Card className="p-4 hover:border-cync-green/40 hover:bg-muted/20 transition-all flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-foreground group-hover:text-cync-green transition-colors block">
                      {squad.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {squad._count.members} {squad._count.members === 1 ? 'member' : 'members'} • {role.toLowerCase()}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cync-green transition-all" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Active Goals Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active Goals ({goals.length})
          </h2>
          <Link
            href="/goals"
            className="text-xs font-medium text-muted-foreground hover:text-cync-green transition-colors"
          >
            Manage goals →
          </Link>
        </div>

        {goals.length === 0 ? (
          <Card className="p-5 text-center text-xs text-muted-foreground">
            No active goals.{' '}
            <Link href="/goals" className="text-cync-green font-medium hover:underline">
              Set a personal goal
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {goals.map((g) => (
              <Card key={g.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-cync-green shrink-0" />
                  <span className="text-xs font-medium text-foreground">{g.title}</span>
                </div>
                <span className="text-xs text-muted-foreground font-semibold">
                  Target: {g.target}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

