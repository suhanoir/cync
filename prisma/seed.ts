import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CYNC development database...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.nudge.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutPhoto.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.squadMember.deleteMany();
  await prisma.squad.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Demo Users
  const suhan = await prisma.user.create({
    data: {
      name: 'Suhan',
      username: 'suhan',
      email: 'suhan@cync.fit',
      passwordHash,
      bio: 'Consistency over intensity.',
      primaryGoal: 'Build consistency',
      weeklyTarget: 4,
      onboarded: true,
      timezone: 'UTC',
    },
  });

  const arjun = await prisma.user.create({
    data: {
      name: 'Arjun',
      username: 'arjun',
      email: 'arjun@cync.fit',
      passwordHash,
      bio: 'Training for half marathon.',
      primaryGoal: 'Improve fitness',
      weeklyTarget: 4,
      onboarded: true,
      timezone: 'UTC',
    },
  });

  const rahul = await prisma.user.create({
    data: {
      name: 'Rahul',
      username: 'rahul',
      email: 'rahul@cync.fit',
      passwordHash,
      bio: 'Getting back into the groove.',
      primaryGoal: 'Stay active',
      weeklyTarget: 3,
      onboarded: true,
      timezone: 'UTC',
    },
  });

  const kiran = await prisma.user.create({
    data: {
      name: 'Kiran',
      username: 'kiran',
      email: 'kiran@cync.fit',
      passwordHash,
      bio: 'Powerlifting & mobility.',
      primaryGoal: 'Get stronger',
      weeklyTarget: 5,
      onboarded: true,
      timezone: 'UTC',
    },
  });

  console.log('Created demo users: Suhan, Arjun, Rahul, Kiran');

  // 2. Create Primary Squad "IRON MIND"
  const squad = await prisma.squad.create({
    data: {
      name: 'IRON MIND',
      description: 'Daily discipline and accountability. Show up every day.',
      ownerId: suhan.id,
      inviteCode: 'IRONMIND',
      isPrivate: false,
    },
  });

  // Add members
  await prisma.squadMember.createMany({
    data: [
      { squadId: squad.id, userId: suhan.id, role: 'OWNER' },
      { squadId: squad.id, userId: arjun.id, role: 'MEMBER' },
      { squadId: squad.id, userId: rahul.id, role: 'MEMBER' },
      { squadId: squad.id, userId: kiran.id, role: 'MEMBER' },
    ],
  });

  console.log('Created squad IRON MIND with 4 members');

  // 3. Create Workouts
  const now = new Date();
  const getPastDate = (daysAgo: number, hoursAgo = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(d.getHours() - hoursAgo);
    return d;
  };

  // Suhan's workouts (6 day streak: days 0, 1, 2, 3, 4, 5)
  const suhanToday = await prisma.workout.create({
    data: {
      userId: suhan.id,
      squadId: squad.id,
      type: 'Strength',
      duration: 52,
      calories: 380,
      notes: 'Heavy bench press and pull-ups. Felt locked in.',
      completedAt: getPastDate(0, 3),
      exercises: {
        create: [
          { exerciseName: 'Barbell Bench Press', sets: 4, reps: 8, weight: 80 },
          { exerciseName: 'Weighted Pull-ups', sets: 4, reps: 6, weight: 15 },
          { exerciseName: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 26 },
        ],
      },
    },
  });

  await prisma.workout.createMany({
    data: [
      {
        userId: suhan.id,
        squadId: squad.id,
        type: 'Cardio',
        duration: 40,
        calories: 320,
        notes: 'Incline treadmill walk & row machine.',
        completedAt: getPastDate(1, 4),
      },
      {
        userId: suhan.id,
        squadId: squad.id,
        type: 'Strength',
        duration: 55,
        calories: 410,
        notes: 'Leg day: squats & Romanian deadlifts.',
        completedAt: getPastDate(2, 5),
      },
      {
        userId: suhan.id,
        squadId: squad.id,
        type: 'HIIT',
        duration: 35,
        calories: 310,
        notes: 'Kettlebell swings and burpees.',
        completedAt: getPastDate(3, 2),
      },
      {
        userId: suhan.id,
        squadId: squad.id,
        type: 'Strength',
        duration: 48,
        calories: 360,
        notes: 'Shoulders & arms pump session.',
        completedAt: getPastDate(4, 6),
      },
      {
        userId: suhan.id,
        squadId: squad.id,
        type: 'Running',
        duration: 30,
        distance: 4.8,
        calories: 290,
        notes: 'Easy pace recovery run.',
        completedAt: getPastDate(5, 7),
      },
    ],
  });

  // Arjun's workouts (Today 47 min running, 4 day streak)
  const arjunToday = await prisma.workout.create({
    data: {
      userId: arjun.id,
      squadId: squad.id,
      type: 'Running',
      duration: 47,
      distance: 7.2,
      calories: 460,
      notes: 'Morning tempo run by the lake.',
      completedAt: getPastDate(0, 4),
    },
  });

  await prisma.workout.createMany({
    data: [
      {
        userId: arjun.id,
        squadId: squad.id,
        type: 'Running',
        duration: 42,
        distance: 6.0,
        calories: 390,
        notes: 'Interval intervals.',
        completedAt: getPastDate(1, 3),
      },
      {
        userId: arjun.id,
        squadId: squad.id,
        type: 'Cycling',
        duration: 60,
        distance: 18.5,
        calories: 450,
        notes: 'Low impact cross-training.',
        completedAt: getPastDate(2, 6),
      },
      {
        userId: arjun.id,
        squadId: squad.id,
        type: 'Running',
        duration: 35,
        distance: 5.1,
        calories: 330,
        notes: 'Quick evening shakeout.',
        completedAt: getPastDate(3, 4),
      },
    ],
  });

  // Kiran's workouts (Today 35 min Yoga, 9 day streak)
  const kiranToday = await prisma.workout.create({
    data: {
      userId: kiran.id,
      squadId: squad.id,
      type: 'Yoga',
      duration: 35,
      calories: 140,
      notes: 'Full body mobility flow & breathing.',
      completedAt: getPastDate(0, 6),
    },
  });

  for (let i = 1; i <= 8; i++) {
    await prisma.workout.create({
      data: {
        userId: kiran.id,
        squadId: squad.id,
        type: i % 2 === 0 ? 'Strength' : 'Calisthenics',
        duration: 40 + (i % 3) * 10,
        calories: 300,
        notes: `Consistency day ${i + 1}`,
        completedAt: getPastDate(i, 5),
      },
    });
  }

  // Rahul's workouts (2 workouts this week, skipped today)
  await prisma.workout.createMany({
    data: [
      {
        userId: rahul.id,
        squadId: squad.id,
        type: 'Walking',
        duration: 45,
        distance: 3.8,
        calories: 210,
        notes: 'Long brisk evening walk.',
        completedAt: getPastDate(2, 3),
      },
      {
        userId: rahul.id,
        squadId: squad.id,
        type: 'Strength',
        duration: 40,
        calories: 280,
        notes: 'Bodyweight basics at home.',
        completedAt: getPastDate(4, 5),
      },
    ],
  });

  console.log('Created realistic workouts with streaks');

  // 4. Reactions
  await prisma.reaction.createMany({
    data: [
      { userId: arjun.id, workoutId: suhanToday.id, type: 'fire' },
      { userId: kiran.id, workoutId: suhanToday.id, type: 'muscle' },
      { userId: suhan.id, workoutId: arjunToday.id, type: 'clap' },
      { userId: suhan.id, workoutId: kiranToday.id, type: 'bolt' },
    ],
  });

  // 5. Squad Challenge
  const challengeStart = getPastDate(5);
  const challengeEnd = new Date(now);
  challengeEnd.setDate(challengeEnd.getDate() + 9);

  await prisma.challenge.create({
    data: {
      squadId: squad.id,
      creatorId: suhan.id,
      title: '500 Minute Challenge',
      description: 'Squad goal: Accumulate 500 total active workout minutes together.',
      type: 'TOTAL_MINUTES',
      target: 500,
      startDate: challengeStart,
      endDate: challengeEnd,
    },
  });

  // 6. Personal Goals for Suhan
  await prisma.goal.createMany({
    data: [
      {
        userId: suhan.id,
        title: '4 workouts per week',
        type: 'WORKOUTS_PER_WEEK',
        target: 4,
        status: 'ACTIVE',
      },
      {
        userId: suhan.id,
        title: '200 workout minutes',
        type: 'WORKOUT_MINUTES',
        target: 200,
        status: 'ACTIVE',
      },
      {
        userId: suhan.id,
        title: 'Maintain a 7-day streak',
        type: 'STREAK_DAYS',
        target: 7,
        status: 'ACTIVE',
      },
    ],
  });

  // 7. Initial Notification for Suhan
  await prisma.notification.create({
    data: {
      userId: suhan.id,
      type: 'REACTION',
      payload: JSON.stringify({
        actorName: 'Arjun',
        reactionType: 'fire',
        workoutTitle: 'Strength (52 min)',
      }),
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

