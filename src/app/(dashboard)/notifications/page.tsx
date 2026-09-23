import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  clearNotificationsAction,
} from '@/actions/social';
import {
  Bell,
  CheckCheck,
  Trash2,
  Flame,
  Zap,
  Users,
  Trophy,
  CheckCircle2,
  Dumbbell,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header & Bulk Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Lightweight updates from your squads, reactions, and nudges.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <form action={markAllNotificationsReadAction}>
                <Button variant="outline" size="sm" type="submit" className="gap-1.5 text-xs">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </Button>
              </form>
            )}

            <form action={clearNotificationsAction}>
              <Button variant="ghost" size="sm" type="submit" className="gap-1.5 text-xs text-muted-foreground hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="py-16 px-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Bell className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">All caught up</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              When someone in your squad reacts, nudges you, or logs a session, you will see it here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            let payload: any = {};
            try {
              payload = JSON.parse(n.payload);
            } catch {}

            const isUnread = !n.readAt;
            const relativeTime = formatDistanceToNow(new Date(n.createdAt), {
              addSuffix: true,
            });

            return (
              <Card
                key={n.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  isUnread ? 'bg-muted/30 border-cync-green/30' : 'bg-card'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-muted shrink-0 mt-0.5">
                    {n.type === 'REACTION' && <Flame className="w-4 h-4 text-amber-500" />}
                    {n.type === 'NUDGE' && <Zap className="w-4 h-4 text-amber-500" />}
                    {n.type === 'WORKOUT_COMPLETED' && <Dumbbell className="w-4 h-4 text-cync-green" />}
                    {n.type === 'SQUAD_JOIN' && <Users className="w-4 h-4 text-blue-400" />}
                    {n.type === 'CHALLENGE' && <Trophy className="w-4 h-4 text-purple-400" />}
                  </div>

                  <div className="text-xs min-w-0">
                    <p className="text-foreground leading-relaxed">
                      {n.type === 'REACTION' && (
                        <span>
                          <strong>{payload.actorName}</strong> reacted with{' '}
                          {payload.reactionType === 'fire'
                            ? '🔥'
                            : payload.reactionType === 'muscle'
                            ? '💪'
                            : payload.reactionType === 'clap'
                            ? '👏'
                            : '⚡'}{' '}
                          to your workout.
                        </span>
                      )}
                      {n.type === 'NUDGE' && (
                        <span>
                          <strong>{payload.senderName}</strong> sent you an accountability nudge! Keep showing up.
                        </span>
                      )}
                      {n.type === 'WORKOUT_COMPLETED' && (
                        <span>
                          <strong>{payload.actorName}</strong> completed a {payload.workoutType} session ({payload.duration} min).
                        </span>
                      )}
                      {n.type === 'SQUAD_JOIN' && (
                        <span>
                          <strong>{payload.actorName}</strong> joined your squad {payload.squadName}!
                        </span>
                      )}
                      {n.type === 'CHALLENGE' && (
                        <span>
                          <strong>{payload.creatorName}</strong> launched a new squad challenge: &ldquo;{payload.challengeTitle}&rdquo;.
                        </span>
                      )}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                      {relativeTime}
                    </span>
                  </div>
                </div>

                {isUnread && (
                  <form
                    action={async () => {
                      'use server';
                      await markNotificationReadAction(n.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-xs text-muted-foreground hover:text-cync-green shrink-0 px-2 py-1 rounded transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

