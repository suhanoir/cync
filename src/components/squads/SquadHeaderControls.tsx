'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { leaveSquadAction } from '@/actions/squads';
import { useToast } from '../providers/ToastProvider';
import { LogOut, AlertTriangle, Trash2 } from 'lucide-react';

interface SquadHeaderControlsProps {
  squadId: string;
  isOwner: boolean;
  memberCount: number;
}

export function SquadHeaderControls({ squadId, isOwner, memberCount }: SquadHeaderControlsProps) {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLeave = async () => {
    setIsLoading(true);
    try {
      await leaveSquadAction(squadId);
      toastSuccess(isOwner && memberCount === 1 ? 'Squad deleted.' : 'You left the squad.');
    } catch {
      toastError('Failed to leave squad.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsLeaveModalOpen(true)}
        className="text-muted-foreground hover:text-red-400 gap-1.5"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>{isOwner && memberCount === 1 ? 'Delete Squad' : 'Leave Squad'}</span>
      </Button>

      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title={isOwner && memberCount === 1 ? 'Delete Squad' : 'Leave Squad'}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p>
              {isOwner && memberCount === 1
                ? 'You are the only member in this squad. Deleting the squad will remove all challenges and references.'
                : isOwner
                ? 'As owner, leaving this squad will transfer ownership to the next oldest member.'
                : 'Are you sure you want to leave this squad? You will need an invite code to rejoin.'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLeaveModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleLeave}
              isLoading={isLoading}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

