/**
 * Tests Unitaires - Password Utils
 * ISO/IEC 29119 - TDD: Tests bcrypt
 */

import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('genere un hash bcrypt valide', async () => {
      const password = 'magique123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt prefix
    });

    it('genere des hash differents pour le meme mot de passe', async () => {
      const password = 'magique123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Salt different
    });
  });

  describe('verifyPassword', () => {
    it('retourne true si mot de passe correct', async () => {
      const password = 'magique123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('retourne false si mot de passe incorrect', async () => {
      const password = 'magique123';
      const wrongPassword = 'mauvais456';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('retourne false si hash invalide', async () => {
      const password = 'magique123';
      const invalidHash = 'not-a-valid-hash';

      const isValid = await verifyPassword(password, invalidHash);

      expect(isValid).toBe(false);
    });
  });
});
