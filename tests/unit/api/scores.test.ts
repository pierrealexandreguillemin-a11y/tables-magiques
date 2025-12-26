/**
 * Tests Unitaires - Scores API Route
 * ISO/IEC 29119 - TDD: Tests API scores
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Hoisted mocks pour eviter reference avant initialisation
const {
  mockScores,
  mockStats,
  mockGetSession,
  mockGetRecentScores,
  mockSaveScore,
  mockGetScoreStats,
  mockCookies,
} = vi.hoisted(() => {
  const mockSession = {
    userId: 'user-456',
    username: 'emma',
    token: 'test-token',
  };

  const mockScores = [
    {
      userId: 'user-456',
      mode: 'practice',
      table: 7,
      correct: 8,
      total: 10,
      timestamp: '2024-12-26T10:00:00.000Z',
    },
  ];

  const mockStats = {
    totalGames: 5,
    averageAccuracy: 75,
    bestStreak: 3,
  };

  return {
    mockSession,
    mockScores,
    mockStats,
    mockGetSession: vi.fn().mockResolvedValue(mockSession),
    mockGetRecentScores: vi.fn().mockResolvedValue(mockScores),
    mockSaveScore: vi
      .fn()
      .mockImplementation((userId: string, input: Record<string, unknown>) => ({
        userId,
        ...input,
        timestamp: new Date().toISOString(),
      })),
    mockGetScoreStats: vi.fn().mockResolvedValue(mockStats),
    mockCookies: vi.fn().mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'test-session-token' }),
    }),
  };
});

vi.mock('@/lib/auth/session', () => ({
  getSession: mockGetSession,
}));

vi.mock('@/lib/scores/storage', () => ({
  getRecentScores: mockGetRecentScores,
  saveScore: mockSaveScore,
  getScoreStats: mockGetScoreStats,
}));

vi.mock('next/headers', () => ({
  cookies: mockCookies,
}));

// Import apres mocks
import { GET, POST } from '@/app/api/scores/route';

describe('Scores API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/scores', () => {
    it('retourne 401 si pas de session', async () => {
      mockCookies.mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as never);

      const request = new NextRequest('http://localhost/api/scores');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('retourne scores et stats', async () => {
      const request = new NextRequest('http://localhost/api/scores');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.scores).toEqual(mockScores);
      expect(data.stats).toEqual(mockStats);
    });

    it('filtre par mode si specifie', async () => {
      const request = new NextRequest(
        'http://localhost/api/scores?mode=challenge'
      );
      await GET(request);

      expect(mockGetRecentScores).toHaveBeenCalledWith(
        'user-456',
        'challenge',
        20
      );
    });

    it('respecte limit si specifie', async () => {
      const request = new NextRequest('http://localhost/api/scores?limit=5');
      await GET(request);

      expect(mockGetRecentScores).toHaveBeenCalledWith(
        'user-456',
        'practice',
        5
      );
    });
  });

  describe('POST /api/scores', () => {
    it('retourne 401 si pas de session', async () => {
      mockCookies.mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as never);

      const request = new NextRequest('http://localhost/api/scores', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'practice',
          table: 7,
          correct: 8,
          total: 10,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('retourne 400 si donnees invalides', async () => {
      const request = new NextRequest('http://localhost/api/scores', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'invalid_mode',
          correct: 8,
          total: 10,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('sauvegarde score practice', async () => {
      const request = new NextRequest('http://localhost/api/scores', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'practice',
          table: 7,
          correct: 8,
          total: 10,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.score.mode).toBe('practice');
      expect(data.score.table).toBe(7);
      expect(mockSaveScore).toHaveBeenCalledWith('user-456', {
        mode: 'practice',
        table: 7,
        correct: 8,
        total: 10,
      });
    });

    it('sauvegarde score challenge avec timeRemaining', async () => {
      const request = new NextRequest('http://localhost/api/scores', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'challenge',
          correct: 25,
          total: 30,
          timeRemaining: 45,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.score.mode).toBe('challenge');
      expect(data.score.timeRemaining).toBe(45);
      expect(mockSaveScore).toHaveBeenCalledWith('user-456', {
        mode: 'challenge',
        correct: 25,
        total: 30,
        timeRemaining: 45,
      });
    });
  });
});
