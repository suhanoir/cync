import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { calculateStreaks, getWeeklyOverview, formatDateToTz } from '@/lib/analytics';
import { WeeklyDots } from '@/components/dashboard/WeeklyDots';
import { ActivityFeedItem } from '@/components/feed/ActivityFeedItem';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Target,
  ArrowRight,
  Minus,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function getGreeting(timezone: string): string {
  try {
    const hour = new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: 'numeric',
    });
    const h = parseInt(hour, 10);
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  } catch {
    return 'Welcome back';
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const greeting = getGreeting(user.timezone || 'UTC');

  // Fetch all workouts of user
  const userWorkouts = await db.workout.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      type: true,
      duration: true,
      completedAt: true,
    },
    orderBy: { completedAt: 'desc' },
  });

  const workoutDates = userWorkouts.map((w) => new Date(w.completedAt));
  const { currentStreak, longestStreak } = calculateStreaks(
    workoutDates,
    user.timezone || 'UTC'
  );

  const todayStr = formatDateToTz(new Date(), user.timezone || 'UTC');
  const todayWorkout = userWorkouts.find(
    (w) => formatDateToTz(new Date(w.completedAt), user.timezone || 'UTC') === todayStr
  );

  // Weekly overview
  const weeklyDays = getWeeklyOverview(userWorkouts, user.timezone || 'UTC');
  const thisWeekCount = weeklyDays.filter((d) => d.hasActivity).length;
  const weeklyTarget = user.weeklyTarget || 4;

  // Primary squad snapshot
  const primaryMembership = await db.squadMember.findFirst({
    where: { userId: user.id },
    include: {
      squad: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true,
                  timezone: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const squad = primaryMembership?.squad || null;

  // Member today status for primary squad
  let squadMembersSnapshot: Array<{
    userId: string;
    name: string;
    avatar: string | null;
    currentStreak: number;
    hasWorkedOutToday: boolean;
    duration: number | null;
    type: string | null;
  }> = [];

  let feedWorkouts: any[] = [];

  if (squad) {
    const memberIds = squad.members.map((m) => m.userId);

    const memberWorkouts = await db.workout.findMany({
      where: { userId: { in: memberIds } },
      select: {
        userId: true,
        type: true,
        duration: true,
        completedAt: true,
      },
    });

    squadMembersSnapshot = squad.members.map((m) => {
      const uWorkouts = memberWorkouts.filter((w) => w.userId === m.userId);
      const uDates = uWorkouts.map((w) => new Date(w.completedAt));
      const { currentStreak: uStreak } = calculateStreaks(
        uDates,
        m.user.timezone || 'UTC'
      );

      const mToday = uWorkouts.find(
        (w) =>
          formatDateToTz(new Date(w.completedAt), m.user.timezone || 'UTC') === todayStr
      );

      return {
        userId: m.userId,
        name: m.user.name,
        avatar: m.user.avatar,
        currentStreak: uStreak,
        hasWorkedOutToday: Boolean(mToday),
        duration: mToday?.duration || null,
        type: mToday?.type || null,
      };
    });

    // Recent activity feed from squad
    feedWorkouts = await db.workout.findMany({
      where: {
        OR: [
          { squadId: squad.id },
          { userId: { in: memberIds } },
        ],
      },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        photo: { select: { storageReference: true } },
        exercises: { select: { id: true } },
        reactions: { select: { id: true, type: true, userId: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 6,
    });
  } else {
    // If no squad, show user's own workouts in feed
    feedWorkouts = await db.workout.findMany({
      where: { userId: user.id },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        photo: { select: { storageReference: true } },
        exercises: { select: { id: true } },
        reactions: { select: { id: true, type: true, userId: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 6,
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting}, {user.name}.
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consistency is quiet momentum. Here is where you and your squad stand today.
          </p>
        </div>

        <Link
          href="/workouts/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cync-green hover:bg-cync-green-muted text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Log Workout</span>
        </Link>
      </div>

      {/* 2. Today's Status & Streak Hero Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Today&apos;s Status
            </span>

            {todayWorkout ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cync-green" />
                  <h2 className="text-xl font-bold text-foreground">
                    Workout completed
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  {todayWorkout.duration} min • {todayWorkout.type}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  No workout logged yet today
                </h2>
                <p className="text-xs text-muted-foreground">
                  Keep your streak alive. Even 20 minutes counts.
                </p>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 sm:gap-8 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-8 w-full md:w-auto">
            {/* Streak */}
            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground block">Streak</span>
              <div className="flex items-center gap-1.5 text-amber-500 font-extrabold text-xl">
                <Flame className="w-5 h-5" />
                <span>{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</span>
              </div>
            </div>

            {/* Weekly Target Progress */}
            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground block">Weekly Target</span>
              <div className="flex items-center gap-1.5 font-extrabold text-xl text-foreground">
                <span>
                  {thisWeekCount} / {weeklyTarget}
                </span>
                <span className="text-xs font-normal text-muted-foreground">sessions</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Grid: Weekly Overview & Squad Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Overview Dots */}
        <WeeklyDots days={weeklyDays} />

        {/* Primary Squad Snapshot */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {squad ? squad.name : 'Squad Snapshot'}
            </h3>
            {squad && (
              <Link
                href={`/squads/${squad.id}`}
                className="text-xs font-medium text-muted-foreground hover:text-cync-green transition-colors"
              >
                View squad →
              </Link>
            )}
          </div>

          {squad ? (
            <div className="divide-y divide-border/60">
              {squadMembersSnapshot.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between py-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={member.name} avatarUrl={member.avatar} size="sm" />
                    <div>
                      <span className="font-semibold text-foreground block">
                        {member.name}
                        {member.userId === user.id && ' (You)'}
                      </span>
                      {member.currentStreak > 0 && (
                        <span className="text-[10px] text-amber-500 font-medium">
                          🔥 {member.currentStreak}d streak
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {member.hasWorkedOutToday ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[11px]">
                        ✓ {member.duration} min
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px]">
                        — No workout
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                You haven&apos;t joined a squad yet. Squads keep you and your friends accountable.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Link
                  href="/squads/new"
                  className="px-3 py-1.5 bg-cync-green hover:bg-cync-green-muted text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Create Squad
                </Link>
                <Link
                  href="/squads/join"
                  className="px-3 py-1.5 border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold rounded-lg transition-colors"
                >
                  Join with Code
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 4. Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/workouts/new"
          className="p-3.5 rounded-xl border border-border bg-card hover:border-cync-green/40 hover:bg-muted/30 transition-all flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-cync-green">
            <Plus className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-foreground group-hover:text-cync-green transition-colors block">
              Log Workout
            </span>
            <span className="text-[11px] text-muted-foreground">Record session</span>
          </div>
        </Link>

        <Link
          href="/progress"
          className="p-3.5 rounded-xl border border-border bg-card hover:border-cync-green/40 hover:bg-muted/30 transition-all flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-foreground group-hover:text-cync-green transition-colors block">
              View Progress
            </span>
            <span className="text-[11px] text-muted-foreground">Analytics & graphs</span>
          </div>
        </Link>

        <Link
          href={squad ? `/squads/${squad.id}` : '/squads'}
          className="p-3.5 rounded-xl border border-border bg-card hover:border-cync-green/40 hover:bg-muted/30 transition-all flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-foreground group-hover:text-cync-green transition-colors block">
              View Squad
            </span>
            <span className="text-[11px] text-muted-foreground">Shared activity</span>
          </div>
        </Link>

        <Link
          href="/goals"
          className="p-3.5 rounded-xl border border-border bg-card hover:border-cync-green/40 hover:bg-muted/30 transition-all flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Target className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-foreground group-hover:text-cync-green transition-colors block">
              Personal Goals
            </span>
            <span className="text-[11px] text-muted-foreground">Track milestones</span>
          </div>
        </Link>
      </div>

      {/* 5. Squad Activity Feed */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {squad ? `${squad.name} Activity Feed` : 'Your Recent Activity'}
          </h2>
          <Link
            href="/activity"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            All workouts →
          </Link>
        </div>

        {feedWorkouts.length === 0 ? (
          <Card className="p-8 text-center space-y-2 text-xs text-muted-foreground">
            <p>No activity recorded yet.</p>
            <Link
              href="/workouts/new"
              className="inline-block text-cync-green font-semibold hover:underline"
            >
              Log your first workout to get started
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {feedWorkouts.map((w) => (
              <ActivityFeedItem key={w.id} workout={w} currentUserId={user.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
