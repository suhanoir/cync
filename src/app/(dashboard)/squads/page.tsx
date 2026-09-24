import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { QuoteBlock } from '@/components/ui/QuoteBlock';
import { Plus, Users, ArrowRight, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SquadsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const memberships = await db.squadMember.findMany({
    where: { userId: user.id },
    include: {
      squad: {
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
          _count: {
            select: { workouts: true, challenges: true },
          },
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Your Squads</h1>
            <QuoteBlock variant="minimal" quote="Show up together." />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Accountability groups where you and your circle keep each other showing up.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/squads/join"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-foreground text-xs font-semibold transition-colors"
          >
            <span>Join with Code</span>
          </Link>

          <Link
            href="/squads/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cync-green hover:bg-cync-green-muted text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Squad</span>
          </Link>
        </div>
      </div>

      {/* Squads List */}
      {memberships.length === 0 ? (
        <Card className="py-16 px-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Progress is better together.</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Create a squad for your friend group or join one using an invite code to share consistency.
            </p>
          </div>
          <QuoteBlock variant="minimal" quote="Find your people, build your rhythm." />
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/squads/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-cync-green hover:bg-cync-green-muted text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Squad</span>
            </Link>
            <Link
              href="/squads/join"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-lg transition-colors"
            >
              <span>Join with Code</span>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memberships.map(({ squad, role }) => (
            <Link key={squad.id} href={`/squads/${squad.id}`} className="block group">
              <Card className="p-5 hover:border-cync-green/40 hover:bg-muted/20 transition-all duration-150 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-foreground group-hover:text-cync-green transition-colors">
                          {squad.name}
                        </h2>
                        {role === 'OWNER' && (
                          <Badge variant="green" size="sm">
                            Owner
                          </Badge>
                        )}
                      </div>
                      {squad.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {squad.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cync-green group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>
                </div>

                <div className="pt-5 border-t border-border flex items-center justify-between text-xs text-muted-foreground mt-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {squad.members.length} {squad.members.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <span>{squad._count.workouts} total workouts</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

