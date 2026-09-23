'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const VALID_REACTIONS = ['fire', 'muscle', 'clap', 'bolt'];

export async function toggleReactionAction(workoutId: string, reactionType: string) {
  const user = await requireAuth();

  if (!VALID_REACTIONS.includes(reactionType)) {
    return { error: 'Invalid reaction type.' };
  }

  // Check if reaction exists
  const existing = await db.reaction.findUnique({
    where: {
      userId_workoutId_type: {
        userId: user.id,
        workoutId,
        type: reactionType,
      },
    },
  });

  if (existing) {
    // Remove reaction
    await db.reaction.delete({
      where: { id: existing.id },
    });
  } else {
    // Add reaction
    await db.reaction.create({
      data: {
        userId: user.id,
        workoutId,
        type: reactionType,
      },
    });

    // Notify workout owner
    const workout = await db.workout.findUnique({
      where: { id: workoutId },
      include: { user: { select: { id: true, notifyReactions: true } } },
    });

    if (workout && workout.userId !== user.id && workout.user.notifyReactions) {
      await db.notification.create({
        data: {
          userId: workout.userId,
          type: 'REACTION',
          payload: JSON.stringify({
            actorName: user.name,
            reactionType,
            workoutId,
            workoutType: workout.type,
          }),
        },
      });
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/activity');
  revalidatePath(`/workouts/${workoutId}`);

  return { success: true };
}

export async function markNotificationReadAction(notificationId: string) {
  const user = await requireAuth();

  await db.notification.updateMany({
    where: {
      id: notificationId,
      userId: user.id,
    },
    data: { readAt: new Date() },
  });

  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

export async function markAllNotificationsReadAction() {
  const user = await requireAuth();

  await db.notification.updateMany({
    where: {
      userId: user.id,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

export async function clearNotificationsAction() {
  const user = await requireAuth();

  await db.notification.deleteMany({
    where: { userId: user.id },
  });

  revalidatePath('/notifications');
}
