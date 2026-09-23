import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../lib/db';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '../lib/auth';
import { calculateStreaks, calculateConsistencyScore } from '../lib/analytics';
import { validateRegisterInput, validateWorkoutInput } from '../lib/validations';

describe('End-to-End Core Application Logic', () => {
  let testUserId1: string;
  let testUserId2: string;
  let testSquadId: string;
  let testWorkoutId: string;

  beforeAll(async () => {
    // Clean any previous test artifacts
    await db.user.deleteMany({
      where: { email: { in: ['integration1@cync.test', 'integration2@cync.test'] } },
    });
  });

  it('1. Validates and hashes registration credentials', async () => {
    const valid = validateRegisterInput({
      name: 'Integration User One',
      username: 'int_user_1',
      email: 'integration1@cync.test',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    });
    expect(valid.success).toBe(true);

    const hash = await hashPassword(valid.data!.password);
    expect(await verifyPassword('SecurePassword123!', hash)).toBe(true);
    expect(await verifyPassword('WrongPassword!', hash)).toBe(false);

    // Create user 1
    const user1 = await db.user.create({
      data: {
        name: valid.data!.name,
        username: valid.data!.username,
        email: valid.data!.email,
        passwordHash: hash,
        weeklyTarget: 4,
        onboarded: true,
      },
    });
    testUserId1 = user1.id;
    expect(testUserId1).toBeDefined();

    // Create user 2
    const user2 = await db.user.create({
      data: {
        name: 'Integration User Two',
        username: 'int_user_2',
        email: 'integration2@cync.test',
        passwordHash: hash,
        weeklyTarget: 3,
        onboarded: true,
      },
    });
    testUserId2 = user2.id;
    expect(testUserId2).toBeDefined();
  });

  it('2. Issues and verifies JWT session token', async () => {
    const token = await createSessionToken({
      userId: testUserId1,
      email: 'integration1@cync.test',
    });
    expect(typeof token).toBe('string');

    const verified = await verifySessionToken(token);
    expect(verified?.userId).toBe(testUserId1);
    expect(verified?.email).toBe('integration1@cync.test');
  });

  it('3. Creates a squad and handles membership joining with invite code', async () => {
    const squad = await db.squad.create({
      data: {
        name: 'Test Alpha Squad',
        description: 'Test squad accountability',
        ownerId: testUserId1,
        inviteCode: 'TESTALPH',
        members: {
          create: {
            userId: testUserId1,
            role: 'OWNER',
          },
        },
      },
    });
    testSquadId = squad.id;

    // User 2 joins squad
    const member2 = await db.squadMember.create({
      data: {
        squadId: testSquadId,
        userId: testUserId2,
        role: 'MEMBER',
      },
    });
    expect(member2.role).toBe('MEMBER');

    const totalMembers = await db.squadMember.count({ where: { squadId: testSquadId } });
    expect(totalMembers).toBe(2);
  });

  it('4. Logs workout with exercises and verifies real database persistence', async () => {
    const workoutInput = validateWorkoutInput({
      type: 'Strength',
      duration: 45,
      calories: 320,
      notes: 'Testing integration workout logging',
      exercises: [
        { exerciseName: 'Barbell Squat', sets: 4, reps: 8, weight: 100 },
        { exerciseName: 'Bench Press', sets: 3, reps: 10, weight: 70 },
      ],
    });
    expect(workoutInput.success).toBe(true);

    const workout = await db.workout.create({
      data: {
        userId: testUserId1,
        squadId: testSquadId,
        type: workoutInput.data!.type,
        duration: workoutInput.data!.duration,
        calories: workoutInput.data!.calories,
        notes: workoutInput.data!.notes,
        exercises: {
          create: workoutInput.data!.exercises.map((ex) => ({
            exerciseName: ex.exerciseName,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
          })),
        },
      },
      include: {
        exercises: true,
      },
    });
    testWorkoutId = workout.id;

    expect(workout.exercises.length).toBe(2);
    expect(workout.exercises[0].exerciseName).toBe('Barbell Squat');
  });

  it('5. Computes streak and consistency score accurately from real records', async () => {
    const userWorkouts = await db.workout.findMany({
      where: { userId: testUserId1 },
      select: { completedAt: true, duration: true },
    });

    const dates = userWorkouts.map((w) => new Date(w.completedAt));
    const { currentStreak, workedOutToday } = calculateStreaks(dates, 'UTC');

    expect(currentStreak).toBe(1);
    expect(workedOutToday).toBe(true);

    const consistency = calculateConsistencyScore(1, 4);
    expect(consistency.score).toBeGreaterThan(0);
  });

  it('6. Allows squad member to react and send a nudge', async () => {
    // User 2 reacts to User 1 workout
    const reaction = await db.reaction.create({
      data: {
        userId: testUserId2,
        workoutId: testWorkoutId,
        type: 'fire',
      },
    });
    expect(reaction.type).toBe('fire');

    // User 2 sends nudge to User 1
    const nudge = await db.nudge.create({
      data: {
        senderId: testUserId2,
        recipientId: testUserId1,
        squadId: testSquadId,
      },
    });
    expect(nudge.recipientId).toBe(testUserId1);

    // Create notification
    await db.notification.create({
      data: {
        userId: testUserId1,
        type: 'NUDGE',
        payload: JSON.stringify({ senderName: 'Integration User Two' }),
      },
    });

    const notifs = await db.notification.findMany({ where: { userId: testUserId1 } });
    expect(notifs.length).toBeGreaterThanOrEqual(1);
  });

  it('7. Handles account deletion and cascades relations cleanly', async () => {
    // Delete user 1
    await db.user.delete({ where: { id: testUserId1 } });

    // Verify workout was cascaded
    const workoutCheck = await db.workout.findUnique({ where: { id: testWorkoutId } });
    expect(workoutCheck).toBeNull();

    // Clean user 2
    await db.user.delete({ where: { id: testUserId2 } });
  });
});

