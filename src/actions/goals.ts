'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function createGoalAction(formData: FormData) {
  const user = await requireAuth();

  const title = (formData.get('title') as string)?.trim();
  const type = (formData.get('type') as string) || 'WORKOUTS_PER_WEEK';
  const target = parseInt(formData.get('target') as string, 10);

  if (!title || title.length < 2) {
    return { error: 'Please enter a goal title.' };
  }

  if (isNaN(target) || target <= 0) {
    return { error: 'Please enter a target greater than 0.' };
  }

  await db.goal.create({
    data: {
      userId: user.id,
      title,
      type,
      target,
      status: 'ACTIVE',
    },
  });

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateGoalStatusAction(goalId: string, status: string) {
  const user = await requireAuth();

  const goal = await db.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal || goal.userId !== user.id) {
    return { error: 'Goal not found or unauthorized.' };
  }

  await db.goal.update({
    where: { id: goalId },
    data: { status },
  });

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteGoalAction(goalId: string) {
  const user = await requireAuth();

  const goal = await db.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal || goal.userId !== user.id) {
    return { error: 'Goal not found or unauthorized.' };
  }

  await db.goal.delete({
    where: { id: goalId },
  });

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true };
}
