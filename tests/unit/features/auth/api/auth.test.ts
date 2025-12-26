/**
 * Tests Unitaires - Auth API Functions
 * ISO/IEC 29119 - TDD: Tests fonctions fetch auth
 */

import { describe, it, expect } from 'vitest';
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
} from '@/features/auth/api/auth';
import {
  VALID_LOGIN_INPUT,
  VALID_REGISTER_INPUT,
  INVALID_PASSWORD_INPUT,
  SHORT_USERNAME_INPUT,
  EMMA_USER_FIXTURE,
  LUCAS_USER_FIXTURE,
} from '../../../../fixtures';

// MSW server is started globally in tests/setup.ts

describe('Auth API Functions', () => {
  describe('fetchCurrentUser', () => {
    it('retourne authenticated false sans session', async () => {
      const result = await fetchCurrentUser();

      expect(result.authenticated).toBe(false);
      expect(result.user).toBeNull();
    });
  });

  describe('loginUser', () => {
    it('retourne succes avec identifiants valides', async () => {
      const result = await loginUser(VALID_LOGIN_INPUT);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.user.username).toBe(EMMA_USER_FIXTURE.username);
      }
    });

    it('retourne erreur avec password invalide', async () => {
      const result = await loginUser(INVALID_PASSWORD_INPUT);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('retourne erreur validation avec username trop court', async () => {
      const result = await loginUser(SHORT_USERNAME_INPUT);

      expect(result.success).toBe(false);
    });
  });

  describe('registerUser', () => {
    it('retourne succes avec donnees valides', async () => {
      const result = await registerUser(VALID_REGISTER_INPUT);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.user.username).toBe(LUCAS_USER_FIXTURE.username);
      }
    });

    it('retourne erreur si username existe', async () => {
      const result = await registerUser({
        username: 'emma',
        password: 'newpassword',
        confirmPassword: 'newpassword',
      });

      expect(result.success).toBe(false);
    });

    it('retourne erreur si passwords differents', async () => {
      const result = await registerUser({
        username: 'newuser',
        password: 'password1',
        confirmPassword: 'password2',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('logoutUser', () => {
    it('se complete sans erreur', async () => {
      await expect(logoutUser()).resolves.not.toThrow();
    });
  });
});
