import React from 'react';
import { Card } from '@/components/ui/Card';

export default function SquadsLoading() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-36 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted/60 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 bg-muted rounded-lg" />
          <div className="h-9 w-28 bg-muted rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-5 h-44 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-3 w-56 bg-muted/60 rounded" />
            </div>
            <div className="h-4 w-32 bg-muted/40 rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}

