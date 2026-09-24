'use client';

import React, { useState } from 'react';
import { WorkoutForm } from './WorkoutForm';
import { LiveWorkoutTimer } from './LiveWorkoutTimer';
import { WorkoutType } from '@/lib/types';
import { Card } from '../ui/Card';

interface NewWorkoutClientProps {
  squads: Array<{ id: string; name: string }>;
}

export function NewWorkoutClient({ squads }: NewWorkoutClientProps) {
  const [prefilledSession, setPrefilledSession] = useState<{
    startTime: Date;
    endTime: Date;
    type: WorkoutType;
  } | null>(null);

  const handleLiveFinish = (session: { startTime: Date; endTime: Date; type: WorkoutType }) => {
    setPrefilledSession(session);
  };

  return (
    <div className="space-y-6">
      {/* Live Timer Option */}
      <LiveWorkoutTimer onFinish={handleLiveFinish} />

      {/* Main Logging Form */}
      <WorkoutForm
        squads={squads}
        initialData={
          prefilledSession
            ? {
                id: '',
                type: prefilledSession.type,
                duration: Math.max(
                  1,
                  Math.round(
                    (prefilledSession.endTime.getTime() - prefilledSession.startTime.getTime()) /
                      60000
                  )
                ),
                startTime: prefilledSession.startTime,
                endTime: prefilledSession.endTime,
                completedAt: prefilledSession.endTime,
              }
            : undefined
        }
      />
    </div>
  );
}

