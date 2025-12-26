/**
 * Tests Unitaires - Upstash Redis Client
 * ISO/IEC 29119 - TDD: Tests configuration Redis
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Redis - utiliser vi.hoisted pour avoir acces dans le mock
const { MockRedis, mockClear } = vi.hoisted(() => {
  const mockInstance = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  };

  // Creer un constructeur mock
  const MockRedis = vi.fn(function (this: typeof mockInstance) {
    Object.assign(this, mockInstance);
  });

  return {
    MockRedis: MockRedis as unknown as typeof import('@upstash/redis').Redis,
    mockClear: () => MockRedis.mockClear(),
  };
});

vi.mock('@upstash/redis', () => ({
  Redis: MockRedis,
}));

describe('Upstash Redis Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getRedis', () => {
    it('throw si UPSTASH_REDIS_REST_URL manquant', async () => {
      process.env.UPSTASH_REDIS_REST_URL = '';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

      const { getRedis } = await import('@/lib/db/upstash');

      expect(() => getRedis()).toThrow(
        'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set'
      );
    });

    it('throw si UPSTASH_REDIS_REST_TOKEN manquant', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = '';

      const { getRedis } = await import('@/lib/db/upstash');

      expect(() => getRedis()).toThrow(
        'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set'
      );
    });

    it('cree un client Redis avec les bonnes credentials', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'secret-token';

      const { getRedis } = await import('@/lib/db/upstash');
      const redis = getRedis();

      expect(redis).toBeDefined();
      expect(MockRedis).toHaveBeenCalledWith({
        url: 'https://redis.upstash.io',
        token: 'secret-token',
      });
    });

    it('retourne le meme client (singleton)', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'secret-token';

      const { getRedis } = await import('@/lib/db/upstash');
      const redis1 = getRedis();
      const redis2 = getRedis();

      expect(redis1).toBe(redis2);
      expect(MockRedis).toHaveBeenCalledTimes(1);
    });
  });

  describe('KEYS', () => {
    it('genere cle user correcte', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

      const { KEYS } = await import('@/lib/db/upstash');

      expect(KEYS.user('emma')).toBe('tm:user:emma');
    });

    it('genere cle userId correcte', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

      const { KEYS } = await import('@/lib/db/upstash');

      expect(KEYS.userId('user-123')).toBe('tm:user:id:user-123');
    });

    it('genere cle session correcte', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

      const { KEYS } = await import('@/lib/db/upstash');

      expect(KEYS.session('token-abc')).toBe('tm:session:token-abc');
    });

    it('genere cle scores correcte', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

      const { KEYS } = await import('@/lib/db/upstash');

      expect(KEYS.scores('user-456', 'practice')).toBe(
        'tm:scores:user-456:practice'
      );
    });

    it('genere cle userBadges correcte', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

      const { KEYS } = await import('@/lib/db/upstash');

      expect(KEYS.userBadges('user-456')).toBe('tm:badges:user-456');
    });

    it('genere cle leaderboard correcte', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

      const { KEYS } = await import('@/lib/db/upstash');

      expect(KEYS.leaderboard('challenge')).toBe('tm:leaderboard:challenge');
    });
  });

  describe('isRedisConfigured', () => {
    it('retourne true si les deux env vars sont definies', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

      const { isRedisConfigured } = await import('@/lib/db/upstash');

      expect(isRedisConfigured()).toBe(true);
    });

    it('retourne false si URL manquante', async () => {
      process.env.UPSTASH_REDIS_REST_URL = '';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

      const { isRedisConfigured } = await import('@/lib/db/upstash');

      expect(isRedisConfigured()).toBe(false);
    });

    it('retourne false si TOKEN manquant', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = '';

      const { isRedisConfigured } = await import('@/lib/db/upstash');

      expect(isRedisConfigured()).toBe(false);
    });
  });
});
