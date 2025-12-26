/**
 * Tests Unitaires - Badges API Functions
 * ISO/IEC 29119 - TDD: Tests fonctions fetch badges
 */

import { describe, it, expect, afterEach } from 'vitest';
import { server } from '../../../../mocks/server';
import { http, HttpResponse } from 'msw';
import {
  fetchBadges,
  checkPracticeBadges,
  checkChallengeBadgesApi,
} from '@/features/badges/api/badges';
import type { PracticeSessionStats } from '@/types/badge';
import type { ChallengeResult } from '@/types/game';
import { EARNED_BADGES_FIXTURE } from '../../../../fixtures';

// MSW server is started globally in tests/setup.ts
// Reset handlers after each test with custom handlers
afterEach(() => server.resetHandlers());

describe('Badges API Functions', () => {
  describe('fetchBadges', () => {
    it('retourne les badges avec compteurs', async () => {
      const result = await fetchBadges();

      expect(result.badges).toBeDefined();
      expect(Array.isArray(result.badges)).toBe(true);
      expect(result.earnedCount).toBe(EARNED_BADGES_FIXTURE.length);
      expect(result.totalCount).toBe(13);
    });

    it('throw erreur si non authentifie (401)', async () => {
      server.use(
        http.get('/api/badges', () => {
          return HttpResponse.json(
            { error: 'Non authentifie' },
            { status: 401 }
          );
        })
      );

      await expect(fetchBadges()).rejects.toThrow('Non authentifie');
    });

    it('throw erreur serveur (500)', async () => {
      server.use(
        http.get('/api/badges', () => {
          return HttpResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
          );
        })
      );

      await expect(fetchBadges()).rejects.toThrow('Erreur serveur');
    });
  });

  describe('checkPracticeBadges', () => {
    const practiceStats: PracticeSessionStats = {
      correctAnswers: 10,
      totalQuestions: 12,
      currentStreak: 5,
      maxStreak: 8,
    };

    it('retourne nouveaux badges pour practice', async () => {
      const result = await checkPracticeBadges(practiceStats);

      expect(result.newBadges).toBeDefined();
      expect(Array.isArray(result.newBadges)).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('badge contient id, emoji, name, description', async () => {
      const result = await checkPracticeBadges(practiceStats);

      expect(result.newBadges.length).toBeGreaterThan(0);
      const badge = result.newBadges[0]!;
      expect(badge.id).toBeDefined();
      expect(badge.emoji).toBeDefined();
      expect(badge.name).toBeDefined();
      expect(badge.description).toBeDefined();
    });

    it('throw erreur si non authentifie (401)', async () => {
      server.use(
        http.post('/api/badges', () => {
          return HttpResponse.json(
            { error: 'Non authentifie' },
            { status: 401 }
          );
        })
      );

      await expect(checkPracticeBadges(practiceStats)).rejects.toThrow(
        'Non authentifie'
      );
    });
  });

  describe('checkChallengeBadgesApi', () => {
    const challengeResult: ChallengeResult = {
      correctAnswers: 15,
      totalQuestions: 20,
      accuracy: 0.75,
      timeBonus: 50,
      streakBonus: 30,
      totalScore: 200,
    };

    it('retourne nouveaux badges pour challenge', async () => {
      const result = await checkChallengeBadgesApi(challengeResult);

      expect(result.newBadges).toBeDefined();
      expect(Array.isArray(result.newBadges)).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('throw erreur si non authentifie (401)', async () => {
      server.use(
        http.post('/api/badges', () => {
          return HttpResponse.json(
            { error: 'Non authentifie' },
            { status: 401 }
          );
        })
      );

      await expect(checkChallengeBadgesApi(challengeResult)).rejects.toThrow(
        'Non authentifie'
      );
    });
  });
});
