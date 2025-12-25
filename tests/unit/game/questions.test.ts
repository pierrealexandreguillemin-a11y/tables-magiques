/**
 * Tests Unitaires - Questions Generator
 * ISO/IEC 29119 - TDD: Tests AVANT implementation
 *
 * Fonctions testees:
 * - generateQuestion(table)
 * - generateRandomQuestion()
 * - generateAllQuestionsForTable(table)
 * - shuffleArray()
 * - validateTable()
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateQuestion,
  generateRandomQuestion,
  generateAllQuestionsForTable,
  shuffleArray,
  validateTable,
} from '@/lib/game/questions';
import type { Question } from '@/types/game';
import { TABLE_7_QUESTIONS_FIXTURE } from '@/tests/fixtures';

describe('Questions Generator', () => {
  describe('validateTable', () => {
    it('accepte les tables de 1 a 10', () => {
      for (let i = 1; i <= 10; i++) {
        expect(validateTable(i)).toBe(true);
      }
    });

    it('rejette table 0', () => {
      expect(validateTable(0)).toBe(false);
    });

    it('rejette table 11', () => {
      expect(validateTable(11)).toBe(false);
    });

    it('rejette nombres negatifs', () => {
      expect(validateTable(-1)).toBe(false);
      expect(validateTable(-5)).toBe(false);
    });

    it('rejette nombres decimaux', () => {
      expect(validateTable(3.5)).toBe(false);
      expect(validateTable(7.9)).toBe(false);
    });

    it('rejette NaN', () => {
      expect(validateTable(NaN)).toBe(false);
    });

    it('rejette Infinity', () => {
      expect(validateTable(Infinity)).toBe(false);
      expect(validateTable(-Infinity)).toBe(false);
    });
  });

  describe('generateQuestion', () => {
    it('genere une question pour la table de 7', () => {
      const question = generateQuestion(7);

      expect(question).toHaveProperty('a');
      expect(question).toHaveProperty('b');
      expect(question).toHaveProperty('answer');
      expect(question.a).toBe(7);
      expect(question.b).toBeGreaterThanOrEqual(1);
      expect(question.b).toBeLessThanOrEqual(10);
      expect(question.answer).toBe(question.a * question.b);
    });

    it('genere une question pour chaque table (1-10)', () => {
      for (let table = 1; table <= 10; table++) {
        const question = generateQuestion(table);

        expect(question.a).toBe(table);
        expect(question.answer).toBe(table * question.b);
      }
    });

    it('le multiplicateur b est entre 1 et 10', () => {
      // Generer plusieurs questions pour verifier la distribution
      const bValues = new Set<number>();

      for (let i = 0; i < 100; i++) {
        const question = generateQuestion(5);
        bValues.add(question.b);
        expect(question.b).toBeGreaterThanOrEqual(1);
        expect(question.b).toBeLessThanOrEqual(10);
      }

      // Verifier qu'on a une bonne distribution
      expect(bValues.size).toBeGreaterThan(5);
    });

    it('la reponse est correcte mathematiquement', () => {
      for (let i = 0; i < 50; i++) {
        const table = Math.floor(Math.random() * 10) + 1;
        const question = generateQuestion(table);

        expect(question.answer).toBe(question.a * question.b);
      }
    });

    it('retourne Question type correct', () => {
      const question = generateQuestion(3);

      expect(typeof question.a).toBe('number');
      expect(typeof question.b).toBe('number');
      expect(typeof question.answer).toBe('number');
    });

    it('lance erreur pour table invalide (0)', () => {
      expect(() => generateQuestion(0)).toThrow('Table invalide');
    });

    it('lance erreur pour table invalide (11)', () => {
      expect(() => generateQuestion(11)).toThrow('Table invalide');
    });

    it('lance erreur pour table invalide (negatif)', () => {
      expect(() => generateQuestion(-3)).toThrow('Table invalide');
    });
  });

  describe('generateRandomQuestion', () => {
    it('genere une question avec table aleatoire', () => {
      const question = generateRandomQuestion();

      expect(question.a).toBeGreaterThanOrEqual(1);
      expect(question.a).toBeLessThanOrEqual(10);
      expect(question.b).toBeGreaterThanOrEqual(1);
      expect(question.b).toBeLessThanOrEqual(10);
      expect(question.answer).toBe(question.a * question.b);
    });

    it('genere des tables variees', () => {
      const tables = new Set<number>();

      for (let i = 0; i < 100; i++) {
        const question = generateRandomQuestion();
        tables.add(question.a);
      }

      // On doit avoir au moins 5 tables differentes sur 100 questions
      expect(tables.size).toBeGreaterThanOrEqual(5);
    });

    it('toutes les reponses sont correctes', () => {
      for (let i = 0; i < 50; i++) {
        const question = generateRandomQuestion();
        expect(question.answer).toBe(question.a * question.b);
      }
    });
  });

  describe('generateAllQuestionsForTable', () => {
    it('genere 10 questions pour la table de 7', () => {
      const questions = generateAllQuestionsForTable(7);

      expect(questions).toHaveLength(10);
    });

    it('toutes les questions sont pour la bonne table', () => {
      const questions = generateAllQuestionsForTable(5);

      questions.forEach((q) => {
        expect(q.a).toBe(5);
      });
    });

    it('contient tous les multiplicateurs de 1 a 10', () => {
      const questions = generateAllQuestionsForTable(3);
      const bValues = questions.map((q) => q.b).sort((a, b) => a - b);

      expect(bValues).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('toutes les reponses sont correctes', () => {
      const questions = generateAllQuestionsForTable(9);

      questions.forEach((q) => {
        expect(q.answer).toBe(q.a * q.b);
      });
    });

    it('correspond a la fixture TABLE_7_QUESTIONS_FIXTURE', () => {
      const questions = generateAllQuestionsForTable(7);
      const sortedQuestions = [...questions].sort((a, b) => a.b - b.b);

      expect(sortedQuestions).toEqual(TABLE_7_QUESTIONS_FIXTURE);
    });

    it('lance erreur pour table invalide', () => {
      expect(() => generateAllQuestionsForTable(0)).toThrow('Table invalide');
      expect(() => generateAllQuestionsForTable(11)).toThrow('Table invalide');
    });
  });

  describe('shuffleArray', () => {
    it('retourne un tableau de meme longueur', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);

      expect(shuffled).toHaveLength(original.length);
    });

    it('contient les memes elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);

      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('ne modifie pas le tableau original', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];

      shuffleArray(original);

      expect(original).toEqual(originalCopy);
    });

    it('melange effectivement les elements', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      let differentOrder = false;

      // Essayer plusieurs fois pour verifier le shuffle
      for (let i = 0; i < 10; i++) {
        const shuffled = shuffleArray(original);
        if (JSON.stringify(shuffled) !== JSON.stringify(original)) {
          differentOrder = true;
          break;
        }
      }

      expect(differentOrder).toBe(true);
    });

    it('fonctionne avec tableau vide', () => {
      const empty: number[] = [];
      const shuffled = shuffleArray(empty);

      expect(shuffled).toEqual([]);
    });

    it('fonctionne avec un seul element', () => {
      const single = [42];
      const shuffled = shuffleArray(single);

      expect(shuffled).toEqual([42]);
    });

    it('fonctionne avec objets Question', () => {
      const questions: Question[] = [
        { a: 7, b: 1, answer: 7 },
        { a: 7, b: 2, answer: 14 },
        { a: 7, b: 3, answer: 21 },
      ];

      const shuffled = shuffleArray(questions);

      expect(shuffled).toHaveLength(3);
      expect(shuffled).toContainEqual({ a: 7, b: 1, answer: 7 });
      expect(shuffled).toContainEqual({ a: 7, b: 2, answer: 14 });
      expect(shuffled).toContainEqual({ a: 7, b: 3, answer: 21 });
    });
  });

  describe('Randomness seeding (deterministic tests)', () => {
    beforeEach(() => {
      // Mock Math.random pour tests deterministes
      vi.spyOn(Math, 'random');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('generateQuestion utilise Math.random', () => {
      vi.mocked(Math.random).mockReturnValue(0.5);

      const question = generateQuestion(4);

      expect(Math.random).toHaveBeenCalled();
      expect(question.a).toBe(4);
    });

    it('generateRandomQuestion utilise Math.random pour table et b', () => {
      vi.mocked(Math.random)
        .mockReturnValueOnce(0.3) // Pour la table
        .mockReturnValueOnce(0.7); // Pour le multiplicateur

      generateRandomQuestion();

      expect(Math.random).toHaveBeenCalledTimes(2);
    });

    it('shuffleArray utilise Math.random', () => {
      vi.mocked(Math.random).mockReturnValue(0.5);

      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);

      // Le shuffle doit avoir appele random au moins une fois
      expect(Math.random).toHaveBeenCalled();
      expect(shuffled).toHaveLength(original.length);
    });
  });

  describe('Edge cases', () => {
    it('generateQuestion avec table 1 (identite)', () => {
      const question = generateQuestion(1);

      expect(question.a).toBe(1);
      expect(question.answer).toBe(question.b); // 1 * b = b
    });

    it('generateQuestion avec table 10', () => {
      const question = generateQuestion(10);

      expect(question.a).toBe(10);
      expect(question.answer).toBe(10 * question.b);
    });

    it('la valeur max possible est 100', () => {
      // Table 10 x 10 = 100
      const questions = generateAllQuestionsForTable(10);
      const maxAnswer = Math.max(...questions.map((q) => q.answer));

      expect(maxAnswer).toBe(100);
    });

    it('la valeur min possible est 1', () => {
      // Table 1 x 1 = 1
      const questions = generateAllQuestionsForTable(1);
      const minAnswer = Math.min(...questions.map((q) => q.answer));

      expect(minAnswer).toBe(1);
    });
  });
});
