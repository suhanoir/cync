'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ExerciseInput as IExerciseInput } from '@/lib/types';

interface ExerciseInputProps {
  exercises: IExerciseInput[];
  onChange: (exercises: IExerciseInput[]) => void;
}

export function ExerciseInput({ exercises, onChange }: ExerciseInputProps) {
  const addExercise = () => {
    onChange([...exercises, { exerciseName: '', sets: undefined, reps: undefined, weight: undefined }]);
  };

  const updateExercise = (index: number, field: keyof IExerciseInput, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeExercise = (index: number) => {
    onChange(exercises.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Exercises (Optional)
        </label>
        <button
          type="button"
          onClick={addExercise}
          className="inline-flex items-center gap-1 text-xs font-semibold text-cync-green hover:text-cync-green-muted transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add exercise</span>
        </button>
      </div>

      {exercises.length === 0 ? (
        <div
          onClick={addExercise}
          className="border border-dashed border-border rounded-lg p-3.5 text-center text-xs text-muted-foreground hover:border-cync-green/50 hover:bg-muted/30 cursor-pointer transition-colors"
        >
          + Add exercise sets, reps, or weights
        </div>
      ) : (
        <div className="space-y-2">
          {exercises.map((ex, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-lg border border-border"
            >
              <input
                type="text"
                placeholder="Exercise (e.g. Bench Press)"
                value={ex.exerciseName}
                onChange={(e) => updateExercise(index, 'exerciseName', e.target.value)}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Sets"
                min="1"
                max="50"
                value={ex.sets ?? ''}
                onChange={(e) =>
                  updateExercise(index, 'sets', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                className="w-14 px-1.5 py-1 text-xs text-center bg-card rounded border border-border focus:outline-none focus:border-cync-green"
              />
              <input
                type="number"
                placeholder="Reps"
                min="1"
                max="500"
                value={ex.reps ?? ''}
                onChange={(e) =>
                  updateExercise(index, 'reps', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                className="w-14 px-1.5 py-1 text-xs text-center bg-card rounded border border-border focus:outline-none focus:border-cync-green"
              />
              <input
                type="number"
                placeholder="kg"
                step="0.5"
                min="0"
                max="1000"
                value={ex.weight ?? ''}
                onChange={(e) =>
                  updateExercise(index, 'weight', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-14 px-1.5 py-1 text-xs text-center bg-card rounded border border-border focus:outline-none focus:border-cync-green"
              />
              <button
                type="button"
                onClick={() => removeExercise(index)}
                className="p-1 text-muted-foreground hover:text-red-400 rounded transition-colors"
                aria-label="Remove exercise"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

