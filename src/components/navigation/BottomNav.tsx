'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const isHome = pathname === '/dashboard';
  const isActivity = pathname.startsWith('/activity');
  const isProgress = pathname.startsWith('/progress');
  const isSquads = pathname.startsWith('/squads');

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border px-4 py-2 pb-safe select-none">
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        {/* Home */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
            isHome ? 'text-cync-green font-semibold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </Link>

        {/* Activity */}
        <Link
          href="/activity"
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
            isActivity ? 'text-cync-green font-semibold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span>Activity</span>
        </Link>

        {/* Prominent Center Log Button */}
        <div className="relative -top-5">
          <Link
            href="/workouts/new"
            aria-label="Log Workout"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-cync-green text-white shadow-lg shadow-cync-green/25 hover:bg-cync-green-muted active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </Link>
        </div>

        {/* Progress */}
        <Link
          href="/progress"
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
            isProgress ? 'text-cync-green font-semibold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Progress</span>
        </Link>

        {/* Squads */}
        <Link
          href="/squads"
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
            isSquads ? 'text-cync-green font-semibold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Squads</span>
        </Link>
      </div>
    </nav>
  );
}

