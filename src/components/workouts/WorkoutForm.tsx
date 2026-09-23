'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { ExerciseInput } from './ExerciseInput';
import { PhotoUpload } from './PhotoUpload';
import { useToast } from '../providers/ToastProvider';
import { createWorkoutAction, updateWorkoutAction } from '@/actions/workouts';
import { WORKOUT_TYPES, WorkoutType, ExerciseInput as IExerciseInput } from '@/lib/types';
import { Check, Flame, Clock, Calendar, MapPin, Dumbbell } from 'lucide-react';

interface SquadOption {
  id: string;
  name: string;
}

interface WorkoutFormProps {
  initialData?: {
    id: string;
    type: WorkoutType;
    duration: number;
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

export function WorkoutForm({ initialData, squads = [], onSuccess }: WorkoutFormProps) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();

  const isEditing = Boolean(initialData);

  const [type, setType] = useState<WorkoutType>(initialData?.type || 'Strength');
  const [duration, setDuration] = useState<number | string>(initialData?.duration || 45);
  const [distance, setDistance] = useState<number | string>(initialData?.distance ?? '');
  const [calories, setCalories] = useState<number | string>(initialData?.calories ?? '');
  const [completedAt, setCompletedAt] = useState<string>(() => {
    if (initialData?.completedAt) {
      const d = new Date(initialData.completedAt);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [squadId, setSquadId] = useState<string | null>(initialData?.squadId || (squads[0]?.id ?? null));
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialData?.photoUrl || null);
  const [exercises, setExercises] = useState<IExerciseInput[]>(initialData?.exercises || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const payload = {
      type,
      duration,
      distance: distance !== '' ? distance : null,
      calories: calories !== '' ? calories : null,
      completedAt: new Date(completedAt),
      notes: notes.trim() || undefined,
      squadId: squadId || null,
      photoUrl,
      exercises,
    };

    try {
      if (isEditing && initialData) {
        const res = await updateWorkoutAction(initialData.id, payload);
        if (res?.error) {
          setError(res.error);
          toastError(res.error);
        } else {
          toastSuccess('Workout updated successfully.');
          if (onSuccess) onSuccess();
          router.push(`/workouts/${initialData.id}`);
          router.refresh();
        }
      } else {
        const res = await createWorkoutAction(payload);
        if (res?.error) {
          setError(res.error);
          toastError(res.error);
        } else {
          toastSuccess('Workout logged! Streak updated.');
          if (onSuccess) onSuccess();
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save workout.');
      toastError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
            {error}
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

        {/* 2. Core Metrics: Duration & Completed At */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Duration (Minutes) *"
            type="number"
            min="1"
            max="1440"
            placeholder="e.g. 45"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />

          <Input
            label="Date & Time *"
            type="datetime-local"
            value={completedAt}
            onChange={(e) => setCompletedAt(e.target.value)}
            required
          />
        </div>

        {/* 3. Optional Metrics: Distance & Calories */}
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

        {/* 4. Squad Association */}
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

        {/* 5. Exercises List */}
        <ExerciseInput exercises={exercises} onChange={setExercises} />

        {/* 6. Proof Photo */}
        <PhotoUpload photoUrl={photoUrl} onChange={setPhotoUrl} />

        {/* 7. Notes */}
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

        {/* Submit */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <span>{isEditing ? 'Save Changes' : 'Log Workout'}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
}

