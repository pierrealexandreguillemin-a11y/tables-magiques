/**
 * Tests Unitaires - Session Management
 * ISO/IEC 29119 - TDD: Tests sessions Redis
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EMMA_USER_FIXTURE } from '@/tests/fixtures';

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
};

vi.mock('@/lib/db/upstash', () => ({
  getRedis: () => mockRedis,
  KEYS: {
    session: (token: string) => `tm:session:${token}`,
  },
}));

// Import apres mock
import {
  createSession,
  getSession,
  deleteSession,
  refreshSession,
} from '@/lib/auth/session';

// Fixture SafeUser
const SAFE_USER_FIXTURE = {
  id: EMMA_USER_FIXTURE.id,
  username: EMMA_USER_FIXTURE.username,
  createdAt: EMMA_USER_FIXTURE.createdAt,
  lastLoginAt: EMMA_USER_FIXTURE.lastLoginAt,
};

describe('Session Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.get.mockReset();
    mockRedis.set.mockReset();
    mockRedis.del.mockReset();
  });

  describe('createSession', () => {
    it('cree une session avec TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const token = await createSession(SAFE_USER_FIXTURE);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('tm:session:'),
        expect.any(String),
        { ex: 86400 } // 24 heures
      );
    });

    it('stocke les infos utilisateur dans la session', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await createSession(SAFE_USER_FIXTURE);

      const setCall = mockRedis.set.mock.calls[0]!;
      const sessionData = JSON.parse(setCall[1] as string);

      expect(sessionData.userId).toBe(SAFE_USER_FIXTURE.id);
      expect(sessionData.username).toBe(SAFE_USER_FIXTURE.username);
      expect(sessionData.createdAt).toBeDefined();
      expect(sessionData.expiresAt).toBeDefined();
    });
  });

  describe('getSession', () => {
    it('retourne null si session inexistante', async () => {
      mockRedis.get.mockResolvedValue(null);

      const session = await getSession('invalid-token');

      expect(session).toBeNull();
    });

    it('retourne la session si valide', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 86400000); // +24h

      const sessionData = {
        token: 'valid-token',
        userId: SAFE_USER_FIXTURE.id,
        username: SAFE_USER_FIXTURE.username,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));

      const session = await getSession('valid-token');

      expect(session).not.toBeNull();
      expect(session?.userId).toBe(SAFE_USER_FIXTURE.id);
      expect(session?.username).toBe(SAFE_USER_FIXTURE.username);
    });

    it('retourne null et supprime session expiree', async () => {
      const now = new Date();
      const expiredAt = new Date(now.getTime() - 1000); // -1s (expire)

      const sessionData = {
        token: 'expired-token',
        userId: SAFE_USER_FIXTURE.id,
        username: SAFE_USER_FIXTURE.username,
        createdAt: now.toISOString(),
        expiresAt: expiredAt.toISOString(),
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));
      mockRedis.del.mockResolvedValue(1);

      const session = await getSession('expired-token');

      expect(session).toBeNull();
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('retourne null si JSON invalide', async () => {
      mockRedis.get.mockResolvedValue('invalid{json');

      const session = await getSession('bad-token');

      expect(session).toBeNull();
    });
  });

  describe('deleteSession', () => {
    it('supprime la session de Redis', async () => {
      mockRedis.del.mockResolvedValue(1);

      await deleteSession('token-to-delete');

      expect(mockRedis.del).toHaveBeenCalledWith('tm:session:token-to-delete');
    });
  });

  describe('refreshSession', () => {
    it('retourne false si session inexistante', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await refreshSession('invalid-token');

      expect(result).toBe(false);
    });

    it('prolonge la session de 24h', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 86400000);

      const sessionData = {
        token: 'valid-token',
        userId: SAFE_USER_FIXTURE.id,
        username: SAFE_USER_FIXTURE.username,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));
      mockRedis.set.mockResolvedValue('OK');

      const result = await refreshSession('valid-token');

      expect(result).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'tm:session:valid-token',
        expect.any(String),
        { ex: 86400 }
      );
    });
  });
});
