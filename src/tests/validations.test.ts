import { describe, it, expect } from 'vitest';
import {
  validateRegisterInput,
  validateLoginInput,
  validateWorkoutInput,
  validateSquadInput,
} from '../lib/validations';

describe('Validation Helpers', () => {
  describe('validateRegisterInput', () => {
    it('accepts valid registration data', () => {
      const res = validateRegisterInput({
        name: 'Suhan',
        username: 'suhan_fit',
        email: 'suhan@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(res.success).toBe(true);
      expect(res.data?.username).toBe('suhan_fit');
    });

    it('rejects passwords that do not match', () => {
      const res = validateRegisterInput({
        name: 'Suhan',
        username: 'suhan_fit',
        email: 'suhan@example.com',
        password: 'Password123!',
        confirmPassword: 'WrongPassword!',
      });
      expect(res.success).toBe(false);
      expect(res.fieldErrors?.confirmPassword).toBeDefined();
    });

    it('rejects short passwords', () => {
      const res = validateRegisterInput({
        name: 'Suhan',
        username: 'suhan',
        email: 'suhan@example.com',
        password: 'short',
        confirmPassword: 'short',
      });
      expect(res.success).toBe(false);
      expect(res.fieldErrors?.password).toBeDefined();
    });

    it('rejects invalid username formats', () => {
      const res = validateRegisterInput({
        name: 'Suhan',
        username: 'su han with spaces',
        email: 'suhan@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(res.success).toBe(false);
      expect(res.fieldErrors?.username).toBeDefined();
    });
  });

  describe('validateLoginInput', () => {
    it('validates required email and password', () => {
      expect(validateLoginInput({}).success).toBe(false);
      expect(validateLoginInput({ email: 'test@example.com' }).success).toBe(false);
      expect(validateLoginInput({ email: 'test@example.com', password: 'secret' }).success).toBe(true);
    });
  });

  describe('validateWorkoutInput', () => {
    it('accepts valid workout with exercises', () => {
      const res = validateWorkoutInput({
        type: 'Strength',
        duration: 45,
        calories: 350,
        notes: 'Great workout',
        exercises: [
          { exerciseName: 'Squat', sets: 4, reps: 8, weight: 100 },
        ],
      });
      expect(res.success).toBe(true);
      expect(res.data?.type).toBe('Strength');
      expect(res.data?.duration).toBe(45);
      expect(res.data?.exercises.length).toBe(1);
    });

    it('rejects invalid workout type and 0 duration', () => {
      const res = validateWorkoutInput({
        type: 'InvalidType',
        duration: 0,
      });
      expect(res.success).toBe(false);
      expect(res.fieldErrors?.type).toBeDefined();
      expect(res.fieldErrors?.duration).toBeDefined();
    });
  });

  describe('validateSquadInput', () => {
    it('validates squad name length', () => {
      expect(validateSquadInput({ name: 'A' }).success).toBe(false);
      expect(validateSquadInput({ name: 'Iron Squad' }).success).toBe(true);
    });
  });
});

