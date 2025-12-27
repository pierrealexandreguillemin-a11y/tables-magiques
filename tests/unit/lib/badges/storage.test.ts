/**
 * Tests Unitaires - Badge Storage
 * ISO/IEC 29119 - TDD: Tests persistence Redis badges
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { EarnedBadge } from '@/types/badge';
import type { GameMode } from '@/types/game';

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock('@/lib/db/upstash', () => ({
  getRedis: () => mockRedis,
  KEYS: {
    userBadges: (userId: string) => `badges:${userId}`,
  },
}));

// Import après mock
import {
  getUserBadges,
  addUserBadge,
  addUserBadges,
  hasBadge,
  getUserBadgeIds,
} from '@/lib/badges/storage';

describe('Badge Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.get.mockReset();
    mockRedis.set.mockReset();
  });

  describe('getUserBadges', () => {
    it('retourne tableau vide si pas de badges', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await getUserBadges('user-123');

      expect(result).toEqual([]);
      expect(mockRedis.get).toHaveBeenCalledWith('badges:user-123');
    });

    it('parse JSON string correctement', async () => {
      const badges: EarnedBadge[] = [
        { id: 'streak5', mode: 'practice', earnedAt: '2024-01-01T00:00:00Z' },
      ];
      mockRedis.get.mockResolvedValue(JSON.stringify(badges));

      const result = await getUserBadges('user-123');

      expect(result).toEqual(badges);
    });

    it('retourne directement si deja parse', async () => {
      const badges: EarnedBadge[] = [
        { id: 'streak5', mode: 'practice', earnedAt: '2024-01-01T00:00:00Z' },
      ];
      mockRedis.get.mockResolvedValue(badges);

      const result = await getUserBadges('user-123');

      expect(result).toEqual(badges);
    });

    it('retourne tableau vide si JSON invalide', async () => {
      mockRedis.get.mockResolvedValue('invalid{json');

      const result = await getUserBadges('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('addUserBadge', () => {
    it('ajoute badge a utilisateur sans badges', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      const result = await addUserBadge('user-123', 'streak5', 'practice');

      expect(result.id).toBe('streak5');
      expect(result.mode).toBe('practice');
      expect(result.earnedAt).toBeDefined();
      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('retourne badge existant sans re-ajouter', async () => {
      const existingBadge: EarnedBadge = {
        id: 'streak5',
        mode: 'practice',
        earnedAt: '2024-01-01T00:00:00Z',
      };
      mockRedis.get.mockResolvedValue(JSON.stringify([existingBadge]));

      const result = await addUserBadge('user-123', 'streak5', 'challenge');

      expect(result).toEqual(existingBadge);
      expect(mockRedis.set).not.toHaveBeenCalled();
    });

    it('ajoute nouveau badge a liste existante', async () => {
      const existingBadges: EarnedBadge[] = [
        { id: 'streak5', mode: 'practice', earnedAt: '2024-01-01T00:00:00Z' },
      ];
      mockRedis.get.mockResolvedValue(JSON.stringify(existingBadges));
      mockRedis.set.mockResolvedValue('OK');

      const result = await addUserBadge('user-123', 'speed5', 'challenge');

      expect(result.id).toBe('speed5');
      expect(result.mode).toBe('challenge');

      const setCall = mockRedis.set.mock.calls[0]!;
      const savedBadges = JSON.parse(setCall[1] as string) as unknown[];
      expect(savedBadges).toHaveLength(2);
    });
  });

  describe('addUserBadges', () => {
    it('ajoute plusieurs badges', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      const badges: Array<{ id: string; mode: GameMode }> = [
        { id: 'streak5', mode: 'practice' },
        { id: 'speed5', mode: 'challenge' },
      ];

      const result = await addUserBadges('user-123', badges);

      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe('streak5');
      expect(result[1]!.id).toBe('speed5');
      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('filtre badges deja possedes', async () => {
      const existingBadges: EarnedBadge[] = [
        { id: 'streak5', mode: 'practice', earnedAt: '2024-01-01T00:00:00Z' },
      ];
      mockRedis.get.mockResolvedValue(JSON.stringify(existingBadges));
      mockRedis.set.mockResolvedValue('OK');

      const badges: Array<{ id: string; mode: GameMode }> = [
        { id: 'streak5', mode: 'practice' }, // Deja possede
        { id: 'speed5', mode: 'challenge' }, // Nouveau
      ];

      const result = await addUserBadges('user-123', badges);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('speed5');
    });

    it('retourne tableau vide si tous badges possedes', async () => {
      const existingBadges: EarnedBadge[] = [
        { id: 'streak5', mode: 'practice', earnedAt: '2024-01-01T00:00:00Z' },
        { id: 'speed5', mode: 'challenge', earnedAt: '2024-01-01T00:00:00Z' },
      ];
      mockRedis.get.mockResolvedValue(JSON.stringify(existingBadges));

      const badges: Array<{ id: string; mode: GameMode }> = [
        { id: 'streak5', mode: 'practice' },
        { id: 'speed5', mode: 'challenge' },
      ];

      const result = await addUserBadges('user-123', badges);

      expect(result).toEqual([]);
      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });

  describe('hasBadge', () => {
    it('retourne true si badge possede', async () => {
      const badges: EarnedBadge[] = [
        { id: 'streak5', mode: 'practice', earnedAt: '2024-01-01T00:00:00Z' },
      ];
      mockRedis.get.mockResolvedValue(JSON.stringify(badges));

      const result = await hasBadge('user-123', 'streak5');

      expect(result).toBe(true);
    });

    it('retourne false si badge non possede', async () => {
      const badges: EarnedBadge[] = [
        { id: 'streak5', mode: 'practice', earnedAt: '2024-01-01T00:00:00Z' },
      ];
      mockRedis.get.mockResolvedValue(JSON.stringify(badges));

      const result = await hasBadge('user-123', 'speed5');

      expect(result).toBe(false);
    });

    it('retourne false si pas de badges', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await hasBadge('user-123', 'streak5');

      expect(result).toBe(false);
    });
  });

  describe('getUserBadgeIds', () => {
    it('retourne liste IDs', async () => {
      const badges: EarnedBadge[] = [
        { id: 'streak5', mode: 'practice', earnedAt: '2024-01-01T00:00:00Z' },
        { id: 'speed5', mode: 'challenge', earnedAt: '2024-01-01T00:00:00Z' },
      ];
      mockRedis.get.mockResolvedValue(JSON.stringify(badges));

      const result = await getUserBadgeIds('user-123');

      expect(result).toEqual(['streak5', 'speed5']);
    });

    it('retourne tableau vide si pas de badges', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await getUserBadgeIds('user-123');

      expect(result).toEqual([]);
    });
  });
});
