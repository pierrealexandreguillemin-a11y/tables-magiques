/**
 * MSW Handlers - Scores API
 */

import { http, HttpResponse } from 'msw';

export const scoresHandlers = [
  // GET /api/scores
  http.get('/api/scores', ({ request }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'practice';

    return HttpResponse.json({
      scores: [
        {
          userId: 'user-1',
          mode,
          table: mode === 'practice' ? 7 : undefined,
          correct: 9,
          total: 10,
          streak: 5,
          timestamp: '2026-03-19T09:00:00.000Z',
        },
      ],
      stats: {
        totalGames: 42,
        averageAccuracy: 90,
        bestStreak: 12,
      },
    });
  }),

  // POST /api/scores
  http.post('/api/scores', async ({ request }) => {
    const body = (await request.json()) as {
      mode: string;
      correct: number;
      total: number;
    };

    return HttpResponse.json(
      {
        success: true,
        score: {
          userId: 'user-1',
          ...body,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  }),
];
