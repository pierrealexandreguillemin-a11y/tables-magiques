/**
 * Integration Tests - Badges (useBadges + /api/badges)
 */

import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { waitFor } from '@testing-library/react';
import { useBadges } from '@/features/badges/hooks/useBadges';
import { renderQueryHook } from '../utils/query-test-utils';
import { server } from './setup';

describe('useBadges integration', () => {
  describe('fetchBadges (GET /api/badges)', () => {
    it('returns badge list with earned status', async () => {
      const { result } = renderQueryHook(() => useBadges());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.badges).toHaveLength(2);
      expect(result.current.earnedCount).toBe(1);
      expect(result.current.totalCount).toBe(2);

      const earned = result.current.badges.find((b) => b.id === 'first_game');
      expect(earned?.earned).toBe(true);

      const notEarned = result.current.badges.find((b) => b.id === 'perfect10');
      expect(notEarned?.earned).toBe(false);
    });

    it('handles 401 as error', async () => {
      server.use(
        http.get('/api/badges', () => {
          return HttpResponse.json(
            { error: 'Non authentifie' },
            { status: 401 }
          );
        })
      );

      const { result } = renderQueryHook(() => useBadges());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.badges).toEqual([]);
    });
  });

  describe('checkPracticeBadges (POST /api/badges)', () => {
    it('returns new badges for practice session', async () => {
      const { result } = renderQueryHook(() => useBadges());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newBadges = await result.current.checkPracticeBadges({
        correctAnswers: 10,
        totalQuestions: 10,
        currentStreak: 10,
        maxStreak: 10,
      });

      expect(newBadges).toHaveLength(1);
      expect(newBadges[0]!.id).toBe('streak3');
    });
  });

  describe('checkChallengeBadges (POST /api/badges)', () => {
    it('returns empty array when no new badges earned', async () => {
      const { result } = renderQueryHook(() => useBadges());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newBadges = await result.current.checkChallengeBadges({
        correctAnswers: 5,
        totalQuestions: 10,
        accuracy: 0.5,
        timeBonus: 0,
        streakBonus: 0,
        bestStreak: 0,
        totalScore: 50,
      });

      expect(newBadges).toEqual([]);
    });
  });
});
