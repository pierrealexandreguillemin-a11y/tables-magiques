/**
 * Tests Unitaires - Challenge Mode Logic
 * ISO/IEC 29119 - TDD: Tests AVANT implementation
 *
 * Mode Challenge: 3 minutes total, 5 secondes par question
 */

import { describe, it, expect } from 'vitest';
import {
  createChallengeState,
  startChallenge,
  tickGlobalTimer,
  tickQuestionTimer,
  answerQuestion,
  skipQuestion,
  endChallenge,
  calculateChallengeScore,
  isGameOver,
  isQuestionTimeout,
  formatTime,
} from '@/features/game/hooks/challenge';
import type { ChallengeState } from '@/features/game/hooks/challenge';

describe('Challenge Mode Logic', () => {
  describe('createChallengeState', () => {
    it('cree un etat initial correct', () => {
      const state = createChallengeState();

      expect(state.phase).toBe('ready');
      expect(state.globalTimeRemaining).toBe(180); // 3 minutes
      expect(state.questionTimeRemaining).toBe(5);
      expect(state.score).toBe(0);
      expect(state.questionsAnswered).toBe(0);
      expect(state.streak).toBe(0);
    });

    it('accepte config personnalisee', () => {
      const state = createChallengeState({
        globalTime: 120,
        questionTime: 3,
      });

      expect(state.globalTimeRemaining).toBe(120);
      expect(state.questionTimeRemaining).toBe(3);
    });
  });

  describe('startChallenge', () => {
    it('passe en phase playing', () => {
      const state = createChallengeState();
      const started = startChallenge(state);

      expect(started.phase).toBe('playing');
    });

    it('genere une premiere question', () => {
      const state = createChallengeState();
      const started = startChallenge(state);

      expect(started.currentQuestion).not.toBeNull();
      expect(started.currentQuestion?.a).toBeGreaterThanOrEqual(1);
      expect(started.currentQuestion?.a).toBeLessThanOrEqual(10);
    });

    it('reset le timer question', () => {
      const state = createChallengeState({ questionTime: 5 });
      const started = startChallenge(state);

      expect(started.questionTimeRemaining).toBe(5);
    });

    it('ne modifie pas si deja en cours', () => {
      const state = createChallengeState();
      const started = startChallenge(state);
      const startedAgain = startChallenge(started);

      expect(startedAgain).toBe(started);
    });
  });

  describe('tickGlobalTimer', () => {
    it('decremente le temps global', () => {
      const state = startChallenge(createChallengeState());
      const ticked = tickGlobalTimer(state);

      expect(ticked.globalTimeRemaining).toBe(179);
    });

    it('ne descend pas sous 0', () => {
      const state = {
        ...startChallenge(createChallengeState()),
        globalTimeRemaining: 0,
      };
      const ticked = tickGlobalTimer(state);

      expect(ticked.globalTimeRemaining).toBe(0);
    });

    it('passe en game_over quand temps ecoule', () => {
      const state = {
        ...startChallenge(createChallengeState()),
        globalTimeRemaining: 1,
      };
      const ticked = tickGlobalTimer(state);

      expect(ticked.globalTimeRemaining).toBe(0);
      expect(ticked.phase).toBe('game_over');
    });

    it('ne fait rien si pas en playing', () => {
      const state = createChallengeState();
      const ticked = tickGlobalTimer(state);

      expect(ticked.globalTimeRemaining).toBe(180);
    });
  });

  describe('tickQuestionTimer', () => {
    it('decremente le timer question', () => {
      const state = startChallenge(createChallengeState());
      const ticked = tickQuestionTimer(state);

      expect(ticked.questionTimeRemaining).toBe(4);
    });

    it('skip automatique quand temps ecoule', () => {
      const state = {
        ...startChallenge(createChallengeState()),
        questionTimeRemaining: 1,
      };
      const ticked = tickQuestionTimer(state);

      expect(ticked.questionTimeRemaining).toBe(5); // Reset
      expect(ticked.questionsAnswered).toBe(1);
      expect(ticked.streak).toBe(0); // Reset streak sur timeout
    });

    it('genere nouvelle question apres skip', () => {
      const state = {
        ...startChallenge(createChallengeState()),
        questionTimeRemaining: 1,
      };
      const ticked = tickQuestionTimer(state);

      // Nouvelle question generee
      expect(ticked.currentQuestion).toBeDefined();
    });
  });

  describe('answerQuestion', () => {
    it('incremente score sur bonne reponse', () => {
      const state = startChallenge(createChallengeState());
      const answer = state.currentQuestion?.answer ?? 0;
      const answered = answerQuestion(state, answer);

      expect(answered.score).toBe(1);
      expect(answered.questionsAnswered).toBe(1);
    });

    it('incremente streak sur bonne reponse', () => {
      const state = startChallenge(createChallengeState());
      const answer = state.currentQuestion?.answer ?? 0;
      const answered = answerQuestion(state, answer);

      expect(answered.streak).toBe(1);
    });

    it('reset streak sur mauvaise reponse', () => {
      let state = startChallenge(createChallengeState());
      // Bonnes reponses pour avoir un streak
      for (let i = 0; i < 3; i++) {
        const answer = state.currentQuestion?.answer ?? 0;
        state = answerQuestion(state, answer);
      }
      expect(state.streak).toBe(3);

      // Mauvaise reponse
      const wrong = answerQuestion(state, -1);
      expect(wrong.streak).toBe(0);
    });

    it('genere nouvelle question apres reponse', () => {
      const state = startChallenge(createChallengeState());
      const answer = state.currentQuestion?.answer ?? 0;
      const answered = answerQuestion(state, answer);

      expect(answered.currentQuestion).toBeDefined();
      expect(answered.questionTimeRemaining).toBe(5); // Reset
    });

    it('ne compte pas les points sur mauvaise reponse', () => {
      const state = startChallenge(createChallengeState());
      const answered = answerQuestion(state, -999);

      expect(answered.score).toBe(0);
      expect(answered.questionsAnswered).toBe(1);
    });
  });

  describe('skipQuestion', () => {
    it('passe a la question suivante', () => {
      const state = startChallenge(createChallengeState());
      const skipped = skipQuestion(state);

      expect(skipped.questionsAnswered).toBe(1);
      expect(skipped.questionTimeRemaining).toBe(5);
    });

    it('reset streak', () => {
      let state = startChallenge(createChallengeState());
      // Build streak
      for (let i = 0; i < 3; i++) {
        const answer = state.currentQuestion?.answer ?? 0;
        state = answerQuestion(state, answer);
      }

      const skipped = skipQuestion(state);
      expect(skipped.streak).toBe(0);
    });

    it('ne change pas le score', () => {
      const state = startChallenge(createChallengeState());
      const skipped = skipQuestion(state);

      expect(skipped.score).toBe(0);
    });
  });

  describe('endChallenge', () => {
    it('passe en phase game_over', () => {
      const state = startChallenge(createChallengeState());
      const ended = endChallenge(state);

      expect(ended.phase).toBe('game_over');
    });

    it('conserve le temps restant', () => {
      const state = {
        ...startChallenge(createChallengeState()),
        globalTimeRemaining: 45,
      };
      const ended = endChallenge(state);

      expect(ended.globalTimeRemaining).toBe(45);
    });
  });

  describe('calculateChallengeScore', () => {
    it('calcule score de base', () => {
      const state: ChallengeState = {
        phase: 'game_over',
        globalTimeRemaining: 60,
        questionTimeRemaining: 5,
        score: 10,
        questionsAnswered: 15,
        streak: 0,
        currentQuestion: null,
        config: { globalTime: 180, questionTime: 5 },
      };

      const result = calculateChallengeScore(state);

      expect(result.correctAnswers).toBe(10);
      expect(result.totalQuestions).toBe(15);
      expect(result.accuracy).toBeCloseTo(0.67, 1);
    });

    it('calcule bonus temps', () => {
      const state: ChallengeState = {
        phase: 'game_over',
        globalTimeRemaining: 60,
        questionTimeRemaining: 5,
        score: 10,
        questionsAnswered: 15,
        streak: 5,
        currentQuestion: null,
        config: { globalTime: 180, questionTime: 5 },
      };

      const result = calculateChallengeScore(state);

      expect(result.timeBonus).toBeGreaterThan(0);
    });

    it('calcule bonus streak max', () => {
      const state: ChallengeState = {
        phase: 'game_over',
        globalTimeRemaining: 0,
        questionTimeRemaining: 0,
        score: 20,
        questionsAnswered: 20,
        streak: 10,
        currentQuestion: null,
        config: { globalTime: 180, questionTime: 5 },
      };

      const result = calculateChallengeScore(state);

      expect(result.streakBonus).toBeGreaterThan(0);
    });

    it('score total = base + bonus', () => {
      const state: ChallengeState = {
        phase: 'game_over',
        globalTimeRemaining: 30,
        questionTimeRemaining: 0,
        score: 15,
        questionsAnswered: 20,
        streak: 5,
        currentQuestion: null,
        config: { globalTime: 180, questionTime: 5 },
      };

      const result = calculateChallengeScore(state);

      expect(result.totalScore).toBe(
        result.correctAnswers * 10 + result.timeBonus + result.streakBonus
      );
    });
  });

  describe('isGameOver', () => {
    it('true si temps global = 0', () => {
      const state = {
        ...startChallenge(createChallengeState()),
        globalTimeRemaining: 0,
      };

      expect(isGameOver(state)).toBe(true);
    });

    it('true si phase = game_over', () => {
      const state = {
        ...createChallengeState(),
        phase: 'game_over' as const,
      };

      expect(isGameOver(state)).toBe(true);
    });

    it('false si en cours', () => {
      const state = startChallenge(createChallengeState());

      expect(isGameOver(state)).toBe(false);
    });
  });

  describe('isQuestionTimeout', () => {
    it('true si temps question = 0', () => {
      const state = {
        ...startChallenge(createChallengeState()),
        questionTimeRemaining: 0,
      };

      expect(isQuestionTimeout(state)).toBe(true);
    });

    it('false si temps restant', () => {
      const state = startChallenge(createChallengeState());

      expect(isQuestionTimeout(state)).toBe(false);
    });
  });

  describe('formatTime', () => {
    it('formate 180 secondes en "3:00"', () => {
      expect(formatTime(180)).toBe('3:00');
    });

    it('formate 65 secondes en "1:05"', () => {
      expect(formatTime(65)).toBe('1:05');
    });

    it('formate 5 secondes en "0:05"', () => {
      expect(formatTime(5)).toBe('0:05');
    });

    it('formate 0 secondes en "0:00"', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    it('formate 59 secondes en "0:59"', () => {
      expect(formatTime(59)).toBe('0:59');
    });
  });

  describe('Integration scenarios', () => {
    it('partie complete avec temps ecoule', () => {
      let state = startChallenge(createChallengeState());

      // Repondre a 5 questions
      for (let i = 0; i < 5; i++) {
        const answer = state.currentQuestion?.answer ?? 0;
        state = answerQuestion(state, answer);
      }

      expect(state.score).toBe(5);
      expect(state.streak).toBe(5);

      // Temps ecoule
      state = { ...state, globalTimeRemaining: 0 };
      state = endChallenge(state);

      expect(state.phase).toBe('game_over');

      const result = calculateChallengeScore(state);
      expect(result.correctAnswers).toBe(5);
    });

    it('partie avec mix bonnes/mauvaises reponses', () => {
      let state = startChallenge(createChallengeState());

      // 3 bonnes reponses
      for (let i = 0; i < 3; i++) {
        const answer = state.currentQuestion?.answer ?? 0;
        state = answerQuestion(state, answer);
      }

      // 1 mauvaise reponse (reset streak)
      state = answerQuestion(state, -1);

      // 2 bonnes reponses
      for (let i = 0; i < 2; i++) {
        const answer = state.currentQuestion?.answer ?? 0;
        state = answerQuestion(state, answer);
      }

      expect(state.score).toBe(5);
      expect(state.questionsAnswered).toBe(6);
      expect(state.streak).toBe(2);
    });
  });
});
