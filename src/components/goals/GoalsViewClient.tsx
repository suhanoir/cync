'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { QuoteBlock } from '../ui/QuoteBlock';
import { createGoalAction, updateGoalStatusAction, deleteGoalAction } from '@/actions/goals';
import { useToast } from '../providers/ToastProvider';
import { Plus, Target, CheckCircle2, Archive, Trash2, Dumbbell, Flame, Clock } from 'lucide-react';

interface GoalWithProgress {
  id: string;
  title: string;
  type: string;
  target: number;
  current: number;
  percentage: number;
  status: string;
}

interface GoalsViewClientProps {
  goals: GoalWithProgress[];
}

export function GoalsViewClient({ goals }: GoalsViewClientProps) {
  const { error: toastError, success: toastSuccess } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('WORKOUTS_PER_WEEK');
  const [target, setTarget] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('target', target.toString());

    try {
      const res = await createGoalAction(formData);
      if (res?.error) {
        toastError(res.error);
      } else {
        toastSuccess('Personal goal created!');
        setIsModalOpen(false);
        setTitle('');
        setTarget(4);
      }
    } catch {
      toastError('Failed to create goal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (goalId: string, newStatus: string) => {
    try {
      await updateGoalStatusAction(goalId, newStatus);
      toastSuccess(`Goal marked as ${newStatus.toLowerCase()}.`);
    } catch {
      toastError('Failed to update goal.');
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      await deleteGoalAction(goalId);
      toastSuccess('Goal removed.');
    } catch {
      toastError('Failed to delete goal.');
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'ACTIVE');
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Top Header Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Personal Goals</h1>
            <QuoteBlock variant="minimal" quote="A little effort, repeated often." />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Clear, achievable targets to structure your consistency and habits.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </Button>
      </div>

      {/* Active Goals */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Active Goals ({activeGoals.length})
        </h2>

        {activeGoals.length === 0 ? (
          <Card className="py-12 px-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Target className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">No active goals yet</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Set a weekly workout target, minute threshold, or streak milestone.
              </p>
            </div>
            <QuoteBlock variant="minimal" quote="A little effort, repeated often." />
            <div className="pt-1">
              <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Create Your First Goal</span>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const isFinished = goal.current >= goal.target;

              return (
                <Card key={goal.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{goal.title}</span>
                        {isFinished && (
                          <Badge variant="green" size="sm">
                            Target Hit!
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground block">
                        {goal.type === 'WORKOUTS_PER_WEEK'
                          ? 'Weekly workout count'
                          : goal.type === 'WORKOUT_MINUTES'
                          ? 'Weekly active minutes'
                          : 'Streak milestone'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateStatus(goal.id, 'COMPLETED')}
                        className="p-1 text-muted-foreground hover:text-cync-green transition-colors"
                        title="Mark Completed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {goal.current} / {goal.target}{' '}
                        {goal.type === 'WORKOUT_MINUTES'
                          ? 'min'
                          : goal.type === 'WORKOUTS_PER_WEEK'
                          ? 'workouts'
                          : 'days'}
                      </span>
                      <span className="text-muted-foreground font-medium">{goal.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFinished ? 'bg-cync-green' : 'bg-cync-green/80'
                        }`}
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-border">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Completed Goals ({completedGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="p-4 bg-muted/20 border-border/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cync-green shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-foreground">{goal.title}</span>
                    <span className="text-[11px] text-muted-foreground block">
                      Hit target of {goal.target} {goal.type === 'WORKOUT_MINUTES' ? 'min' : 'sessions'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Personal Goal"
        description="Pick a simple, focused target to build into your routine."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Goal Title *"
            placeholder="e.g. 4 workouts per week, 180 workout minutes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Goal Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-cync-green"
            >
              <option value="WORKOUTS_PER_WEEK">Workouts Per Week (e.g. 4 sessions)</option>
              <option value="WORKOUT_MINUTES">Weekly Workout Minutes (e.g. 180 min)</option>
              <option value="STREAK_DAYS">Streak Milestone (e.g. 7 consecutive days)</option>
            </select>
          </div>

          <Input
            label="Target Number *"
            type="number"
            min="1"
            max="10000"
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value, 10) || 1)}
            required
          />

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading}>
              <span>Create Goal</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

