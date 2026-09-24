'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { QuoteBlock } from '../ui/QuoteBlock';
import { ExerciseInput } from './ExerciseInput';
import { PhotoUpload } from './PhotoUpload';
import { useToast } from '../providers/ToastProvider';
import { createWorkoutAction, updateWorkoutAction } from '@/actions/workouts';
import { WORKOUT_TYPES, WorkoutType, ExerciseInput as IExerciseInput } from '@/lib/types';
import {
  calculateWorkoutDuration,
  validateWorkoutTimeRange,
  formatDuration,
  combineDateAndTime,
  formatTime,
} from '@/lib/workout-time';
import { clearActiveWorkout } from './LiveWorkoutTimer';
import { Clock, Calendar, AlertCircle, Sparkles, Moon } from 'lucide-react';

interface SquadOption {
  id: string;
  name: string;
}

interface WorkoutFormProps {
  initialData?: {
    id: string;
    type: WorkoutType;
    duration: number;
    startTime?: string | Date | null;
    endTime?: string | Date | null;
    distance?: number | null;
    calories?: number | null;
    completedAt: string | Date;
    notes?: string | null;
    squadId?: string | null;
    photoUrl?: string | null;
    exercises?: IExerciseInput[];
  };
  squads?: SquadOption[];
  onSuccess?: () => void;
}

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

function dateToLocalTimeString(d: Date): string {
  return `${padZero(d.getHours())}:${padZero(d.getMinutes())}`;
}

function dateToLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
}

export function WorkoutForm({ initialData, squads = [], onSuccess }: WorkoutFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: toastSuccess, error: toastError } = useToast();

  const isEditing = Boolean(initialData);

  // Check URL search params for live workout handover (e.g. ?start=...&end=...&type=...)
  const queryStart = searchParams?.get('start');
  const queryEnd = searchParams?.get('end');
  const queryType = searchParams?.get('type') as WorkoutType | null;

  // Initialize dates and times
  const defaultDate = useMemo(() => {
    if (initialData?.startTime) return dateToLocalDateString(new Date(initialData.startTime));
    if (initialData?.completedAt) return dateToLocalDateString(new Date(initialData.completedAt));
    if (queryStart) return dateToLocalDateString(new Date(queryStart));
    return dateToLocalDateString(new Date());
  }, [initialData, queryStart]);

  const defaultStartTime = useMemo(() => {
    if (initialData?.startTime) return dateToLocalTimeString(new Date(initialData.startTime));
    if (queryStart) return dateToLocalTimeString(new Date(queryStart));
    // Default to 45 minutes before now
    const past = new Date(Date.now() - 45 * 60 * 1000);
    return dateToLocalTimeString(past);
  }, [initialData, queryStart]);

  const defaultEndTime = useMemo(() => {
    if (initialData?.endTime) return dateToLocalTimeString(new Date(initialData.endTime));
    if (queryEnd) return dateToLocalTimeString(new Date(queryEnd));
    return dateToLocalTimeString(new Date());
  }, [initialData, queryEnd]);

  const [type, setType] = useState<WorkoutType>(
    initialData?.type || queryType || 'Strength'
  );
  const [workoutDate, setWorkoutDate] = useState<string>(defaultDate);
  const [startTime, setStartTime] = useState<string>(defaultStartTime);
  const [endTime, setEndTime] = useState<string>(defaultEndTime);
  const [crossesMidnight, setCrossesMidnight] = useState<boolean>(() => {
    // If end time is earlier than start time on same day, default to midnight crossing true
    return defaultEndTime < defaultStartTime;
  });

  const [distance, setDistance] = useState<number | string>(initialData?.distance ?? '');
  const [calories, setCalories] = useState<number | string>(initialData?.calories ?? '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [squadId, setSquadId] = useState<string | null>(
    initialData?.squadId || (squads[0]?.id ?? null)
  );
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialData?.photoUrl || null);
  const [exercises, setExercises] = useState<IExerciseInput[]>(initialData?.exercises || []);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Automatically update crossesMidnight flag when user selects an end time earlier than start time
  useEffect(() => {
    if (startTime && endTime) {
      if (endTime < startTime) {
        setCrossesMidnight(true);
      }
    }
  }, [startTime, endTime]);

  // Derived timestamps and duration calculation
  const timeEvaluation = useMemo(() => {
    if (!workoutDate || !startTime || !endTime) {
      return { valid: false, duration: 0, error: 'Start and end times are required.' };
    }

    const startDateTime = combineDateAndTime(workoutDate, startTime);
    const endDateTime = combineDateAndTime(workoutDate, endTime, crossesMidnight ? 1 : 0);

    return validateWorkoutTimeRange(startDateTime, endDateTime, {
      allowMidnightCrossing: crossesMidnight,
    });
  }, [workoutDate, startTime, endTime, crossesMidnight]);

  const calculatedDuration = timeEvaluation.duration;
  const isTimeValid = timeEvaluation.valid;
  const timeError = timeEvaluation.error;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isTimeValid) {
      setSubmitError(timeError || 'Please provide a valid start and end time.');
      toastError(timeError || 'Invalid workout times.');
      return;
    }

    setIsLoading(true);

    const startDateTime = combineDateAndTime(workoutDate, startTime);
    const endDateTime = combineDateAndTime(workoutDate, endTime, crossesMidnight ? 1 : 0);

    const payload = {
      type,
      duration: calculatedDuration,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      distance: distance !== '' ? distance : null,
      calories: calories !== '' ? calories : null,
      completedAt: endDateTime.toISOString(),
      notes: notes.trim() || undefined,
      squadId: squadId || null,
      photoUrl,
      exercises,
    };

    try {
      if (isEditing && initialData) {
        const res = await updateWorkoutAction(initialData.id, payload);
        if (res?.error) {
          setSubmitError(res.error);
          toastError(res.error);
        } else {
          toastSuccess('Workout updated successfully.');
          clearActiveWorkout();
          if (onSuccess) onSuccess();
          router.push(`/workouts/${initialData.id}`);
          router.refresh();
        }
      } else {
        const res = await createWorkoutAction(payload);
        if (res?.error) {
          setSubmitError(res.error);
          toastError(res.error);
        } else {
          toastSuccess('Workout logged! Streak updated.');
          clearActiveWorkout();
          if (onSuccess) onSuccess();
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to save workout.');
      toastError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* 1. Workout Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Workout Type *
          </label>
          <div className="flex flex-wrap gap-2">
            {WORKOUT_TYPES.map((t) => {
              const isSelected = type === t;
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-cync-green text-white border-cync-green shadow-sm'
                      : 'bg-muted/40 hover:bg-muted border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Workout Date */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Workout Date *
          </label>
          <div className="relative">
            <input
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-cync-green focus:border-cync-green"
            />
          </div>
        </div>

        {/* 3. TIME SECTION: Start Time, End Time & Auto-Calculated Duration */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cync-green" />
              Workout Time
            </span>
            {crossesMidnight && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Moon className="w-3 h-3" />
                Crosses midnight (+1 day)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-cync-green focus:border-cync-green"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-cync-green focus:border-cync-green"
              />
            </div>
          </div>

          {/* Midnight crossing checkbox for edge cases */}
          {endTime < startTime && (
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="midnightToggle"
                checked={crossesMidnight}
                onChange={(e) => setCrossesMidnight(e.target.checked)}
                className="rounded border-border text-cync-green focus:ring-cync-green"
              />
              <label htmlFor="midnightToggle" className="text-xs text-muted-foreground cursor-pointer">
                Workout ended past midnight on the next calendar day
              </label>
            </div>
          )}

          {/* Read-Only Auto Calculated Duration */}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Calculated Duration</span>
            <div>
              {isTimeValid ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cync-green/10 border border-cync-green/30 text-cync-green text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDuration(calculatedDuration)}</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    ({calculatedDuration} minutes)
                  </span>
                </div>
              ) : (
                <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {timeError}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4. Optional Metrics: Distance & Calories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Distance (km) — Optional"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 5.2"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          />

          <Input
            label="Calories Burned — Optional"
            type="number"
            min="0"
            placeholder="e.g. 350"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>

        {/* 5. Squad Association */}
        {squads.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Share With Squad
            </label>
            <select
              value={squadId || ''}
              onChange={(e) => setSquadId(e.target.value || null)}
              className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-cync-green focus:border-cync-green"
            >
              <option value="">Personal only (no squad)</option>
              {squads.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 6. Exercises List */}
        <ExerciseInput exercises={exercises} onChange={setExercises} />

        {/* 7. Proof Photo (with client-side canvas compression) */}
        <PhotoUpload photoUrl={photoUrl} onChange={setPhotoUrl} />

        {/* 8. Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Notes / Reflection (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="How did this workout feel? Notes on form, energy, or milestones..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-cync-green focus:border-cync-green resize-none"
          />
        </div>

        {/* Subtle Cursive Quote */}
        <QuoteBlock quote="Show up. Put in the time." variant="inline" className="pt-1" />

        {/* 9. Submit Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!isTimeValid || isLoading}>
            <span>{isEditing ? 'Save Changes' : 'Log Workout'}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
}
