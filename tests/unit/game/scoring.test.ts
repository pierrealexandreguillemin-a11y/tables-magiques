/**
 * Tests Unitaires - Scoring Logic
 * ISO/IEC 29119 - TDD: Tests AVANT implementation
 *
 * Fonctions testees:
 * - calculateScore(correct, total)
 * - calculateAccuracy(correct, total)
 * - updateStreak(currentStreak, isCorrect)
 * - checkPerfect(correct, total)
 * - calculateBonus(streak, isPerfect)
 * - checkAnswer(userAnswer, correctAnswer)
 */

import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  calculateAccuracy,
  updateStreak,
  checkPerfect,
  calculateBonus,
  checkAnswer,
} from '@/features/game/hooks/scoring';
import {
  CORRECT_ANSWER_STATE_FIXTURE,
  WRONG_ANSWER_STATE_FIXTURE,
  COMPLETED_GAME_STATE_FIXTURE,
} from '@/tests/fixtures';

describe('Scoring Logic', () => {
  describe('checkAnswer', () => {
    it('retourne true pour reponse correcte', () => {
      expect(checkAnswer(56, 56)).toBe(true);
    });

    it('retourne false pour reponse incorrecte', () => {
      expect(checkAnswer(48, 56)).toBe(false);
    });

    it('gere les zeros', () => {
      expect(checkAnswer(0, 0)).toBe(true);
      expect(checkAnswer(0, 1)).toBe(false);
    });

    it('est strict sur les types', () => {
      expect(checkAnswer(7, 7)).toBe(true);
      expect(checkAnswer(10, 10)).toBe(true);
    });

    it('gere les grands nombres', () => {
      expect(checkAnswer(100, 100)).toBe(true);
      expect(checkAnswer(99, 100)).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('retourne le nombre de bonnes reponses', () => {
      expect(calculateScore(5, 10)).toBe(5);
    });

    it('retourne 0 si aucune bonne reponse', () => {
      expect(calculateScore(0, 10)).toBe(0);
    });

    it('gere le cas parfait', () => {
      expect(calculateScore(10, 10)).toBe(10);
    });

    it('gere total = 0 (debut de partie)', () => {
      expect(calculateScore(0, 0)).toBe(0);
    });

    it('correspond a la fixture COMPLETED_GAME_STATE', () => {
      const { score, total } = COMPLETED_GAME_STATE_FIXTURE;
      expect(calculateScore(score, total)).toBe(8);
    });

    it('ne peut pas avoir plus de correct que total', () => {
      // Le score correct ne devrait jamais depasser le total
      // La fonction devrait clamper ou rejeter
      expect(() => calculateScore(11, 10)).toThrow();
    });

    it('rejette les valeurs negatives', () => {
      expect(() => calculateScore(-1, 10)).toThrow();
      expect(() => calculateScore(5, -1)).toThrow();
    });
  });

  describe('calculateAccuracy', () => {
    it('retourne 0.8 pour 8/10', () => {
      expect(calculateAccuracy(8, 10)).toBe(0.8);
    });

    it('retourne 1.0 pour score parfait', () => {
      expect(calculateAccuracy(10, 10)).toBe(1.0);
    });

    it('retourne 0 pour aucune bonne reponse', () => {
      expect(calculateAccuracy(0, 10)).toBe(0);
    });

    it('gere total = 0 (retourne 0)', () => {
      expect(calculateAccuracy(0, 0)).toBe(0);
    });

    it('retourne valeur entre 0 et 1', () => {
      const accuracy = calculateAccuracy(7, 10);
      expect(accuracy).toBeGreaterThanOrEqual(0);
      expect(accuracy).toBeLessThanOrEqual(1);
    });

    it('correspond a la fixture (8/10 = 0.8)', () => {
      const { score, total } = COMPLETED_GAME_STATE_FIXTURE;
      expect(calculateAccuracy(score, total)).toBe(0.8);
    });

    it('arrondit a 2 decimales', () => {
      // 7/9 = 0.7777... -> 0.78
      expect(calculateAccuracy(7, 9)).toBe(0.78);
    });
  });

  describe('updateStreak', () => {
    it('incremente streak si correct', () => {
      expect(updateStreak(3, true)).toBe(4);
    });

    it('reset streak a 0 si incorrect', () => {
      expect(updateStreak(5, false)).toBe(0);
    });

    it('gere streak initial (0)', () => {
      expect(updateStreak(0, true)).toBe(1);
      expect(updateStreak(0, false)).toBe(0);
    });

    it('correspond a CORRECT_ANSWER_STATE (streak 3 -> 4)', () => {
      // La fixture montre streak passant de 3 a 4 apres bonne reponse
      const prevStreak = CORRECT_ANSWER_STATE_FIXTURE.streak - 1;
      expect(updateStreak(prevStreak, true)).toBe(
        CORRECT_ANSWER_STATE_FIXTURE.streak
      );
    });

    it('correspond a WRONG_ANSWER_STATE (reset a 0)', () => {
      // Apres mauvaise reponse, streak = 0
      expect(updateStreak(5, false)).toBe(WRONG_ANSWER_STATE_FIXTURE.streak);
    });

    it('gere grandes series', () => {
      expect(updateStreak(99, true)).toBe(100);
    });

    it('rejette streak negatif', () => {
      expect(() => updateStreak(-1, true)).toThrow();
    });
  });

  describe('checkPerfect', () => {
    it('retourne true pour 10/10', () => {
      expect(checkPerfect(10, 10)).toBe(true);
    });

    it('retourne false pour 9/10', () => {
      expect(checkPerfect(9, 10)).toBe(false);
    });

    it('retourne false pour 0/10', () => {
      expect(checkPerfect(0, 10)).toBe(false);
    });

    it('gere petits totaux (5/5 = parfait)', () => {
      expect(checkPerfect(5, 5)).toBe(true);
    });

    it('gere total = 0 (pas parfait car pas de questions)', () => {
      expect(checkPerfect(0, 0)).toBe(false);
    });

    it('la fixture COMPLETED n est pas parfaite (8/10)', () => {
      const { score, total } = COMPLETED_GAME_STATE_FIXTURE;
      expect(checkPerfect(score, total)).toBe(false);
    });
  });

  describe('calculateBonus', () => {
    it('retourne 0 sans streak ni perfect', () => {
      expect(calculateBonus(0, false)).toBe(0);
    });

    it('donne bonus pour streak >= 3', () => {
      expect(calculateBonus(3, false)).toBeGreaterThan(0);
    });

    it('donne bonus croissant avec streak', () => {
      const bonus3 = calculateBonus(3, false);
      const bonus5 = calculateBonus(5, false);
      const bonus10 = calculateBonus(10, false);

      expect(bonus5).toBeGreaterThan(bonus3);
      expect(bonus10).toBeGreaterThan(bonus5);
    });

    it('donne bonus pour perfect', () => {
      expect(calculateBonus(0, true)).toBeGreaterThan(0);
    });

    it('cumule streak + perfect', () => {
      const streakOnly = calculateBonus(5, false);
      const perfectOnly = calculateBonus(0, true);
      const both = calculateBonus(5, true);

      expect(both).toBe(streakOnly + perfectOnly);
    });

    it('streak < 3 ne donne pas de bonus streak', () => {
      expect(calculateBonus(1, false)).toBe(0);
      expect(calculateBonus(2, false)).toBe(0);
    });

    it('formule: streak bonus = (streak - 2) * 10', () => {
      // Streak 3 = (3-2) * 10 = 10
      // Streak 5 = (5-2) * 10 = 30
      expect(calculateBonus(3, false)).toBe(10);
      expect(calculateBonus(5, false)).toBe(30);
    });

    it('perfect bonus = 50 points', () => {
      expect(calculateBonus(0, true)).toBe(50);
    });
  });

  describe('Integration scenarios', () => {
    it('scenario: premiere question correcte', () => {
      const userAnswer = 56;
      const correctAnswer = 56;

      const isCorrect = checkAnswer(userAnswer, correctAnswer);
      const newStreak = updateStreak(0, isCorrect);
      const newScore = calculateScore(1, 1);

      expect(isCorrect).toBe(true);
      expect(newStreak).toBe(1);
      expect(newScore).toBe(1);
    });

    it('scenario: serie de 5 puis erreur', () => {
      let streak = 0;

      // 5 bonnes reponses
      for (let i = 0; i < 5; i++) {
        streak = updateStreak(streak, true);
      }
      expect(streak).toBe(5);
      expect(calculateBonus(streak, false)).toBe(30);

      // Puis erreur
      streak = updateStreak(streak, false);
      expect(streak).toBe(0);
    });

    it('scenario: partie parfaite de 10 questions', () => {
      let streak = 0;
      let correct = 0;
      const total = 10;

      for (let i = 0; i < total; i++) {
        streak = updateStreak(streak, true);
        correct++;
      }

      expect(checkPerfect(correct, total)).toBe(true);
      expect(calculateAccuracy(correct, total)).toBe(1.0);
      expect(calculateBonus(streak, true)).toBe(80 + 50); // (10-2)*10 + 50
    });

    it('scenario: fixture COMPLETED_GAME_STATE', () => {
      const { score, total, streak } = COMPLETED_GAME_STATE_FIXTURE;

      expect(calculateScore(score, total)).toBe(8);
      expect(calculateAccuracy(score, total)).toBe(0.8);
      expect(checkPerfect(score, total)).toBe(false);
      expect(calculateBonus(streak, false)).toBe(10); // streak 3 = (3-2)*10
    });
  });

  describe('Edge cases', () => {
    it('gere score tres eleve', () => {
      expect(calculateScore(1000, 1000)).toBe(1000);
      expect(calculateAccuracy(1000, 1000)).toBe(1.0);
    });

    it('precision decimale pour accuracy', () => {
      // 1/3 = 0.333... -> 0.33
      expect(calculateAccuracy(1, 3)).toBe(0.33);
      // 2/3 = 0.666... -> 0.67
      expect(calculateAccuracy(2, 3)).toBe(0.67);
    });

    it('streak tres long', () => {
      expect(updateStreak(999, true)).toBe(1000);
      expect(calculateBonus(100, false)).toBe(980); // (100-2)*10
    });
  });
});
