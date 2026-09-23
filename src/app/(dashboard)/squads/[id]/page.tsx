import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateStreaks, formatDateToTz } from '@/lib/analytics';
import { SquadMemberList, SquadMemberData } from '@/components/squads/SquadMemberList';
import { SquadAnalyticsCard } from '@/components/squads/SquadAnalyticsCard';
import { CopyInviteButton } from '@/components/squads/CopyInviteButton';
import { SquadHeaderControls } from '@/components/squads/SquadHeaderControls';
import { ActivityFeedItem } from '@/components/feed/ActivityFeedItem';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Users, Shield, Trophy } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SquadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  const squad = await db.squad.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, username: true } },
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
      challenges: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!squad) {
    notFound();
  }

  // Authorization check: User must be a member or squad must be public
  const currentMember = squad.members.find((m) => m.userId === currentUser.id);
  if (!currentMember && squad.isPrivate) {
    redirect('/squads');
  }

  // Calculate Monday of current week for weekly stats
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + mondayOffset);
  startOfWeek.setHours(0, 0, 0, 0);

  const todayStr = formatDateToTz(now, currentUser.timezone);

  // Fetch all workouts for squad members to calculate real statistics
  const memberUserIds = squad.members.map((m) => m.userId);

  const allMemberWorkouts = await db.workout.findMany({
    where: {
      userId: { in: memberUserIds },
    },
    select: {
      id: true,
      userId: true,
      type: true,
      duration: true,
      completedAt: true,
    },
  });

  // Calculate real member metrics
  const memberDataList: SquadMemberData[] = squad.members.map((m) => {
    const userWorkouts = allMemberWorkouts.filter((w) => w.userId === m.userId);
    const workoutDates = userWorkouts.map((w) => new Date(w.completedAt));
    const { currentStreak } = calculateStreaks(workoutDates, m.user.timezone || 'UTC');

    const weeklyWorkouts = userWorkouts.filter((w) => new Date(w.completedAt) >= startOfWeek);
    const weeklyMinutes = weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0);

    const todayWorkout = userWorkouts.find(
      (w) => formatDateToTz(new Date(w.completedAt), m.user.timezone || 'UTC') === todayStr
    );

    return {
      userId: m.userId,
      name: m.user.name,
      username: m.user.username,
      avatar: m.user.avatar,
      role: m.role,
      currentStreak,
      weeklyWorkoutsCount: weeklyWorkouts.length,
      weeklyMinutes,
      todayWorkoutDuration: todayWorkout ? todayWorkout.duration : null,
      todayWorkoutType: todayWorkout ? todayWorkout.type : null,
    };
  });

  // Collective squad analytics
  const thisWeekWorkouts = allMemberWorkouts.filter(
    (w) => new Date(w.completedAt) >= startOfWeek
  );
  const totalSquadWorkouts = thisWeekWorkouts.length;
  const totalSquadMinutes = thisWeekWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const activeMembersCount = memberDataList.filter((m) => m.weeklyWorkoutsCount > 0).length;

  const memberMinutes = memberDataList.map((m) => ({
    name: m.name,
    minutes: m.weeklyMinutes,
    workoutsCount: m.weeklyWorkoutsCount,
  }));

  // Fetch squad activity feed
  const squadFeedWorkouts = await db.workout.findMany({
    where: {
      OR: [
        { squadId: squad.id },
        { userId: { in: memberUserIds } },
      ],
    },
    include: {
      user: {
        select: { id: true, name: true, username: true, avatar: true },
      },
      photo: { select: { storageReference: true } },
      exercises: { select: { id: true } },
      reactions: {
        select: { id: true, type: true, userId: true },
      },
    },
    orderBy: { completedAt: 'desc' },
    take: 10,
  });

  return (
    <div className="space-y-8">
      {/* Squad Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {squad.name}
            </h1>
            {squad.isPrivate && (
              <Badge variant="neutral" size="sm">
                <Shield className="w-3 h-3 text-muted-foreground" />
                <span>Private</span>
              </Badge>
            )}
          </div>
          {squad.description && (
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
              {squad.description}
            </p>
          )}
        </div>

        {/* Invite Code & Leave Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <CopyInviteButton inviteCode={squad.inviteCode} />
          {currentMember && (
            <SquadHeaderControls
              squadId={squad.id}
              isOwner={currentMember.role === 'OWNER'}
              memberCount={squad.members.length}
            />
          )}
        </div>
      </div>

      {/* 1. Squad Members Snapshot */}
      <SquadMemberList
        members={memberDataList}
        currentUserId={currentUser.id}
        squadId={squad.id}
      />

      {/* 2. Squad Analytics Card */}
      <SquadAnalyticsCard
        totalWorkouts={totalSquadWorkouts}
        totalMinutes={totalSquadMinutes}
        activeMembersCount={activeMembersCount}
        totalMembersCount={squad.members.length}
        memberMinutes={memberMinutes}
      />

      {/* 3. Squad Challenges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Squad Challenges ({squad.challenges.length})
          </h2>
          <Link
            href={`/squads/${squad.id}/challenges/new`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-cync-green hover:text-cync-green-muted transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create challenge</span>
          </Link>
        </div>

        {squad.challenges.length === 0 ? (
          <Card className="p-6 text-center text-xs text-muted-foreground">
            No active challenges. Create one for your squad to aim for a shared goal.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {squad.challenges.map((c) => {
              // Calculate challenge progress
              const challengeWorkouts = allMemberWorkouts.filter(
                (w) =>
                  new Date(w.completedAt) >= new Date(c.startDate) &&
                  new Date(w.completedAt) <= new Date(c.endDate)
              );

              let currentVal = 0;
              if (c.type === 'TOTAL_MINUTES') {
                currentVal = challengeWorkouts.reduce((acc, w) => acc + w.duration, 0);
              } else if (c.type === 'TOTAL_WORKOUTS') {
                currentVal = challengeWorkouts.length;
              } else {
                currentVal = Math.min(c.target, challengeWorkouts.length);
              }

              const percent = Math.min(100, Math.round((currentVal / c.target) * 100));

              return (
                <Card key={c.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{c.title}</h4>
                      {c.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                      )}
                    </div>
                    <Trophy className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {currentVal} / {c.target} {c.type === 'TOTAL_MINUTES' ? 'min' : 'workouts'}
                      </span>
                      <span className="font-bold text-foreground">{percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cync-green rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Squad Activity Feed */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Squad Activity
        </h2>

        {squadFeedWorkouts.length === 0 ? (
          <Card className="p-6 text-center text-xs text-muted-foreground">
            No workouts logged in this squad yet. When members log a workout, it will appear here.
          </Card>
        ) : (
          <div className="space-y-3">
            {squadFeedWorkouts.map((w) => (
              <ActivityFeedItem
                key={w.id}
                workout={w}
                currentUserId={currentUser.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

