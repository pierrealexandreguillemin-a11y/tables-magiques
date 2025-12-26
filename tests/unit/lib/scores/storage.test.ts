/**
 * Tests Unitaires - Score Storage
 * ISO/IEC 29119 - TDD: Tests persistence Redis scores
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Score, GameMode } from '@/types/game';

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  lpush: vi.fn(),
  lrange: vi.fn(),
  llen: vi.fn(),
};

vi.mock('@/lib/db/upstash', () => ({
  getRedis: () => mockRedis,
  KEYS: {
    scores: (userId: string, mode: string) => `tm:scores:${userId}:${mode}`,
  },
}));

// Import apres mock
import {
  getUserScores,
  saveScore,
  getScoreStats,
  getRecentScores,
} from '@/lib/scores/storage';

// Fixtures - DONNEES REELLES
const SCORE_PRACTICE_FIXTURE: Score = {
  userId: 'user-456',
  mode: 'practice',
  table: 7,
  correct: 8,
  total: 10,
  timestamp: '2024-12-26T10:00:00.000Z',
};

const SCORE_CHALLENGE_FIXTURE: Score = {
  userId: 'user-456',
  mode: 'challenge',
  correct: 25,
  total: 30,
  timeRemaining: 45,
  timestamp: '2024-12-26T11:00:00.000Z',
};

describe('Score Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.get.mockReset();
    mockRedis.lpush.mockReset();
    mockRedis.lrange.mockReset();
    mockRedis.llen.mockReset();
  });

  describe('getUserScores', () => {
    it('retourne tableau vide si pas de scores', async () => {
      mockRedis.lrange.mockResolvedValue([]);

      const result = await getUserScores('user-123', 'practice');

      expect(result).toEqual([]);
      expect(mockRedis.lrange).toHaveBeenCalledWith(
        'tm:scores:user-123:practice',
        0,
        -1
      );
    });

    it('retourne liste scores practice', async () => {
      const scores = [SCORE_PRACTICE_FIXTURE];
      mockRedis.lrange.mockResolvedValue(scores.map((s) => JSON.stringify(s)));

      const result = await getUserScores('user-456', 'practice');

      expect(result).toHaveLength(1);
      expect(result[0]!.table).toBe(7);
      expect(result[0]!.correct).toBe(8);
    });

    it('retourne liste scores challenge', async () => {
      const scores = [SCORE_CHALLENGE_FIXTURE];
      mockRedis.lrange.mockResolvedValue(scores.map((s) => JSON.stringify(s)));

      const result = await getUserScores('user-456', 'challenge');

      expect(result).toHaveLength(1);
      expect(result[0]!.timeRemaining).toBe(45);
    });

    it('parse JSON string correctement', async () => {
      mockRedis.lrange.mockResolvedValue([
        JSON.stringify(SCORE_PRACTICE_FIXTURE),
      ]);

      const result = await getUserScores('user-456', 'practice');

      expect(result[0]).toEqual(SCORE_PRACTICE_FIXTURE);
    });

    it('filtre scores invalides', async () => {
      mockRedis.lrange.mockResolvedValue([
        JSON.stringify(SCORE_PRACTICE_FIXTURE),
        'invalid{json',
        JSON.stringify(SCORE_CHALLENGE_FIXTURE),
      ]);

      const result = await getUserScores('user-456', 'practice');

      expect(result).toHaveLength(2);
    });
  });

  describe('saveScore', () => {
    it('sauvegarde score practice', async () => {
      mockRedis.lpush.mockResolvedValue(1);

      const input = {
        mode: 'practice' as GameMode,
        table: 7,
        correct: 8,
        total: 10,
      };

      const result = await saveScore('user-456', input);

      expect(result.userId).toBe('user-456');
      expect(result.mode).toBe('practice');
      expect(result.table).toBe(7);
      expect(result.correct).toBe(8);
      expect(result.total).toBe(10);
      expect(result.timestamp).toBeDefined();
      expect(mockRedis.lpush).toHaveBeenCalledWith(
        'tm:scores:user-456:practice',
        expect.any(String)
      );
    });

    it('sauvegarde score challenge avec timeRemaining', async () => {
      mockRedis.lpush.mockResolvedValue(1);

      const input = {
        mode: 'challenge' as GameMode,
        correct: 25,
        total: 30,
        timeRemaining: 45,
      };

      const result = await saveScore('user-456', input);

      expect(result.mode).toBe('challenge');
      expect(result.timeRemaining).toBe(45);
      expect(mockRedis.lpush).toHaveBeenCalledWith(
        'tm:scores:user-456:challenge',
        expect.any(String)
      );
    });

    it('genere timestamp ISO 8601', async () => {
      mockRedis.lpush.mockResolvedValue(1);

      const result = await saveScore('user-456', {
        mode: 'practice',
        correct: 5,
        total: 10,
      });

      // Verifie format ISO 8601
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('getRecentScores', () => {
    it('retourne N derniers scores', async () => {
      const scores = [SCORE_PRACTICE_FIXTURE, SCORE_CHALLENGE_FIXTURE];
      mockRedis.lrange.mockResolvedValue(scores.map((s) => JSON.stringify(s)));

      await getRecentScores('user-456', 'practice', 5);

      expect(mockRedis.lrange).toHaveBeenCalledWith(
        'tm:scores:user-456:practice',
        0,
        4 // limit - 1
      );
    });

    it('limite par defaut a 20', async () => {
      mockRedis.lrange.mockResolvedValue([]);

      await getRecentScores('user-456', 'challenge');

      expect(mockRedis.lrange).toHaveBeenCalledWith(
        'tm:scores:user-456:challenge',
        0,
        19
      );
    });
  });

  describe('getScoreStats', () => {
    it('calcule statistiques correctement', async () => {
      const scores = [
        { ...SCORE_PRACTICE_FIXTURE, correct: 8, total: 10 }, // 80%
        { ...SCORE_PRACTICE_FIXTURE, correct: 10, total: 10 }, // 100%
        { ...SCORE_PRACTICE_FIXTURE, correct: 6, total: 10 }, // 60%
      ];
      mockRedis.lrange.mockResolvedValue(scores.map((s) => JSON.stringify(s)));
      mockRedis.llen.mockResolvedValue(3);

      const result = await getScoreStats('user-456', 'practice');

      expect(result.totalGames).toBe(3);
      expect(result.averageAccuracy).toBe(80); // (80 + 100 + 60) / 3
    });

    it('retourne 0 si pas de scores', async () => {
      mockRedis.lrange.mockResolvedValue([]);
      mockRedis.llen.mockResolvedValue(0);

      const result = await getScoreStats('user-456', 'practice');

      expect(result.totalGames).toBe(0);
      expect(result.averageAccuracy).toBe(0);
    });
  });
});
