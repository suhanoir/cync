'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

interface CopyInviteButtonProps {
  inviteCode: string;
}

export function CopyInviteButton({ inviteCode }: CopyInviteButtonProps) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const handleCopy = () => {
    const url = `${window.location.origin}/squads/join?code=${inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    success('Invite link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-lg border border-border">
      <div className="flex-1 min-w-0 px-2 font-mono text-xs font-semibold text-foreground tracking-wider select-all">
        {inviteCode}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cync-green/10 hover:bg-cync-green/20 text-emerald-400 border border-cync-green/30 text-xs font-medium transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-cync-green" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
