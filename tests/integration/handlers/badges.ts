/**
 * MSW Handlers - Badges API
 */

import { http, HttpResponse } from 'msw';

export const badgesHandlers = [
  // GET /api/badges
  http.get('/api/badges', () => {
    return HttpResponse.json({
      badges: [
        {
          id: 'first_game',
          name: 'Premiere Partie',
          emoji: '🎮',
          earned: true,
          earnedAt: '2025-12-26T00:00:00.000Z',
        },
        {
          id: 'perfect10',
          name: 'Score Parfait',
          emoji: '💯',
          earned: false,
          earnedAt: null,
        },
      ],
      earnedCount: 1,
      totalCount: 2,
    });
  }),

  // POST /api/badges
  http.post('/api/badges', async ({ request }) => {
    const body = (await request.json()) as { mode: string };

    return HttpResponse.json({
      success: true,
      newBadges:
        body.mode === 'practice'
          ? [{ id: 'streak3', name: 'Serie de 3', emoji: '🔥' }]
          : [],
      message: 'Badges verifies',
    });
  }),
];
