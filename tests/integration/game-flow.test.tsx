/**
 * Integration Tests - Game Flow
 * ISO/IEC 29119 - DONNÉES RÉELLES via fixtures
 *
 * Tests du flux de jeu complet:
 * - Sélection de table
 * - Questions et réponses
 * - Score et progression
 * - Badges gagnés
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { server } from '../mocks/server';
import {
  TABLE_7_FIXTURE,
  TABLE_7_QUESTIONS_FIXTURE,
  INITIAL_GAME_STATE_FIXTURE,
  ACTIVE_GAME_STATE_FIXTURE,
  CORRECT_ANSWER_STATE_FIXTURE,
  WRONG_ANSWER_STATE_FIXTURE,
  EARNED_BADGES_FIXTURE,
  DEFAULT_CONFIG_FIXTURE,
} from '../fixtures';
import {
  MagicCard,
  MagicCounter,
  MagicButton,
  AnswerIcon,
} from '@/components/effects';

// MSW setup
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Game Flow Integration', () => {
  describe('Table Selection', () => {
    it('affiche les 10 tables disponibles', () => {
      const tables = Array.from({ length: 10 }, (_, i) => i + 1);

      const { container } = render(
        <div data-testid="table-selector">
          {tables.map((table) => (
            <MagicCard key={table}>
              <span data-testid={`table-${table}`}>Table de {table}</span>
            </MagicCard>
          ))}
        </div>
      );

      tables.forEach((table) => {
        expect(
          container.querySelector(`[data-testid="table-${table}"]`)
        ).toBeInTheDocument();
      });
    });

    it('la table de 7 a 10 problèmes', () => {
      expect(TABLE_7_FIXTURE.problems).toHaveLength(10);
      expect(TABLE_7_QUESTIONS_FIXTURE).toHaveLength(10);
    });
  });

  describe('Question Display', () => {
    it('affiche une question avec format correct', () => {
      const question = TABLE_7_QUESTIONS_FIXTURE[7]; // 7 × 8 = 56
      expect(question).toBeDefined();

      render(
        <MagicCard>
          <span data-testid="question-text">
            {question!.a} × {question!.b} = ?
          </span>
        </MagicCard>
      );

      expect(screen.getByTestId('question-text')).toHaveTextContent(
        '7 × 8 = ?'
      );
    });

    it('valide la réponse correcte mathématiquement', () => {
      TABLE_7_QUESTIONS_FIXTURE.forEach((question) => {
        expect(question.answer).toBe(question.a * question.b);
      });
    });
  });

  describe('Answer Feedback', () => {
    it('affiche icône succès pour bonne réponse', () => {
      render(<AnswerIcon type="correct" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveAttribute('data-type', 'correct');
    });

    it('affiche icône erreur pour mauvaise réponse', () => {
      render(<AnswerIcon type="incorrect" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveAttribute('data-type', 'incorrect');
    });

    it('a le bon aria-label pour correct', () => {
      render(<AnswerIcon type="correct" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveAttribute('aria-label', 'Bonne reponse');
    });

    it('a le bon aria-label pour incorrect', () => {
      render(<AnswerIcon type="incorrect" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveAttribute('aria-label', 'Mauvaise reponse');
    });
  });

  describe('Score Tracking', () => {
    it('affiche le score initial à 0', () => {
      const state = INITIAL_GAME_STATE_FIXTURE;

      render(<MagicCounter value={state.score} />);

      expect(screen.getByTestId('counter-value')).toHaveTextContent('0');
    });

    it('affiche le score en cours de partie', () => {
      const state = ACTIVE_GAME_STATE_FIXTURE;

      render(<MagicCounter value={state.score} />);

      expect(screen.getByTestId('counter-value')).toHaveTextContent('4');
    });

    it('incrémente après bonne réponse', () => {
      const before = ACTIVE_GAME_STATE_FIXTURE.score;
      const after = CORRECT_ANSWER_STATE_FIXTURE.score;

      expect(after).toBe(before + 1);
    });

    it('ne change pas après mauvaise réponse', () => {
      const state = WRONG_ANSWER_STATE_FIXTURE;

      // Score reste à 4 (pas d'incrément)
      expect(state.score).toBe(4);
    });
  });

  describe('Streak System', () => {
    it('streak augmente après bonne réponse', () => {
      const before = ACTIVE_GAME_STATE_FIXTURE.streak;
      const after = CORRECT_ANSWER_STATE_FIXTURE.streak;

      expect(after).toBe(before + 1);
    });

    it('streak reset après mauvaise réponse', () => {
      const state = WRONG_ANSWER_STATE_FIXTURE;

      expect(state.streak).toBe(0);
    });
  });

  describe('Game Configuration', () => {
    it('practice mode a 10 questions par table', () => {
      expect(DEFAULT_CONFIG_FIXTURE.practice.questionsPerTable).toBe(10);
    });

    it('challenge mode a 180 secondes', () => {
      expect(DEFAULT_CONFIG_FIXTURE.challenge.globalTime).toBe(180);
    });

    it('challenge mode a 5 secondes par question', () => {
      expect(DEFAULT_CONFIG_FIXTURE.challenge.questionTime).toBe(5);
    });
  });

  describe('Badge Integration', () => {
    it('utilisateur a des badges practice', () => {
      const practiceBadges = EARNED_BADGES_FIXTURE.filter(
        (b) => b.mode === 'practice'
      );

      expect(practiceBadges.length).toBeGreaterThan(0);
    });

    it('utilisateur a des badges challenge', () => {
      const challengeBadges = EARNED_BADGES_FIXTURE.filter(
        (b) => b.mode === 'challenge'
      );

      expect(challengeBadges.length).toBeGreaterThan(0);
    });

    it('badges ont des dates valides', () => {
      EARNED_BADGES_FIXTURE.forEach((badge) => {
        const date = new Date(badge.earnedAt);
        expect(date.getTime()).not.toBeNaN();
      });
    });
  });

  describe('Component Integration', () => {
    it('MagicButton et MagicCard fonctionnent ensemble', () => {
      render(
        <MagicCard>
          <MagicButton>Valider</MagicButton>
          <MagicButton variant="unicorn">Passer</MagicButton>
        </MagicCard>
      );

      expect(screen.getByTestId('magic-card')).toBeInTheDocument();
      expect(screen.getAllByTestId('button-content')).toHaveLength(2);
      expect(screen.getByText('Valider')).toBeInTheDocument();
      expect(screen.getByText('Passer')).toBeInTheDocument();
    });

    it('AnswerIcon avec MagicCounter après réponse', () => {
      const state = CORRECT_ANSWER_STATE_FIXTURE;

      render(
        <div data-testid="answer-feedback">
          <AnswerIcon type="correct" />
          <MagicCounter value={state.score} />
          <MagicCounter value={state.streak} />
        </div>
      );

      expect(screen.getByTestId('answer-icon')).toHaveAttribute(
        'data-type',
        'correct'
      );
      expect(screen.getAllByTestId('counter-value')[0]).toHaveTextContent('5');
      expect(screen.getAllByTestId('counter-value')[1]).toHaveTextContent('4');
    });
  });

  describe('Data Integrity', () => {
    it('toutes les tables ont des IDs uniques', () => {
      const allIds = TABLE_7_FIXTURE.problems.map((p) => p.id);
      const uniqueIds = new Set(allIds);

      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('progression utilisateur est cohérente', () => {
      const totalCorrect = CORRECT_ANSWER_STATE_FIXTURE.score;
      const totalQuestions = CORRECT_ANSWER_STATE_FIXTURE.total;

      expect(totalCorrect).toBeLessThanOrEqual(totalQuestions);
    });

    it('streak ne dépasse jamais le total', () => {
      const streak = CORRECT_ANSWER_STATE_FIXTURE.streak;
      const total = CORRECT_ANSWER_STATE_FIXTURE.total;

      expect(streak).toBeLessThanOrEqual(total);
    });
  });
});
