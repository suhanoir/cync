'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Settings } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { AuthUser } from '@/lib/types';

interface HeaderProps {
  user: AuthUser;
  unreadCount?: number;
}

export function Header({ user, unreadCount = 0 }: HeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-md border-b border-border">
      <Link href="/dashboard" className="flex items-center gap-1.5">
        <span className="text-lg font-bold tracking-tight text-foreground">cync</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cync-green" />
      </Link>

      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cync-green" />
          )}
        </Link>

        {/* Profile Avatar */}
        <Link href="/profile">
          <Avatar name={user.name} avatarUrl={user.avatar} size="sm" />
        </Link>
      </div>
    </header>
  );
}

