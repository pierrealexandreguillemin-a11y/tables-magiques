/**
 * Tests Unitaires - Logique Badges
 * ISO/IEC 29119 - TDD: Tests AVANT implementation
 *
 * 8 badges Practice + 5 badges Challenge
 */

import { describe, it, expect } from 'vitest';
import {
  checkPracticeBadges,
  checkChallengeBadges,
  getNewBadges,
} from '@/features/badges/hooks/badges';
import type { PracticeSessionStats } from '@/types/badge';
import type { ChallengeResult } from '@/types/game';

describe('Badges Logic', () => {
  // =========================================================================
  // PRACTICE BADGES
  // =========================================================================

  describe('checkPracticeBadges', () => {
    describe('Badge "first" - Premiere Etoile', () => {
      it('debloque avec 1 bonne reponse', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 1,
          totalQuestions: 1,
          currentStreak: 1,
          maxStreak: 1,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).toContain('first');
      });

      it('ne debloque pas avec 0 bonne reponse', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 0,
          totalQuestions: 1,
          currentStreak: 0,
          maxStreak: 0,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).not.toContain('first');
      });
    });

    describe('Badge "streak5" - Licorne Magique', () => {
      it('debloque avec streak de 5', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 5,
          totalQuestions: 5,
          currentStreak: 5,
          maxStreak: 5,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).toContain('streak5');
      });

      it('ne debloque pas avec streak de 4', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 4,
          totalQuestions: 5,
          currentStreak: 4,
          maxStreak: 4,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).not.toContain('streak5');
      });

      it('debloque avec maxStreak >= 5 meme si current < 5', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 6,
          totalQuestions: 7,
          currentStreak: 1,
          maxStreak: 5,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).toContain('streak5');
      });
    });

    describe('Badge "streak10" - Princesse des Maths', () => {
      it('debloque avec streak de 10', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 10,
          totalQuestions: 10,
          currentStreak: 10,
          maxStreak: 10,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).toContain('streak10');
      });

      it('ne debloque pas avec streak de 9', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 9,
          totalQuestions: 10,
          currentStreak: 9,
          maxStreak: 9,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).not.toContain('streak10');
      });
    });

    describe('Badge "perfect5" - Arc-en-ciel Parfait', () => {
      it('debloque avec 5/5 parfait', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 5,
          totalQuestions: 5,
          currentStreak: 5,
          maxStreak: 5,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).toContain('perfect5');
      });

      it('ne debloque pas avec 4/5', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 4,
          totalQuestions: 5,
          currentStreak: 4,
          maxStreak: 4,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).not.toContain('perfect5');
      });

      it('ne debloque pas avec moins de 5 questions', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 4,
          totalQuestions: 4,
          currentStreak: 4,
          maxStreak: 4,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).not.toContain('perfect5');
      });
    });

    describe('Badge "streak20" - Etoile Brillante', () => {
      it('debloque avec streak de 20', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 20,
          totalQuestions: 20,
          currentStreak: 20,
          maxStreak: 20,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).toContain('streak20');
      });
    });

    describe('Badge "perfect10" - Fee des Calculs', () => {
      it('debloque avec 10/10 parfait', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 10,
          totalQuestions: 10,
          currentStreak: 10,
          maxStreak: 10,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).toContain('perfect10');
      });

      it('ne debloque pas avec 9/10', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 9,
          totalQuestions: 10,
          currentStreak: 9,
          maxStreak: 9,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).not.toContain('perfect10');
      });
    });

    describe('Badge "streak30" - Reine Magique', () => {
      it('debloque avec streak de 30', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 30,
          totalQuestions: 30,
          currentStreak: 30,
          maxStreak: 30,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).toContain('streak30');
      });
    });

    describe('Badge "streak50" - Super Championne', () => {
      it('debloque avec streak de 50', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 50,
          totalQuestions: 50,
          currentStreak: 50,
          maxStreak: 50,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).toContain('streak50');
      });
    });

    describe('Deblocages multiples', () => {
      it('debloque first + streak5 + perfect5 ensemble', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 5,
          totalQuestions: 5,
          currentStreak: 5,
          maxStreak: 5,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).toContain('first');
        expect(badges).toContain('streak5');
        expect(badges).toContain('perfect5');
      });

      it('debloque tous les badges streak avec streak 50', () => {
        const stats: PracticeSessionStats = {
          correctAnswers: 50,
          totalQuestions: 50,
          currentStreak: 50,
          maxStreak: 50,
        };

        const badges = checkPracticeBadges(stats);
        expect(badges).toContain('first');
        expect(badges).toContain('streak5');
        expect(badges).toContain('streak10');
        expect(badges).toContain('streak20');
        expect(badges).toContain('streak30');
        expect(badges).toContain('streak50');
        expect(badges).toContain('perfect5');
        expect(badges).toContain('perfect10');
      });
    });
  });

  // =========================================================================
  // CHALLENGE BADGES
  // =========================================================================

  describe('checkChallengeBadges', () => {
    describe('Badge "speed5" - Eclair Rapide', () => {
      it('debloque avec 5 reponses', () => {
        const result: ChallengeResult = {
          correctAnswers: 3,
          totalQuestions: 5,
          accuracy: 0.6,
          timeBonus: 120,
          streakBonus: 0,
          totalScore: 50,
        };

        const badges = checkChallengeBadges(result);
        expect(badges).toContain('speed5');
      });

      it('ne debloque pas avec 4 reponses', () => {
        const result: ChallengeResult = {
          correctAnswers: 3,
          totalQuestions: 4,
          accuracy: 0.75,
          timeBonus: 120,
          streakBonus: 0,
          totalScore: 50,
        };

        const badges = checkChallengeBadges(result);
        expect(badges).not.toContain('speed5');
      });
    });

    describe('Badge "speed10" - Ninja des Maths', () => {
      it('debloque avec 10 reponses', () => {
        const result: ChallengeResult = {
          correctAnswers: 8,
          totalQuestions: 10,
          accuracy: 0.8,
          timeBonus: 60,
          streakBonus: 0,
          totalScore: 140,
        };

        const badges = checkChallengeBadges(result);
        expect(badges).toContain('speed10');
      });

      it('ne debloque pas avec 9 reponses', () => {
        const result: ChallengeResult = {
          correctAnswers: 8,
          totalQuestions: 9,
          accuracy: 0.89,
          timeBonus: 60,
          streakBonus: 0,
          totalScore: 140,
        };

        const badges = checkChallengeBadges(result);
        expect(badges).not.toContain('speed10');
      });
    });

    describe('Badge "speed15" - Fusee Magique', () => {
      it('debloque avec 15 reponses', () => {
        const result: ChallengeResult = {
          correctAnswers: 12,
          totalQuestions: 15,
          accuracy: 0.8,
          timeBonus: 30,
          streakBonus: 0,
          totalScore: 150,
        };

        const badges = checkChallengeBadges(result);
        expect(badges).toContain('speed15');
      });
    });

    describe('Badge "speed20" - Reine de la Vitesse', () => {
      it('debloque avec 20 reponses', () => {
        const result: ChallengeResult = {
          correctAnswers: 18,
          totalQuestions: 20,
          accuracy: 0.9,
          timeBonus: 0,
          streakBonus: 10,
          totalScore: 190,
        };

        const badges = checkChallengeBadges(result);
        expect(badges).toContain('speed20');
      });
    });

    describe('Badge "perfectChallenge" - Perfection Chrono', () => {
      it('debloque avec 0 erreur', () => {
        const result: ChallengeResult = {
          correctAnswers: 15,
          totalQuestions: 15,
          accuracy: 1.0,
          timeBonus: 30,
          streakBonus: 130,
          totalScore: 310,
        };

        const badges = checkChallengeBadges(result);
        expect(badges).toContain('perfectChallenge');
      });

      it('ne debloque pas avec 1 erreur', () => {
        const result: ChallengeResult = {
          correctAnswers: 14,
          totalQuestions: 15,
          accuracy: 0.93,
          timeBonus: 30,
          streakBonus: 0,
          totalScore: 170,
        };

        const badges = checkChallengeBadges(result);
        expect(badges).not.toContain('perfectChallenge');
      });

      it('ne debloque pas avec 0 questions', () => {
        const result: ChallengeResult = {
          correctAnswers: 0,
          totalQuestions: 0,
          accuracy: 0,
          timeBonus: 180,
          streakBonus: 0,
          totalScore: 180,
        };

        const badges = checkChallengeBadges(result);
        expect(badges).not.toContain('perfectChallenge');
      });
    });

    describe('Deblocages multiples', () => {
      it('debloque speed5 + speed10 + speed15 ensemble', () => {
        const result: ChallengeResult = {
          correctAnswers: 12,
          totalQuestions: 15,
          accuracy: 0.8,
          timeBonus: 30,
          streakBonus: 0,
          totalScore: 150,
        };

        const badges = checkChallengeBadges(result);
        expect(badges).toContain('speed5');
        expect(badges).toContain('speed10');
        expect(badges).toContain('speed15');
      });

      it('debloque tous les speed + perfectChallenge avec 20 parfait', () => {
        const result: ChallengeResult = {
          correctAnswers: 20,
          totalQuestions: 20,
          accuracy: 1.0,
          timeBonus: 0,
          streakBonus: 180,
          totalScore: 380,
        };

        const badges = checkChallengeBadges(result);
        expect(badges).toContain('speed5');
        expect(badges).toContain('speed10');
        expect(badges).toContain('speed15');
        expect(badges).toContain('speed20');
        expect(badges).toContain('perfectChallenge');
      });
    });
  });

  // =========================================================================
  // NOUVEAUX BADGES
  // =========================================================================

  describe('getNewBadges', () => {
    it('retourne uniquement les badges non deja gagnes', () => {
      const unlockedIds = ['first', 'streak5', 'perfect5'];
      const alreadyEarned = ['first'];

      const newBadges = getNewBadges(unlockedIds, alreadyEarned);

      expect(newBadges).toHaveLength(2);
      expect(newBadges.map((b) => b.badgeId)).toContain('streak5');
      expect(newBadges.map((b) => b.badgeId)).toContain('perfect5');
      expect(newBadges.map((b) => b.badgeId)).not.toContain('first');
    });

    it('retourne tous les badges si aucun deja gagne', () => {
      const unlockedIds = ['first', 'streak5'];
      const alreadyEarned: string[] = [];

      const newBadges = getNewBadges(unlockedIds, alreadyEarned);

      expect(newBadges).toHaveLength(2);
    });

    it('retourne tableau vide si tous deja gagnes', () => {
      const unlockedIds = ['first', 'streak5'];
      const alreadyEarned = ['first', 'streak5'];

      const newBadges = getNewBadges(unlockedIds, alreadyEarned);

      expect(newBadges).toHaveLength(0);
    });

    it('inclut les infos badge dans le resultat', () => {
      const unlockedIds = ['first'];
      const alreadyEarned: string[] = [];

      const newBadges = getNewBadges(unlockedIds, alreadyEarned);

      expect(newBadges[0]).toMatchObject({
        badgeId: 'first',
        isNew: true,
        badge: expect.objectContaining({
          id: 'first',
          emoji: '⭐',
          name: 'Premiere Etoile',
        }),
      });
    });

    it('marque isNew true pour nouveaux badges', () => {
      const unlockedIds = ['streak5'];
      const alreadyEarned: string[] = [];

      const newBadges = getNewBadges(unlockedIds, alreadyEarned);

      expect(newBadges).toHaveLength(1);
      expect(newBadges[0]?.isNew).toBe(true);
    });
  });
});
