export type WorkoutType =
  | 'Strength'
  | 'Cardio'
  | 'Running'
  | 'Cycling'
  | 'Calisthenics'
  | 'HIIT'
  | 'Walking'
  | 'Sports'
  | 'Yoga'
  | 'Other';

export const WORKOUT_TYPES: WorkoutType[] = [
  'Strength',
  'Cardio',
  'Running',
  'Cycling',
  'Calisthenics',
  'HIIT',
  'Walking',
  'Sports',
  'Yoga',
  'Other',
];

export type GoalType = 'WORKOUTS_PER_WEEK' | 'WORKOUT_MINUTES' | 'STREAK_DAYS';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'ARCHIVED';

export type ChallengeType = 'TOTAL_MINUTES' | 'TOTAL_WORKOUTS' | 'CONSECUTIVE_DAYS';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  timezone: string;
  primaryGoal: string | null;
  weeklyTarget: number;
  onboarded: boolean;
}

export interface ExerciseInput {
  exerciseName: string;
  sets?: number;
  reps?: number;
  weight?: number;
}

export interface DayActivityStatus {
  dayName: string;
  dayShort: string;
  dateStr: string;
  isToday: boolean;
  hasActivity: boolean;
  totalDuration: number;
  workoutCount: number;
}

