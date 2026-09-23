'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { completeOnboardingAction } from '@/actions/auth';
import { Check, ArrowRight, Target, Dumbbell, HeartPulse, Flame, Zap, ShieldCheck } from 'lucide-react';

const FITNESS_GOALS = [
  { id: 'Build consistency', label: 'Build consistency', desc: 'Focus on showing up regularly', icon: Target },
  { id: 'Get stronger', label: 'Get stronger', desc: 'Progressive overload & muscle', icon: Dumbbell },
  { id: 'Improve fitness', label: 'Improve fitness', desc: 'Cardiovascular endurance & stamina', icon: HeartPulse },
  { id: 'Lose weight', label: 'Lose weight', desc: 'Sustainable caloric deficit & motion', icon: Flame },
  { id: 'Stay active', label: 'Stay active', desc: 'Daily functional movement', icon: Zap },
  { id: 'General health', label: 'General health', desc: 'Longevity and well-being', icon: ShieldCheck },
];

export default function OnboardingPage() {
  const [selectedGoal, setSelectedGoal] = useState('Build consistency');
  const [weeklyTarget, setWeeklyTarget] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('primaryGoal', selectedGoal);
    formData.set('weeklyTarget', weeklyTarget.toString());

    try {
      const res = await completeOnboardingAction(formData);
      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      }
    } catch {
      // In Next.js, redirect throws a NEXT_REDIRECT error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background selection:bg-emerald-500/20">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cync-green/10 border border-cync-green/20 text-emerald-400 text-xs font-medium">
            <span>Welcome to Cync</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Set your foundation
          </h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Choose your primary intention and weekly target. You can adjust these anytime.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2.5">
                {error}
              </p>
            )}

            {/* Goal Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Primary Fitness Intention
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FITNESS_GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoal === goal.id;
                  return (
                    <button
                      type="button"
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-cync-green bg-cync-green/10 text-foreground ring-1 ring-cync-green/40'
                          : 'border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-cync-green' : 'text-muted-foreground'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold flex items-center justify-between">
                          <span>{goal.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cync-green shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {goal.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weekly Target Selector */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Weekly Workout Target
                </label>
                <span className="text-sm font-bold text-foreground">
                  {weeklyTarget} {weeklyTarget === 1 ? 'day' : 'days'} / week
                </span>
              </div>
              <div className="flex items-center justify-between gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setWeeklyTarget(num)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      weeklyTarget === num
                        ? 'bg-cync-green text-white border-cync-green shadow-sm'
                        : 'bg-muted/40 hover:bg-muted border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Aim for a realistic target you can stick with for 4+ consecutive weeks.
              </p>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              <span>Enter Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

