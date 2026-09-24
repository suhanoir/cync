'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { validateWorkoutInput } from '@/lib/validations';
import { WorkoutType } from '@/lib/types';

export async function createWorkoutAction(payload: {
  type: string;
  duration?: number | string | null;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  distance?: number | string | null;
  calories?: number | string | null;
  completedAt?: string | Date;
  notes?: string;
  squadId?: string | null;
  photoUrl?: string | null;
  exercises?: Array<{
    exerciseName: string;
    sets?: number | string;
    reps?: number | string;
    weight?: number | string;
  }>;
}) {
  const user = await requireAuth();

  const validation = validateWorkoutInput(payload);
  if (!validation.success || !validation.data) {
    return { error: validation.error || 'Invalid workout data.' };
  }

  const {
    type,
    duration,
    startTime,
    endTime,
    distance,
    calories,
    completedAt,
    notes,
    squadId,
    exercises,
  } = validation.data;

  // Verify squad membership if squadId was provided
  let verifiedSquadId: string | null = null;
  if (squadId) {
    const membership = await db.squadMember.findUnique({
      where: {
        squadId_userId: {
          squadId,
          userId: user.id,
        },
      },
    });
    if (membership) {
      verifiedSquadId = squadId;
    }
  }

  // Create workout record with transaction
  const workout = await db.workout.create({
    data: {
      userId: user.id,
      squadId: verifiedSquadId,
      type,
      duration,
      startTime,
      endTime,
      distance,
      calories,
      completedAt,
      notes,
      exercises: {
        create: exercises.map((ex) => ({
          exerciseName: ex.exerciseName,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        })),
      },
      ...(payload.photoUrl
        ? {
            photo: {
              create: {
                userId: user.id,
                storageReference: payload.photoUrl,
              },
            },
          }
        : {}),
    },
  });

  // Notify squad members if associated with a squad
  if (verifiedSquadId) {
    const squadMembers = await db.squadMember.findMany({
      where: {
        squadId: verifiedSquadId,
        userId: { not: user.id },
      },
      include: {
        user: {
          select: { id: true, notifyWorkouts: true },
        },
      },
    });

    const notificationsToCreate = squadMembers
      .filter((m) => m.user.notifyWorkouts)
      .map((m) => ({
        userId: m.user.id,
        type: 'WORKOUT_COMPLETED',
        payload: JSON.stringify({
          actorName: user.name,
          actorUsername: user.username,
          workoutId: workout.id,
          workoutType: type,
          duration,
        }),
      }));

    if (notificationsToCreate.length > 0) {
      await db.notification.createMany({
        data: notificationsToCreate,
      });
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/activity');
  revalidatePath('/progress');
  if (verifiedSquadId) revalidatePath(`/squads/${verifiedSquadId}`);

  return { success: true, workoutId: workout.id };
}

export async function updateWorkoutAction(
  workoutId: string,
  payload: {
    type: string;
    duration?: number | string | null;
    startTime?: string | Date | null;
    endTime?: string | Date | null;
    distance?: number | string | null;
    calories?: number | string | null;
    completedAt?: string | Date;
    notes?: string;
    photoUrl?: string | null;
    exercises?: Array<{
      exerciseName: string;
      sets?: number | string;
      reps?: number | string;
      weight?: number | string;
    }>;
  }
) {
  const user = await requireAuth();

  // Verify ownership
  const existing = await db.workout.findUnique({
    where: { id: workoutId },
    include: { photo: true },
  });

  if (!existing || existing.userId !== user.id) {
    return { error: 'Workout not found or you are not authorized to edit it.' };
  }

  const validation = validateWorkoutInput(payload);
  if (!validation.success || !validation.data) {
    return { error: validation.error || 'Invalid workout data.' };
  }

  const {
    type,
    duration,
    startTime,
    endTime,
    distance,
    calories,
    completedAt,
    notes,
    exercises,
  } = validation.data;

  // Update in a transaction
  await db.$transaction(async (tx) => {
    // Delete existing exercises and recreate
    await tx.workoutExercise.deleteMany({
      where: { workoutId },
    });

    if (exercises.length > 0) {
      await tx.workoutExercise.createMany({
        data: exercises.map((ex) => ({
          workoutId,
          exerciseName: ex.exerciseName,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        })),
      });
    }

    // Photo updates
    if (payload.photoUrl) {
      if (existing.photo) {
        await tx.workoutPhoto.update({
          where: { workoutId },
          data: { storageReference: payload.photoUrl },
        });
      } else {
        await tx.workoutPhoto.create({
          data: {
            workoutId,
            userId: user.id,
            storageReference: payload.photoUrl,
          },
        });
      }
    } else if (payload.photoUrl === null && existing.photo) {
      // Photo explicitly removed
      await tx.workoutPhoto.delete({
        where: { workoutId },
      });
    }

    await tx.workout.update({
      where: { id: workoutId },
      data: {
        type,
        duration,
        startTime,
        endTime,
        distance,
        calories,
        completedAt,
        notes,
      },
    });
  });

  revalidatePath('/dashboard');
  revalidatePath('/activity');
  revalidatePath(`/workouts/${workoutId}`);
  revalidatePath('/progress');

  return { success: true };
}

export async function deleteWorkoutAction(workoutId: string) {
  const user = await requireAuth();

  const existing = await db.workout.findUnique({
    where: { id: workoutId },
  });

  if (!existing || existing.userId !== user.id) {
    return { error: 'Workout not found or you are not authorized to delete it.' };
  }

  await db.workout.delete({
    where: { id: workoutId },
  });

  revalidatePath('/dashboard');
  revalidatePath('/activity');
  revalidatePath('/progress');

  return { success: true };
}

