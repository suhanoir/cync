'use client';

import React, { useState } from 'react';
import { sendNudgeAction } from '@/actions/squads';
import { useToast } from '../providers/ToastProvider';
import { Zap } from 'lucide-react';

interface NudgeButtonProps {
  recipientId: string;
  recipientName: string;
  squadId?: string;
}

export function NudgeButton({ recipientId, recipientName, squadId }: NudgeButtonProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [isNudging, setIsNudging] = useState(false);
  const [nudged, setNudged] = useState(false);

  const handleNudge = async () => {
    setIsNudging(true);
    try {
      const res = await sendNudgeAction(recipientId, squadId);
      if (res.error) {
        toastError(res.error);
      } else {
        setNudged(true);
        toastSuccess(`You sent an accountability nudge to ${recipientName} 💪`);
      }
    } catch {
      toastError('Failed to send nudge.');
    } finally {
      setIsNudging(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleNudge}
      disabled={isNudging || nudged}
      title={nudged ? 'Nudged recently' : `Nudge ${recipientName}`}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
        nudged
          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 opacity-80 cursor-default'
          : 'bg-muted/40 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30 border-border text-muted-foreground'
      }`}
    >
      <Zap className={`w-3 h-3 ${isNudging ? 'animate-bounce' : ''}`} />
      <span>{nudged ? 'Nudged' : 'Nudge'}</span>
    </button>
  );
}
