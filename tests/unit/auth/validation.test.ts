/**
 * Tests Unitaires - Validation Zod Auth
 * ISO/IEC 29119 - Tests schemas validation
 */

import { describe, it, expect } from 'vitest';
import { LoginSchema, RegisterSchema } from '@/types/auth';
import {
  VALID_LOGIN_INPUT,
  VALID_REGISTER_INPUT,
  SHORT_USERNAME_INPUT,
  MISMATCHED_PASSWORDS_INPUT,
} from '@/tests/fixtures';

describe('LoginSchema', () => {
  describe('validation reussie', () => {
    it('accepte des identifiants valides', () => {
      const result = LoginSchema.safeParse(VALID_LOGIN_INPUT);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe('emma');
        expect(result.data.password).toBe('magique123');
      }
    });

    it('accepte username de 4 caracteres minimum', () => {
      const result = LoginSchema.safeParse({
        username: 'test',
        password: 'pass',
      });

      expect(result.success).toBe(true);
    });

    it('accepte username avec underscore', () => {
      const result = LoginSchema.safeParse({
        username: 'user_name',
        password: 'password',
      });

      expect(result.success).toBe(true);
    });

    it('accepte username de 20 caracteres', () => {
      const result = LoginSchema.safeParse({
        username: 'a'.repeat(20),
        password: 'password',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('validation echouee', () => {
    it('rejette username trop court (< 4 chars)', () => {
      const result = LoginSchema.safeParse(SHORT_USERNAME_INPUT);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('4');
      }
    });

    it('rejette username trop long (> 20 chars)', () => {
      const result = LoginSchema.safeParse({
        username: 'a'.repeat(21),
        password: 'password',
      });

      expect(result.success).toBe(false);
    });

    it('rejette username avec caracteres speciaux', () => {
      const result = LoginSchema.safeParse({
        username: 'user@name',
        password: 'password',
      });

      expect(result.success).toBe(false);
    });

    it('rejette username avec espaces', () => {
      const result = LoginSchema.safeParse({
        username: 'user name',
        password: 'password',
      });

      expect(result.success).toBe(false);
    });

    it('rejette password trop court (< 4 chars)', () => {
      const result = LoginSchema.safeParse({
        username: 'validuser',
        password: 'abc',
      });

      expect(result.success).toBe(false);
    });

    it('rejette password trop long (> 50 chars)', () => {
      const result = LoginSchema.safeParse({
        username: 'validuser',
        password: 'a'.repeat(51),
      });

      expect(result.success).toBe(false);
    });

    it('rejette username manquant', () => {
      const result = LoginSchema.safeParse({
        password: 'password',
      });

      expect(result.success).toBe(false);
    });

    it('rejette password manquant', () => {
      const result = LoginSchema.safeParse({
        username: 'validuser',
      });

      expect(result.success).toBe(false);
    });
  });
});

describe('RegisterSchema', () => {
  describe('validation reussie', () => {
    it('accepte des donnees valides', () => {
      const result = RegisterSchema.safeParse(VALID_REGISTER_INPUT);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe('lucas');
        expect(result.data.password).toBe('secret456');
      }
    });

    it('accepte passwords identiques', () => {
      const result = RegisterSchema.safeParse({
        username: 'newuser',
        password: 'testpass',
        confirmPassword: 'testpass',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('validation echouee', () => {
    it('rejette passwords differents', () => {
      const result = RegisterSchema.safeParse(MISMATCHED_PASSWORDS_INPUT);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('correspondent');
      }
    });

    it('rejette confirmPassword manquant', () => {
      const result = RegisterSchema.safeParse({
        username: 'validuser',
        password: 'password',
      });

      expect(result.success).toBe(false);
    });

    it('herite des regles de LoginSchema pour username', () => {
      const result = RegisterSchema.safeParse({
        username: 'ab', // trop court
        password: 'password',
        confirmPassword: 'password',
      });

      expect(result.success).toBe(false);
    });

    it('herite des regles de LoginSchema pour password', () => {
      const result = RegisterSchema.safeParse({
        username: 'validuser',
        password: 'abc', // trop court
        confirmPassword: 'abc',
      });

      expect(result.success).toBe(false);
    });
  });
});
