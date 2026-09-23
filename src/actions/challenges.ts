'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function createChallengeAction(squadId: string, formData: FormData) {
  const user = await requireAuth();

  // Verify membership in squad
  const member = await db.squadMember.findUnique({
    where: {
      squadId_userId: {
        squadId,
        userId: user.id,
      },
    },
  });

  if (!member) {
    return { error: 'You must be a squad member to create a challenge.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const type = (formData.get('type') as string) || 'TOTAL_MINUTES';
  const target = parseInt(formData.get('target') as string, 10) || 500;
  const daysDuration = parseInt(formData.get('daysDuration') as string, 10) || 14;

  if (!title || title.length < 3) {
    return { error: 'Challenge title must be at least 3 characters.' };
  }

  if (target <= 0) {
    return { error: 'Target must be greater than 0.' };
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Math.max(1, Math.min(90, daysDuration)));

  await db.challenge.create({
    data: {
      squadId,
      creatorId: user.id,
      title,
      description,
      type,
      target,
      startDate,
      endDate,
    },
  });

  // Notify other members
  const otherMembers = await db.squadMember.findMany({
    where: {
      squadId,
      userId: { not: user.id },
    },
    include: { user: { select: { id: true, notifyChallenges: true } } },
  });

  const notifications = otherMembers
    .filter((m) => m.user.notifyChallenges)
    .map((m) => ({
      userId: m.user.id,
      type: 'CHALLENGE',
      payload: JSON.stringify({
        creatorName: user.name,
        challengeTitle: title,
        squadId,
      }),
    }));

  if (notifications.length > 0) {
    await db.notification.createMany({ data: notifications });
  }

  revalidatePath(`/squads/${squadId}`);
  redirect(`/squads/${squadId}`);
}
