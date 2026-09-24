'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { WorkoutForm } from './WorkoutForm';
import { deleteWorkoutAction } from '@/actions/workouts';
import { useToast } from '../providers/ToastProvider';
import { Edit2, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface WorkoutDetailClientProps {
  workout: any;
  isOwner: boolean;
  squads: Array<{ id: string; name: string }>;
}

export function WorkoutDetailClient({ workout, isOwner, squads }: WorkoutDetailClientProps) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteWorkoutAction(workout.id);
      if (res?.error) {
        toastError(res.error);
        setIsDeleting(false);
      } else {
        toastSuccess('Workout deleted.');
        router.push('/activity');
        router.refresh();
      }
    } catch {
      toastError('Failed to delete workout.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/activity"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Activity</span>
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        )}
      </div>

      {/* Edit Workout Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Workout"
        description="Update your workout metrics, exercises, notes or proof."
        maxWidth="lg"
      >
        <WorkoutForm
          initialData={{
            id: workout.id,
            type: workout.type,
            duration: workout.duration,
            startTime: workout.startTime,
            endTime: workout.endTime,
            distance: workout.distance,
            calories: workout.calories,
            completedAt: workout.completedAt,
            notes: workout.notes,
            squadId: workout.squadId,
            photoUrl: workout.photo?.storageReference || null,
            exercises: workout.exercises,
          }}
          squads={squads}
          onSuccess={() => setIsEditOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Workout"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p>
              Are you sure you want to delete this workout? This action cannot be undone and will recalculate your streak and analytics.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

