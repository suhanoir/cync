import React from 'react';
import { Card } from '@/components/ui/Card';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* 1. Header Greeting Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted/60 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-lg" />
      </div>

      {/* 2. Today Status Skeleton */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 w-full md:w-1/2">
            <div className="h-3 w-24 bg-muted/60 rounded" />
            <div className="h-6 w-56 bg-muted rounded" />
            <div className="h-4 w-40 bg-muted/50 rounded" />
          </div>

          <div className="flex items-center gap-8 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-8 w-full md:w-auto">
            <div className="space-y-2">
              <div className="h-3 w-16 bg-muted/60 rounded" />
              <div className="h-6 w-20 bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-muted/60 rounded" />
              <div className="h-6 w-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Weekly Overview Skeleton */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted/60 rounded" />
        </div>
        <div className="flex items-center justify-between gap-2 pt-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted/70" />
              <div className="w-5 h-2.5 bg-muted/50 rounded" />
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Squad Snapshot Skeleton */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted/60 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted/80" />
                <div className="h-4 w-28 bg-muted rounded" />
              </div>
              <div className="h-4 w-16 bg-muted/60 rounded" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

