'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { createChallengeAction } from '@/actions/challenges';
import { useToast } from '@/components/providers/ToastProvider';
import { ArrowLeft, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function NewChallengePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'TOTAL_MINUTES' | 'TOTAL_WORKOUTS'>('TOTAL_MINUTES');
  const [target, setTarget] = useState(500);
  const [daysDuration, setDaysDuration] = useState(14);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('target', target.toString());
    formData.append('daysDuration', daysDuration.toString());

    try {
      const res = await createChallengeAction(params.id, formData);
      if (res?.error) {
        setError(res.error);
        toastError(res.error);
        setIsLoading(false);
      } else {
        toastSuccess('Challenge created for the squad!');
      }
    } catch {
      // In Next.js redirect happens automatically
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link
        href={`/squads/${params.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Squad</span>
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Squad Challenge</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Set a shared milestone for the squad to achieve together.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2.5">
              {error}
            </p>
          )}

          <Input
            label="Challenge Title *"
            placeholder="e.g. 500 Minute Challenge, 30 Workout Challenge"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Inspiring description for your squad..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-cync-green focus:border-cync-green resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Challenge Target Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('TOTAL_MINUTES');
                  setTarget(500);
                }}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  type === 'TOTAL_MINUTES'
                    ? 'bg-cync-green text-white border-cync-green'
                    : 'bg-muted/40 hover:bg-muted border-border text-muted-foreground'
                }`}
              >
                Collective Minutes
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('TOTAL_WORKOUTS');
                  setTarget(30);
                }}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  type === 'TOTAL_WORKOUTS'
                    ? 'bg-cync-green text-white border-cync-green'
                    : 'bg-muted/40 hover:bg-muted border-border text-muted-foreground'
                }`}
              >
                Total Workouts
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`Target ${type === 'TOTAL_MINUTES' ? 'Minutes' : 'Workouts'} *`}
              type="number"
              min="1"
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value, 10) || 1)}
              required
            />

            <Input
              label="Duration (Days) *"
              type="number"
              min="1"
              max="90"
              value={daysDuration}
              onChange={(e) => setDaysDuration(parseInt(e.target.value, 10) || 1)}
              required
            />
          </div>

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
              <span>Launch Challenge</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
