'use client';

import React, { useState } from 'react';
import { toggleReactionAction } from '@/actions/social';

interface ReactionData {
  id: string;
  type: string;
  userId: string;
}

interface ReactionPickerProps {
  workoutId: string;
  reactions: ReactionData[];
  currentUserId: string;
}

const EMOJIS: Record<string, string> = {
  fire: '🔥',
  muscle: '💪',
  clap: '👏',
  bolt: '⚡',
};

export function ReactionPicker({ workoutId, reactions: initialReactions, currentUserId }: ReactionPickerProps) {
  const [reactions, setReactions] = useState<ReactionData[]>(initialReactions);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async (type: string) => {
    if (isPending) return;

    const userHasReacted = reactions.some((r) => r.type === type && r.userId === currentUserId);

    // Optimistic update
    if (userHasReacted) {
      setReactions((prev) => prev.filter((r) => !(r.type === type && r.userId === currentUserId)));
    } else {
      setReactions((prev) => [
        ...prev,
        { id: `temp-${Date.now()}`, type, userId: currentUserId },
      ]);
    }

    setIsPending(true);
    try {
      await toggleReactionAction(workoutId, type);
    } catch {
      // Revert if error
      setReactions(initialReactions);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Object.entries(EMOJIS).map(([type, emoji]) => {
        const count = reactions.filter((r) => r.type === type).length;
        const hasReacted = reactions.some((r) => r.type === type && r.userId === currentUserId);

        return (
          <button
            key={type}
            type="button"
            onClick={() => handleToggle(type)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-all active:scale-95 ${
              hasReacted
                ? 'bg-cync-green/15 text-emerald-400 border-cync-green/40 shadow-xs'
                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border'
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-[11px] font-semibold">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
