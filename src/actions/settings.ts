'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAuth, verifyPassword, hashPassword } from '@/lib/auth';

export async function updatePreferencesAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    const profilePrivate = formData.get('profilePrivate') === 'true';
    const workoutsPrivate = formData.get('workoutsPrivate') === 'true';
    const notifyWorkouts = formData.get('notifyWorkouts') === 'true';
    const notifyReactions = formData.get('notifyReactions') === 'true';
    const notifyNudges = formData.get('notifyNudges') === 'true';
    const notifyChallenges = formData.get('notifyChallenges') === 'true';

    await db.user.update({
      where: { id: user.id },
      data: {
        profilePrivate,
        workoutsPrivate,
        notifyWorkouts,
        notifyReactions,
        notifyNudges,
        notifyChallenges,
      },
    });

    revalidatePath('/settings');
    revalidatePath('/profile');
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'Failed to update preferences.' };
  }
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireAuth();

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword) {
    return { error: 'Please fill in all password fields.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' };
  }

  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters long.' };
  }

  // Get full user with passwordHash
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return { error: 'User not found.' };
  }

  const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
  if (!isValid) {
    return { error: 'Current password is incorrect.' };
  }

  const newHash = await hashPassword(newPassword);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return { success: true };
}
