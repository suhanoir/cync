import React from 'react';
import { Card } from '@/components/ui/Card';

export default function ProgressLoading() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted rounded" />
        <div className="h-4 w-72 bg-muted/60 rounded" />
      </div>

      {/* Date Range Selector Skeleton */}
      <div className="h-12 w-full bg-card/60 border border-border rounded-xl" />

      {/* 4 KPI Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 space-y-2">
            <div className="h-3 w-20 bg-muted/60 rounded" />
            <div className="h-7 w-16 bg-muted rounded" />
            <div className="h-2.5 w-24 bg-muted/40 rounded" />
          </Card>
        ))}
      </div>

      {/* Chart Boxes Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 h-64 bg-card/60 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted/50" />
        </Card>
        <Card className="p-6 h-64 bg-card/60 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted/50" />
        </Card>
      </div>
    </div>
  );
}

