'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { joinSquadAction } from '@/actions/squads';
import { useToast } from '@/components/providers/ToastProvider';
import { ArrowLeft, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function JoinSquadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error: toastError, success: toastSuccess } = useToast();

  const codeParam = searchParams.get('code') || '';
  const [inviteCode, setInviteCode] = useState(codeParam);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (codeParam) {
      setInviteCode(codeParam.toUpperCase());
    }
  }, [codeParam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await joinSquadAction(inviteCode);
      if (res?.error) {
        setError(res.error);
        toastError(res.error);
        setIsLoading(false);
      } else if (res?.squadId) {
        toastSuccess('Successfully joined squad!');
        router.push(`/squads/${res.squadId}`);
        router.refresh();
      }
    } catch {
      toastError('Failed to join squad.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Link
        href="/squads"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Squads</span>
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Join a Squad</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Enter the unique 8-character invite code provided by your squad creator.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2.5">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Invite Code *
            </label>
            <input
              type="text"
              placeholder="e.g. IRONMIND"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase().trim())}
              maxLength={12}
              required
              autoFocus
              className="w-full px-4 py-2.5 text-center font-mono text-base uppercase tracking-widest bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cync-green focus:border-cync-green"
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            <span>Join Squad</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
