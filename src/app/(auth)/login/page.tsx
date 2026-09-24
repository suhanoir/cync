'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { loginAction } from '@/actions/auth';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else if (res?.redirectTo) {
        window.location.href = res.redirectTo;
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your connection.');
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background selection:bg-emerald-500/20">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center gap-1.5 group">
            <span className="text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-cync-green">
              cync
            </span>
            <span className="w-2 h-2 rounded-full bg-cync-green" />
          </Link>
          <p className="text-xs text-muted-foreground">
            Sign in to continue your streak and check in on your squad.
          </p>
        </div>

        {/* Card Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              showPasswordToggle
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              <span>Login</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Demo Sandbox for Testing */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-center justify-center gap-1.5 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
              <p className="text-[11px] text-muted-foreground text-center uppercase tracking-wider font-semibold">
                Demo Sandbox Accounts
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillDemo('suhan@cync.fit')}
                className="py-1.5 px-2 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg border border-border text-center transition-colors font-medium"
              >
                Suhan (Squad Leader)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('arjun@cync.fit')}
                className="py-1.5 px-2 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg border border-border text-center transition-colors font-medium"
              >
                Arjun (Squad Member)
              </button>
            </div>
          </div>
        </Card>

        {/* Bottom Switch */}
        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-cync-green font-medium hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

