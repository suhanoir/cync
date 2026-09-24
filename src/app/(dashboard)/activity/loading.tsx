import React from 'react';
import { Card } from '@/components/ui/Card';

export default function ActivityLoading() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted/60 rounded" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-lg" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="h-14 w-full bg-card/60 border border-border rounded-xl" />

      {/* Workout Card Skeletons */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted" />
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted/60 rounded" />
                </div>
              </div>
              <div className="h-4 w-16 bg-muted/70 rounded" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

