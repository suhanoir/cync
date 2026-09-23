'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { WorkoutCard } from './WorkoutCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { WORKOUT_TYPES, WorkoutType } from '@/lib/types';
import { Plus, Filter, ArrowUpDown, Dumbbell, Sparkles } from 'lucide-react';
import { isThisWeek, isThisMonth } from 'date-fns';

interface WorkoutItem {
  id: string;
  type: string;
  duration: number;
  distance?: number | null;
  calories?: number | null;
  completedAt: string | Date;
  notes?: string | null;
  photo?: { storageReference: string } | null;
  exercises?: { id: string }[];
  squad?: { name: string } | null;
  reactions?: { type: string }[];
}

export function ActivityFilterList({ workouts }: { workouts: WorkoutItem[] }) {
  const [timeFilter, setTimeFilter] = useState<'all' | 'this_week' | 'this_month'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const filteredWorkouts = useMemo(() => {
    return workouts
      .filter((w) => {
        const date = new Date(w.completedAt);
        if (timeFilter === 'this_week' && !isThisWeek(date, { weekStartsOn: 1 })) {
          return false;
        }
        if (timeFilter === 'this_month' && !isThisMonth(date)) {
          return false;
        }
        if (typeFilter !== 'all' && w.type !== typeFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.completedAt).getTime();
        const dateB = new Date(b.completedAt).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [workouts, timeFilter, typeFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card/60 border border-border rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter Chips */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border text-xs">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                timeFilter === 'all'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('this_week')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                timeFilter === 'this_week'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeFilter('this_month')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                timeFilter === 'this_month'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              This Month
            </button>
          </div>

          {/* Workout Type Selector */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-muted/60 border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-cync-green"
          >
            <option value="all">All Types</option>
            {WORKOUT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order Selector */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/60 border border-border px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortBy === 'newest' ? 'Newest first' : 'Oldest first'}</span>
          </button>
        </div>
      </div>

      {/* Workout Cards List or Empty State */}
      {filteredWorkouts.length === 0 ? (
        <Card className="py-16 px-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              {workouts.length === 0
                ? 'Your journey starts here.'
                : 'No workouts match this filter.'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {workouts.length === 0
                ? 'Log your first workout to start tracking your progress and streak.'
                : 'Try adjusting your time range or workout type filter above.'}
            </p>
          </div>
          {workouts.length === 0 && (
            <Link
              href="/workouts/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cync-green hover:bg-cync-green-muted text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log First Workout</span>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground px-1 font-medium">
            Showing {filteredWorkouts.length} {filteredWorkouts.length === 1 ? 'workout' : 'workouts'}
          </p>
          {filteredWorkouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      )}
    </div>
  );
}
