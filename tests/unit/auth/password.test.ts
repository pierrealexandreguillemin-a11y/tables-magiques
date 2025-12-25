/**
 * Tests Unitaires - Password
 * ISO/IEC 29119 - Tests hachage bcrypt
 */

import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('genere un hash bcrypt valide', async () => {
      const password = 'magique123';
      const hash = await hashPassword(password);

      // Le hash bcrypt commence par $2a$ ou $2b$
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('genere des hash differents pour le meme password', async () => {
      const password = 'secret456';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Les hash doivent etre differents (salt aleatoire)
      expect(hash1).not.toBe(hash2);
    });

    it('genere un hash de longueur correcte', async () => {
      const password = 'test1234';
      const hash = await hashPassword(password);

      // Un hash bcrypt fait 60 caracteres
      expect(hash.length).toBe(60);
    });
  });

  describe('verifyPassword', () => {
    it('retourne true pour password correct', async () => {
      const password = 'magique123';
      const hash = await hashPassword(password);

      const result = await verifyPassword(password, hash);

      expect(result).toBe(true);
    });

    it('retourne false pour password incorrect', async () => {
      const password = 'correct';
      const wrongPassword = 'incorrect';
      const hash = await hashPassword(password);

      const result = await verifyPassword(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('retourne false pour hash invalide', async () => {
      const password = 'test';
      const invalidHash = 'not-a-valid-hash';

      const result = await verifyPassword(password, invalidHash);

      expect(result).toBe(false);
    });

    it('gere les caracteres speciaux dans le password', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await hashPassword(password);

      const result = await verifyPassword(password, hash);

      expect(result).toBe(true);
    });

    it('gere les caracteres unicode', async () => {
      const password = 'motdepasse🦄✨';
      const hash = await hashPassword(password);

      const result = await verifyPassword(password, hash);

      expect(result).toBe(true);
    });

    it('est sensible a la casse', async () => {
      const password = 'CaseSensitive';
      const hash = await hashPassword(password);

      const result = await verifyPassword('casesensitive', hash);

      expect(result).toBe(false);
    });
  });
});
