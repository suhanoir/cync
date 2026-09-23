'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { validateSquadInput } from '@/lib/validations';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createSquadAction(formData: FormData) {
  const user = await requireAuth();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const isPrivate = formData.get('isPrivate') === 'true';

  const validation = validateSquadInput({ name, description, isPrivate });
  if (!validation.success || !validation.data) {
    return { error: validation.error || 'Invalid squad details.' };
  }

  // Generate unique invite code
  let inviteCode = generateInviteCode();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await db.squad.findUnique({ where: { inviteCode } });
    if (!existing) break;
    inviteCode = generateInviteCode();
    attempts++;
  }

  const squad = await db.squad.create({
    data: {
      name: validation.data.name,
      description: validation.data.description,
      isPrivate: validation.data.isPrivate,
      ownerId: user.id,
      inviteCode,
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  });

  revalidatePath('/squads');
  revalidatePath('/dashboard');
  redirect(`/squads/${squad.id}`);
}

export async function joinSquadAction(inviteCodeInput: string) {
  const user = await requireAuth();
  const inviteCode = inviteCodeInput?.trim().toUpperCase();

  if (!inviteCode || inviteCode.length < 4) {
    return { error: 'Please enter a valid squad invite code.' };
  }

  const squad = await db.squad.findUnique({
    where: { inviteCode },
  });

  if (!squad) {
    return { error: 'Squad not found with that invite code.' };
  }

  // Check if already a member
  const existingMembership = await db.squadMember.findUnique({
    where: {
      squadId_userId: {
        squadId: squad.id,
        userId: user.id,
      },
    },
  });

  if (existingMembership) {
    return { error: 'You are already a member of this squad.', squadId: squad.id };
  }

  // Add member
  await db.squadMember.create({
    data: {
      squadId: squad.id,
      userId: user.id,
      role: 'MEMBER',
    },
  });

  // Notify squad owner
  if (squad.ownerId !== user.id) {
    await db.notification.create({
      data: {
        userId: squad.ownerId,
        type: 'SQUAD_JOIN',
        payload: JSON.stringify({
          actorName: user.name,
          squadName: squad.name,
          squadId: squad.id,
        }),
      },
    });
  }

  revalidatePath('/squads');
  revalidatePath(`/squads/${squad.id}`);
  revalidatePath('/dashboard');

  return { success: true, squadId: squad.id };
}

export async function leaveSquadAction(squadId: string) {
  const user = await requireAuth();

  const membership = await db.squadMember.findUnique({
    where: {
      squadId_userId: {
        squadId,
        userId: user.id,
      },
    },
    include: { squad: true },
  });

  if (!membership) {
    return { error: 'You are not a member of this squad.' };
  }

  if (membership.role === 'OWNER') {
    // If owner leaves and there are other members, assign next member as owner
    const otherMembers = await db.squadMember.findMany({
      where: {
        squadId,
        userId: { not: user.id },
      },
      orderBy: { joinedAt: 'asc' },
    });

    if (otherMembers.length > 0) {
      await db.$transaction([
        db.squadMember.delete({
          where: { id: membership.id },
        }),
        db.squadMember.update({
          where: { id: otherMembers[0].id },
          data: { role: 'OWNER' },
        }),
        db.squad.update({
          where: { id: squadId },
          data: { ownerId: otherMembers[0].userId },
        }),
      ]);
    } else {
      // Last person leaving, delete squad
      await db.squad.delete({
        where: { id: squadId },
      });
    }
  } else {
    await db.squadMember.delete({
      where: { id: membership.id },
    });
  }

  revalidatePath('/squads');
  revalidatePath('/dashboard');
  redirect('/squads');
}

export async function sendNudgeAction(recipientId: string, squadId?: string) {
  const sender = await requireAuth();

  if (recipientId === sender.id) {
    return { error: 'You cannot nudge yourself.' };
  }

  // Rate limit check: Max 1 nudge per sender-recipient pair per 6 hours
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const recentNudge = await db.nudge.findFirst({
    where: {
      senderId: sender.id,
      recipientId,
      createdAt: { gte: sixHoursAgo },
    },
  });

  if (recentNudge) {
    return { error: 'You have already nudged this person recently. Give them a few hours!' };
  }

  // Record nudge
  await db.nudge.create({
    data: {
      senderId: sender.id,
      recipientId,
      squadId: squadId || null,
    },
  });

  // Create recipient notification
  const recipient = await db.user.findUnique({
    where: { id: recipientId },
    select: { notifyNudges: true },
  });

  if (recipient?.notifyNudges) {
    await db.notification.create({
      data: {
        userId: recipientId,
        type: 'NUDGE',
        payload: JSON.stringify({
          senderName: sender.name,
          senderUsername: sender.username,
        }),
      },
    });
  }

  return { success: true };
}

