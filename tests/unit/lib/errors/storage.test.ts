/**
 * Tests Unitaires - errors/storage
 * ISO/IEC 29119 - TDD: Upstash Redis error storage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  storeErrors,
  getRecentErrors,
  getErrorStats,
  clearOldErrors,
  getErrorSystemHealth,
} from '@/lib/errors/storage';
import type { ErrorReport } from '@/lib/errorReporter';

// Mock getRedis and isRedisConfigured
vi.mock('@/lib/db/upstash', () => ({
  getRedis: vi.fn(),
  isRedisConfigured: vi.fn(),
}));

import { getRedis, isRedisConfigured } from '@/lib/db/upstash';

describe('errors/storage', () => {
  const mockPipeline = {
    lpush: vi.fn().mockReturnThis(),
    ltrim: vi.fn().mockReturnThis(),
    hincrby: vi.fn().mockReturnThis(),
    hset: vi.fn().mockReturnThis(),
    expire: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue([]),
  };

  const mockRedis = {
    pipeline: vi.fn(() => mockPipeline),
    lrange: vi.fn(),
    hgetall: vi.fn(),
    llen: vi.fn(),
    lindex: vi.fn(),
    del: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRedis).mockReturnValue(mockRedis as never);
  });

  describe('storeErrors', () => {
    it('retourne 0 stored si Redis non configure', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(false);

      const errors: (ErrorReport & { id: string })[] = [
        {
          id: 'err_1',
          message: 'Test',
          type: 'runtime',
          severity: 'high',
          timestamp: '2025-12-27T00:00:00.000Z',
        },
      ];

      const result = await storeErrors(errors);

      expect(result.stored).toBe(0);
      expect(result.failed).toBe(1);
    });

    it('stocke erreurs avec pipeline Redis', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);

      const errors: (ErrorReport & { id: string })[] = [
        {
          id: 'err_1',
          message: 'Error 1',
          type: 'runtime',
          severity: 'high',
          timestamp: '2025-12-27T00:00:00.000Z',
        },
        {
          id: 'err_2',
          message: 'Error 2',
          type: 'network',
          severity: 'medium',
          timestamp: '2025-12-27T00:00:01.000Z',
        },
      ];

      const result = await storeErrors(errors);

      expect(result.stored).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockRedis.pipeline).toHaveBeenCalledTimes(2);
    });

    it('utilise lpush pour ajouter erreurs', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);

      await storeErrors([
        {
          id: 'err_1',
          message: 'Test',
          type: 'runtime',
          severity: 'high',
          timestamp: '2025-12-27T00:00:00.000Z',
        },
      ]);

      expect(mockPipeline.lpush).toHaveBeenCalled();
    });

    it('trim la liste a MAX_STORED_ERRORS', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);

      await storeErrors([
        {
          id: 'err_1',
          message: 'Test',
          type: 'runtime',
          severity: 'high',
          timestamp: '2025-12-27T00:00:00.000Z',
        },
      ]);

      expect(mockPipeline.ltrim).toHaveBeenCalledWith(
        expect.any(String),
        0,
        999 // MAX_STORED_ERRORS - 1
      );
    });

    it('incremente stats par type et severity', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);

      await storeErrors([
        {
          id: 'err_1',
          message: 'Test',
          type: 'network',
          severity: 'critical',
          timestamp: '2025-12-27T00:00:00.000Z',
        },
      ]);

      expect(mockPipeline.hincrby).toHaveBeenCalledWith(
        expect.any(String),
        'total',
        1
      );
      expect(mockPipeline.hincrby).toHaveBeenCalledWith(
        expect.any(String),
        'type:network',
        1
      );
      expect(mockPipeline.hincrby).toHaveBeenCalledWith(
        expect.any(String),
        'severity:critical',
        1
      );
    });

    it('set TTL sur les cles', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);

      await storeErrors([
        {
          id: 'err_1',
          message: 'Test',
          type: 'runtime',
          severity: 'high',
          timestamp: '2025-12-27T00:00:00.000Z',
        },
      ]);

      expect(mockPipeline.expire).toHaveBeenCalledTimes(2); // list + stats
    });

    it('compte erreurs failed si pipeline echoue', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);
      mockPipeline.exec.mockRejectedValueOnce(new Error('Redis error'));

      const result = await storeErrors([
        {
          id: 'err_1',
          message: 'Test',
          type: 'runtime',
          severity: 'high',
          timestamp: '2025-12-27T00:00:00.000Z',
        },
      ]);

      expect(result.failed).toBe(1);
    });
  });

  describe('getRecentErrors', () => {
    it('retourne tableau vide si Redis non configure', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(false);

      const errors = await getRecentErrors();

      expect(errors).toEqual([]);
    });

    it('parse erreurs JSON depuis Redis', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);
      mockRedis.lrange.mockResolvedValue([
        JSON.stringify({
          id: 'err_1',
          message: 'Test',
          type: 'runtime',
          severity: 'high',
          timestamp: '2025-12-27T00:00:00.000Z',
          storedAt: '2025-12-27T00:00:01.000Z',
        }),
      ]);

      const errors = await getRecentErrors();

      expect(errors.length).toBe(1);
      const first = errors[0];
      expect(first).toBeDefined();
      expect(first?.message).toBe('Test');
    });

    it('filtre erreurs invalides', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);
      mockRedis.lrange.mockResolvedValue([
        JSON.stringify({
          id: 'err_1',
          message: 'Valid',
          type: 'runtime',
          severity: 'high',
          timestamp: '2025-12-27T00:00:00.000Z',
          storedAt: '2025-12-27T00:00:01.000Z',
        }),
        'invalid json',
        JSON.stringify({ incomplete: true }),
      ]);

      const errors = await getRecentErrors();

      expect(errors.length).toBe(1);
      const first = errors[0];
      expect(first).toBeDefined();
      expect(first?.message).toBe('Valid');
    });

    it('respecte limit parameter', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);
      mockRedis.lrange.mockResolvedValue([]);

      await getRecentErrors(25);

      expect(mockRedis.lrange).toHaveBeenCalledWith(
        expect.any(String),
        0,
        24 // limit - 1
      );
    });
  });

  describe('getErrorStats', () => {
    it('retourne null si Redis non configure', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(false);

      const stats = await getErrorStats();

      expect(stats).toBeNull();
    });

    it('retourne null si pas de stats', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);
      mockRedis.hgetall.mockResolvedValue({});

      const stats = await getErrorStats();

      expect(stats).toBeNull();
    });

    it('parse stats correctement', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);
      mockRedis.hgetall.mockResolvedValue({
        total: 42,
        lastUpdated: '2025-12-27T00:00:00.000Z',
        'type:network': 10,
        'type:runtime': 32,
        'severity:high': 20,
        'severity:critical': 22,
      });

      const stats = await getErrorStats();

      expect(stats).not.toBeNull();
      expect(stats?.total).toBe(42);
      expect(stats?.byType.network).toBe(10);
      expect(stats?.byType.runtime).toBe(32);
      expect(stats?.bySeverity.high).toBe(20);
      expect(stats?.bySeverity.critical).toBe(22);
    });
  });

  describe('clearOldErrors', () => {
    it('retourne 0 si Redis non configure', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(false);

      const result = await clearOldErrors();

      expect(result.deleted).toBe(0);
    });

    it('supprime list et stats keys', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);
      mockRedis.del.mockResolvedValue(1);

      await clearOldErrors();

      expect(mockRedis.del).toHaveBeenCalledTimes(2);
    });
  });

  describe('getErrorSystemHealth', () => {
    it('retourne non-healthy si Redis non configure', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(false);

      const health = await getErrorSystemHealth();

      expect(health.healthy).toBe(false);
      expect(health.configured).toBe(false);
    });

    it('retourne healthy avec count si configure', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);
      mockRedis.llen.mockResolvedValue(5);
      mockRedis.lindex.mockResolvedValue(null);

      const health = await getErrorSystemHealth();

      expect(health.healthy).toBe(true);
      expect(health.configured).toBe(true);
      expect(health.errorCount).toBe(5);
    });

    it('retourne lastError timestamp', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);
      mockRedis.llen.mockResolvedValue(1);
      mockRedis.lindex.mockResolvedValue(
        JSON.stringify({
          timestamp: '2025-12-27T12:00:00.000Z',
        })
      );

      const health = await getErrorSystemHealth();

      expect(health.lastError).toBe('2025-12-27T12:00:00.000Z');
    });

    it('gere erreur Redis gracefully', async () => {
      vi.mocked(isRedisConfigured).mockReturnValue(true);
      mockRedis.llen.mockRejectedValue(new Error('Redis error'));

      const health = await getErrorSystemHealth();

      expect(health.healthy).toBe(false);
      expect(health.configured).toBe(true);
    });
  });
});
