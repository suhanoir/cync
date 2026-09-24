import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuoteBlock } from '@/components/ui/QuoteBlock';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 group">
            <span className="text-2xl font-bold tracking-tight text-foreground group-hover:text-cync-green transition-colors">
              cync
            </span>
            <span className="w-2 h-2 rounded-full bg-cync-green" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">404</h1>
          <p className="text-xs text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <QuoteBlock
          variant="banner"
          quote="Even detours are part of the journey."
          className="border-border/30"
        />

        <div>
          <Link href="/dashboard">
            <Button size="sm" className="w-full sm:w-auto">
              <Home className="w-3.5 h-3.5 mr-1.5" />
              <span>Return to Dashboard</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

