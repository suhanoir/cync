'use client';

import React, { useState, useEffect } from 'react';
import { Play, Square, X, Clock, Flame, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { WORKOUT_TYPES, WorkoutType } from '@/lib/types';
import { formatTime, formatElapsedSeconds, formatDuration } from '@/lib/workout-time';

const ACTIVE_WORKOUT_STORAGE_KEY = 'cync_active_workout';

export interface ActiveWorkoutData {
  startTime: string; // ISO string
  type: WorkoutType;
}

export function getActiveWorkout(): ActiveWorkoutData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.startTime && !isNaN(new Date(parsed.startTime).getTime())) {
      return parsed;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function clearActiveWorkout() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
    window.dispatchEvent(new Event('cync_active_workout_changed'));
  } catch {
    // Ignore
  }
}

export function saveActiveWorkout(data: ActiveWorkoutData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('cync_active_workout_changed'));
  } catch {
    // Ignore
  }
}

interface LiveWorkoutTimerProps {
  onFinish?: (session: { startTime: Date; endTime: Date; type: WorkoutType }) => void;
  compact?: boolean;
}

export function LiveWorkoutTimer({ onFinish, compact = false }: LiveWorkoutTimerProps) {
  const [activeSession, setActiveSession] = useState<ActiveWorkoutData | null>(null);
  const [selectedType, setSelectedType] = useState<WorkoutType>('Strength');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isStarting, setIsStarting] = useState(false);

  // Sync with localStorage on mount and listen for storage events across tabs/windows
  useEffect(() => {
    const syncState = () => {
      const stored = getActiveWorkout();
      setActiveSession(stored);
      if (stored) {
        setSelectedType(stored.type);
      }
    };

    syncState();
    window.addEventListener('storage', syncState);
    window.addEventListener('cync_active_workout_changed', syncState);

    return () => {
      window.removeEventListener('storage', syncState);
      window.removeEventListener('cync_active_workout_changed', syncState);
    };
  }, []);

  // Timer tick: derived from currentTime - startTime (immune to tab sleeping / screen locking)
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const startTimestamp = new Date(activeSession.startTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - startTimestamp) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStartWorkout = () => {
    const now = new Date();
    const newSession: ActiveWorkoutData = {
      startTime: now.toISOString(),
      type: selectedType,
    };
    saveActiveWorkout(newSession);
    setActiveSession(newSession);
    setIsStarting(false);
  };

  const handleFinishWorkout = () => {
    if (!activeSession) return;
    const start = new Date(activeSession.startTime);
    const end = new Date();
    const type = activeSession.type;

    clearActiveWorkout();
    setActiveSession(null);

    if (onFinish) {
      onFinish({ startTime: start, endTime: end, type });
    }
  };

  const handleDiscardWorkout = () => {
    if (window.confirm('Are you sure you want to discard this in-progress workout?')) {
      clearActiveWorkout();
      setActiveSession(null);
    }
  };

  // 1. Render active workout in progress
  if (activeSession) {
    const startDate = new Date(activeSession.startTime);
    const startedAtFormatted = formatTime(startDate);
    const minutesElapsed = Math.floor(elapsedSeconds / 60);

    if (compact) {
      return (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-cync-green/10 border border-cync-green/30 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cync-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cync-green"></span>
            </span>
            <div>
              <span className="font-semibold text-foreground block">
                Workout in progress: {activeSession.type}
              </span>
              <span className="text-muted-foreground text-[11px]">
                {formatElapsedSeconds(elapsedSeconds)} • Started at {startedAtFormatted}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleFinishWorkout}
            className="bg-cync-green text-white hover:bg-cync-green-muted text-xs h-8 px-3"
          >
            Finish
          </Button>
        </div>
      );
    }

    return (
      <Card className="p-5 border-cync-green/40 bg-cync-green/5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cync-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cync-green"></span>
              </span>
              <span className="text-xs font-semibold text-cync-green uppercase tracking-wider">
                Workout in progress
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted border border-border text-foreground">
                {activeSession.type}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold tracking-tight font-mono text-foreground">
                {formatElapsedSeconds(elapsedSeconds)}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                ({formatDuration(minutesElapsed)})
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Started at {startedAtFormatted} • Tab-safe & screen-lock safe
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscardWorkout}
              className="text-xs text-muted-foreground hover:text-red-400 hover:border-red-400/40"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Discard
            </Button>

            <Button
              type="button"
              onClick={handleFinishWorkout}
              className="bg-cync-green text-white hover:bg-cync-green-muted text-xs shadow-sm flex-1 sm:flex-none"
            >
              <Square className="w-3.5 h-3.5 mr-1.5 fill-current" />
              Finish Workout
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // 2. Render starting drawer / quick start button
  if (isStarting) {
    return (
      <Card className="p-4 border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Select Workout Type to Begin</span>
          <button
            type="button"
            onClick={() => setIsStarting(false)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Cancel
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {WORKOUT_TYPES.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                selectedType === t
                  ? 'bg-cync-green text-white border-cync-green'
                  : 'bg-muted/40 hover:bg-muted border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleStartWorkout}
            className="bg-cync-green text-white hover:bg-cync-green-muted text-xs"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            Start {selectedType} Session
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsStarting(true)}
      className="w-full py-3 px-4 border border-dashed border-border hover:border-cync-green/50 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all flex items-center justify-between group text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-cync-green/10 text-cync-green flex items-center justify-center group-hover:scale-105 transition-transform">
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </div>
        <div>
          <span className="text-xs font-semibold text-foreground block group-hover:text-cync-green transition-colors">
            Start Live Workout
          </span>
          <span className="text-[11px] text-muted-foreground">
            Track your session in real time with automated duration calculation
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
        Start now →
      </span>
    </button>
  );
}
