/**
 * Integration Tests - Scores (useSaveScore + /api/scores)
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSaveScore } from '@/features/game/hooks/useSaveScore';
import { server } from './setup';

describe('scores integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useSaveScore + POST /api/scores', () => {
    it('saves practice score to API', async () => {
      let savedBody: unknown = null;

      server.use(
        http.post('/api/scores', async ({ request }) => {
          savedBody = await request.json();
          return HttpResponse.json(
            { success: true, score: { userId: 'user-1' } },
            { status: 201 }
          );
        })
      );

      const { result } = renderHook(() => useSaveScore());

      act(() => {
        result.current.saveScore({
          mode: 'practice',
          table: 7,
          correct: 9,
          total: 10,
          streak: 5,
        });
      });

      await waitFor(() => {
        expect(savedBody).not.toBeNull();
      });

      expect(savedBody).toEqual({
        mode: 'practice',
        table: 7,
        correct: 9,
        total: 10,
        streak: 5,
      });
    });

    it('saves challenge score to API', async () => {
      let savedBody: unknown = null;

      server.use(
        http.post('/api/scores', async ({ request }) => {
          savedBody = await request.json();
          return HttpResponse.json(
            { success: true, score: { userId: 'user-1' } },
            { status: 201 }
          );
        })
      );

      const { result } = renderHook(() => useSaveScore());

      act(() => {
        result.current.saveScore({
          mode: 'challenge',
          correct: 15,
          total: 20,
          streak: 8,
        });
      });

      await waitFor(() => {
        expect(savedBody).not.toBeNull();
      });

      expect(savedBody).toEqual({
        mode: 'challenge',
        correct: 15,
        total: 20,
        streak: 8,
      });
    });

    it('silently handles 401 for guest users', async () => {
      server.use(
        http.post('/api/scores', () => {
          return HttpResponse.json(
            { error: 'Non authentifie' },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useSaveScore());

      // Should not throw
      expect(() => {
        act(() => {
          result.current.saveScore({
            mode: 'practice',
            correct: 8,
            total: 10,
          });
        });
      }).not.toThrow();
    });

    it('fetches scores via GET /api/scores', async () => {
      const response = await fetch('/api/scores?mode=practice&limit=10');
      const data = await response.json();

      expect(data.scores).toBeDefined();
      expect(data.scores).toHaveLength(1);
      expect(data.stats.totalGames).toBe(42);
      expect(data.stats.bestStreak).toBe(12);
    });
  });
});
