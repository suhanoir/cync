'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  Users,
  Target,
  Plus,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { ThemeToggle } from './ThemeToggle';
import { logoutAction } from '@/actions/auth';
import { AuthUser } from '@/lib/types';

interface SidebarProps {
  user: AuthUser;
  unreadNotifications?: number;
}

export function Sidebar({ user, unreadNotifications = 0 }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Activity', href: '/activity', icon: Activity },
    { label: 'Progress', href: '/progress', icon: TrendingUp },
    { label: 'Squads', href: '/squads', icon: Users },
    { label: 'Goals', href: '/goals', icon: Target },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-sm h-screen sticky top-0 px-4 py-6 justify-between select-none">
      {/* Top Header & Brand */}
      <div className="space-y-6">
        <Link href="/dashboard" className="flex items-center gap-2 px-2.5 group">
          <span className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-cync-green">
            cync
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cync-green animate-pulse" />
        </Link>

        {/* Primary Action Button */}
        <Link
          href="/workouts/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-cync-green hover:bg-cync-green-muted text-white text-sm font-medium transition-all shadow-sm hover:shadow active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Workout</span>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-muted text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cync-green' : 'text-muted-foreground'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cync-green text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Settings */}
      <div className="space-y-3 pt-4 border-t border-border">
        {/* User Card */}
        <Link
          href="/profile"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors group"
        >
          <Avatar name={user.name} avatarUrl={user.avatar} size="sm" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-foreground truncate group-hover:text-cync-green transition-colors">
              {user.name}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              @{user.username}
            </span>
          </div>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Settings & Logout Actions */}
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <Link
            href="/settings"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors py-1"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 hover:text-red-400 transition-colors py-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

