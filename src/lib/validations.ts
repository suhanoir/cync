import { WORKOUT_TYPES, WorkoutType } from './types';
import {
  validateWorkoutTimeRange,
  MAX_WORKOUT_DURATION_MINUTES,
} from './workout-time';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export function validateRegisterInput(data: {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}): ValidationResult<{
  name: string;
  username: string;
  email: string;
  password: string;
}> {
  const fieldErrors: Record<string, string> = {};

  const name = data.name?.trim() || '';
  if (!name || name.length < 2) {
    fieldErrors.name = 'Name must be at least 2 characters.';
  } else if (name.length > 50) {
    fieldErrors.name = 'Name cannot exceed 50 characters.';
  }

  const username = data.username?.trim().toLowerCase() || '';
  const usernameRegex = /^[a-z0-9_-]{3,20}$/;
  if (!username) {
    fieldErrors.username = 'Username is required.';
  } else if (!usernameRegex.test(username)) {
    fieldErrors.username = 'Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores.';
  }

  const email = data.email?.trim().toLowerCase() || '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    fieldErrors.email = 'Please provide a valid email address.';
  }

  const password = data.password || '';
  if (!password || password.length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters.';
  }

  if (password !== data.confirmPassword) {
    fieldErrors.confirmPassword = 'Passwords do not match.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: Object.values(fieldErrors)[0],
      fieldErrors,
    };
  }

  return {
    success: true,
    data: { name, username, email, password },
  };
}

export function validateLoginInput(data: {
  email?: string;
  password?: string;
}): ValidationResult<{ email: string; password: string }> {
  const email = data.email?.trim().toLowerCase() || '';
  const password = data.password || '';

  if (!email) {
    return { success: false, error: 'Email is required.' };
  }
  if (!password) {
    return { success: false, error: 'Password is required.' };
  }

  return {
    success: true,
    data: { email, password },
  };
}

export function validateWorkoutInput(data: {
  type?: string;
  duration?: number | string | null;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  distance?: number | string | null;
  calories?: number | string | null;
  completedAt?: string | Date;
  notes?: string;
  squadId?: string | null;
  exercises?: Array<{
    exerciseName?: string;
    sets?: number | string;
    reps?: number | string;
    weight?: number | string;
  }>;
}): ValidationResult<{
  type: WorkoutType;
  duration: number;
  startTime: Date | null;
  endTime: Date | null;
  distance: number | null;
  calories: number | null;
  completedAt: Date;
  notes: string | null;
  squadId: string | null;
  exercises: Array<{
    exerciseName: string;
    sets: number | null;
    reps: number | null;
    weight: number | null;
  }>;
}> {
  const fieldErrors: Record<string, string> = {};

  if (!data.type || !WORKOUT_TYPES.includes(data.type as WorkoutType)) {
    fieldErrors.type = `Please select a valid workout type (${WORKOUT_TYPES.join(', ')}).`;
  }

  let durationNum = 0;
  let parsedStartTime: Date | null = null;
  let parsedEndTime: Date | null = null;

  if (data.startTime && data.endTime) {
    const timeValidation = validateWorkoutTimeRange(data.startTime, data.endTime);
    if (!timeValidation.valid) {
      fieldErrors.duration = timeValidation.error || 'Invalid start and end times.';
    } else {
      durationNum = timeValidation.duration;
      parsedStartTime = typeof data.startTime === 'string' ? new Date(data.startTime) : data.startTime;
      parsedEndTime = typeof data.endTime === 'string' ? new Date(data.endTime) : data.endTime;
    }
  } else {
    // If start/end times not both provided, validate duration directly
    const parsedDuration =
      typeof data.duration === 'string' ? parseInt(data.duration, 10) : Number(data.duration);

    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      fieldErrors.duration = 'Duration must be greater than 0 minutes.';
    } else if (parsedDuration > MAX_WORKOUT_DURATION_MINUTES) {
      fieldErrors.duration = 'Workout duration cannot exceed 12 hours.';
    } else {
      durationNum = parsedDuration;
    }
  }

  let distanceNum: number | null = null;
  if (data.distance !== undefined && data.distance !== null && data.distance !== '') {
    distanceNum = typeof data.distance === 'string' ? parseFloat(data.distance) : Number(data.distance);
    if (isNaN(distanceNum) || distanceNum < 0) {
      fieldErrors.distance = 'Distance must be a positive number.';
    }
  }

  let caloriesNum: number | null = null;
  if (data.calories !== undefined && data.calories !== null && data.calories !== '') {
    caloriesNum = typeof data.calories === 'string' ? parseInt(data.calories, 10) : Number(data.calories);
    if (isNaN(caloriesNum) || caloriesNum < 0) {
      fieldErrors.calories = 'Calories must be a positive number.';
    }
  }

  let date: Date;
  if (parsedEndTime) {
    date = parsedEndTime;
  } else if (!data.completedAt) {
    date = new Date();
  } else {
    date = new Date(data.completedAt);
    if (isNaN(date.getTime())) {
      fieldErrors.completedAt = 'Invalid workout completion date.';
    } else if (date > new Date(Date.now() + 60 * 60 * 1000)) {
      fieldErrors.completedAt = 'Workout date cannot be set in the future.';
    }
  }

  const cleanExercises: Array<{
    exerciseName: string;
    sets: number | null;
    reps: number | null;
    weight: number | null;
  }> = [];

  if (Array.isArray(data.exercises)) {
    for (const ex of data.exercises) {
      if (ex.exerciseName && ex.exerciseName.trim().length > 0) {
        cleanExercises.push({
          exerciseName: ex.exerciseName.trim().slice(0, 100),
          sets: ex.sets ? Math.max(1, parseInt(String(ex.sets), 10) || 1) : null,
          reps: ex.reps ? Math.max(1, parseInt(String(ex.reps), 10) || 1) : null,
          weight: ex.weight ? Math.max(0, parseFloat(String(ex.weight)) || 0) : null,
        });
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: Object.values(fieldErrors)[0],
      fieldErrors,
    };
  }

  return {
    success: true,
    data: {
      type: data.type as WorkoutType,
      duration: durationNum,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      distance: distanceNum,
      calories: caloriesNum,
      completedAt: date,
      notes: data.notes?.trim() ? data.notes.trim().slice(0, 1000) : null,
      squadId: data.squadId || null,
      exercises: cleanExercises,
    },
  };
}

export function validateSquadInput(data: {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}): ValidationResult<{ name: string; description: string | null; isPrivate: boolean }> {
  const name = data.name?.trim() || '';
  if (!name || name.length < 2) {
    return { success: false, error: 'Squad name must be at least 2 characters.' };
  }
  if (name.length > 50) {
    return { success: false, error: 'Squad name cannot exceed 50 characters.' };
  }

  const description = data.description?.trim() ? data.description.trim().slice(0, 300) : null;
  const isPrivate = Boolean(data.isPrivate);

  return {
    success: true,
    data: { name, description, isPrivate },
  };
}

