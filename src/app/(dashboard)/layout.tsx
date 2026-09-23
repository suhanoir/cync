import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!user.onboarded) {
    redirect('/onboarding');
  }

  // Count unread notifications
  const unreadNotifications = await db.notification.count({
    where: {
      userId: user.id,
      readAt: null,
    },
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar user={user} unreadNotifications={unreadNotifications} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <Header user={user} unreadCount={unreadNotifications} />

        {/* Content Body with Responsive Margins & Padding */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 pb-28 md:pb-12">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}

