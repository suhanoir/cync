'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getCurrentUser,
  requireAuth,
} from '@/lib/auth';
import { validateRegisterInput, validateLoginInput } from '@/lib/validations';

export async function registerAction(formData: FormData) {
  const name = formData.get('name') as string;
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const validation = validateRegisterInput({
    name,
    username,
    email,
    password,
    confirmPassword,
  });

  if (!validation.success || !validation.data) {
    return { error: validation.error || 'Invalid input data.' };
  }

  // Check unique email and username
  const existingUser = await db.user.findFirst({
    where: {
      OR: [
        { email: validation.data.email },
        { username: validation.data.username },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === validation.data.email) {
      return { error: 'An account with this email already exists.' };
    }
    return { error: 'This username is already taken. Please pick another.' };
  }

  const passwordHash = await hashPassword(validation.data.password);

  const newUser = await db.user.create({
    data: {
      name: validation.data.name,
      username: validation.data.username,
      email: validation.data.email,
      passwordHash,
      onboarded: false,
    },
  });

  const token = await createSessionToken({
    userId: newUser.id,
    email: newUser.email,
  });

  await setSessionCookie(token);

  redirect('/onboarding');
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const validation = validateLoginInput({ email, password });
  if (!validation.success || !validation.data) {
    return { error: validation.error || 'Please provide email and password.' };
  }

  const user = await db.user.findUnique({
    where: { email: validation.data.email },
  });

  if (!user) {
    return { error: 'Invalid email or password.' };
  }

  const isValid = await verifyPassword(validation.data.password, user.passwordHash);
  if (!isValid) {
    return { error: 'Invalid email or password.' };
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
  });

  await setSessionCookie(token);

  if (!user.onboarded) {
    redirect('/onboarding');
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/login');
}

export async function completeOnboardingAction(formData: FormData) {
  const user = await requireAuth();

  const name = (formData.get('name') as string)?.trim() || user.name;
  const username = (formData.get('username') as string)?.trim().toLowerCase() || user.username;
  const primaryGoal = (formData.get('primaryGoal') as string) || 'Build consistency';
  const weeklyTargetRaw = formData.get('weeklyTarget') as string;
  const weeklyTarget = Math.max(1, Math.min(7, parseInt(weeklyTargetRaw, 10) || 4));

  // Check if username changed and is taken
  if (username !== user.username) {
    const existing = await db.user.findUnique({ where: { username } });
    if (existing) {
      return { error: 'This username is already taken.' };
    }
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      name,
      username,
      primaryGoal,
      weeklyTarget,
      onboarded: true,
    },
  });

  redirect('/dashboard');
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireAuth();

  const name = (formData.get('name') as string)?.trim();
  const bio = (formData.get('bio') as string)?.trim() || null;
  const timezone = (formData.get('timezone') as string)?.trim() || 'UTC';
  const primaryGoal = (formData.get('primaryGoal') as string) || user.primaryGoal;
  const weeklyTarget = parseInt(formData.get('weeklyTarget') as string, 10) || user.weeklyTarget;

  if (!name || name.length < 2) {
    return { error: 'Name must be at least 2 characters.' };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      name,
      bio,
      timezone,
      primaryGoal,
      weeklyTarget: Math.max(1, Math.min(7, weeklyTarget)),
    },
  });

  return { success: true };
}

export async function deleteAccountAction() {
  const user = await requireAuth();

  await db.user.delete({
    where: { id: user.id },
  });

  await clearSessionCookie();
  redirect('/');
}

