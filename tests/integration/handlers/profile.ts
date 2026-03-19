/**
 * MSW Handlers - Profile API
 */

import { http, HttpResponse } from 'msw';

export const profileHandlers = [
  // GET /api/profile
  http.get('/api/profile', () => {
    return HttpResponse.json({
      success: true,
      profile: {
        user: {
          id: 'user-1',
          username: 'testuser',
          createdAt: '2025-12-26T00:00:00.000Z',
          lastLoginAt: '2026-03-19T10:00:00.000Z',
        },
        stats: {
          totalGames: 42,
          totalQuestions: 420,
          totalCorrect: 378,
          averageAccuracy: 90,
          bestStreak: 12,
          practiceGames: 30,
          challengeGames: 12,
          lastPlayedAt: '2026-03-19T09:00:00.000Z',
          memberSince: '2025-12-26T00:00:00.000Z',
        },
        modeStats: {
          practice: { totalGames: 30, averageAccuracy: 92, bestScore: 10 },
          challenge: { totalGames: 12, averageAccuracy: 85, bestScore: 280 },
        },
        recentSessions: [
          {
            id: 'session-1',
            mode: 'practice',
            table: 7,
            score: 9,
            total: 10,
            accuracy: 90,
            timestamp: '2026-03-19T09:00:00.000Z',
          },
        ],
        progress: {
          tables: Array.from({ length: 10 }, (_, i) => ({
            table: i + 1,
            gamesPlayed: i + 1,
            accuracy: Math.min((i + 1) * 10, 100),
            mastered: i >= 7,
          })),
        },
        badgeCount: 5,
      },
    });
  }),

  // GET /api/profile/history
  http.get('/api/profile/history', ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || '20');

    return HttpResponse.json({
      success: true,
      history: {
        sessions: Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
          id: `session-${i}`,
          mode: i % 2 === 0 ? 'practice' : 'challenge',
          table: i % 2 === 0 ? 7 : undefined,
          score: 8 + i,
          total: 10,
          accuracy: 80 + i * 5,
          timestamp: new Date(Date.now() - i * 86400000).toISOString(),
        })),
        total: 42,
        hasMore: true,
      },
    });
  }),
];
