'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { createSquadAction } from '@/actions/squads';
import { useToast } from '@/components/providers/ToastProvider';
import { ArrowLeft, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export default function NewSquadPage() {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('isPrivate', isPrivate.toString());

    try {
      const res = await createSquadAction(formData);
      if (res?.error) {
        setError(res.error);
        toastError(res.error);
        setIsLoading(false);
      } else {
        toastSuccess('Squad created! Share your invite code.');
      }
    } catch {
      // In Next.js redirect happens automatically
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link
        href="/squads"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Squads</span>
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create a Squad</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Form an accountability circle for you, your friends, couple, or squad.
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
            label="Squad Name *"
            placeholder="e.g. Iron Mind, Morning Club, 6AM Run Club"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="What is the group's intention? (e.g. Daily consistency, half-marathon training)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-cync-green focus:border-cync-green resize-none"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded text-cync-green border-border focus:ring-cync-green"
            />
            <label htmlFor="isPrivate" className="text-xs text-foreground cursor-pointer select-none">
              <span className="font-semibold block">Private Squad</span>
              <span className="text-muted-foreground text-[11px]">
                Only invited members with the invite code can view activity.
              </span>
            </label>
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
              <span>Create Squad</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

