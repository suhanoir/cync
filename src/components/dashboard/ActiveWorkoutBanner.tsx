'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LiveWorkoutTimer } from '../workouts/LiveWorkoutTimer';

export function ActiveWorkoutBanner() {
  const router = useRouter();

  const handleFinish = (session: { startTime: Date; endTime: Date; type: string }) => {
    // When finishing from dashboard, redirect to workout log form with query params
    const params = new URLSearchParams({
      start: session.startTime.toISOString(),
      end: session.endTime.toISOString(),
      type: session.type,
    });
    router.push(`/workouts/new?${params.toString()}`);
  };

  return (
    <div className="mb-2">
      <LiveWorkoutTimer onFinish={handleFinish} compact={false} />
    </div>
  );
}
