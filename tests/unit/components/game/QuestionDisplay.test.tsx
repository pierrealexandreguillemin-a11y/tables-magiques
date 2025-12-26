/**
 * Tests Unitaires - QuestionDisplay
 * ISO/IEC 29119 - TDD: Tests AVANT implementation
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuestionDisplay } from '@/features/game/components/QuestionDisplay';
import type { Question } from '@/types/game';

const QUESTION_7x8: Question = { a: 7, b: 8, answer: 56 };
const QUESTION_3x4: Question = { a: 3, b: 4, answer: 12 };

describe('QuestionDisplay', () => {
  describe('Rendu de base', () => {
    it('affiche la question au format "a × b = ?"', () => {
      render(<QuestionDisplay question={QUESTION_7x8} />);

      expect(screen.getByText(/7/)).toBeInTheDocument();
      expect(screen.getByText(/×/)).toBeInTheDocument();
      expect(screen.getByText(/8/)).toBeInTheDocument();
      expect(screen.getByText(/\?/)).toBeInTheDocument();
    });

    it('affiche differentes questions', () => {
      const { rerender } = render(<QuestionDisplay question={QUESTION_7x8} />);
      expect(screen.getByText(/7/)).toBeInTheDocument();

      rerender(<QuestionDisplay question={QUESTION_3x4} />);
      expect(screen.getByText(/3/)).toBeInTheDocument();
      expect(screen.getByText(/4/)).toBeInTheDocument();
    });

    it('a le role region pour accessibilite', () => {
      render(<QuestionDisplay question={QUESTION_7x8} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('a un aria-label descriptif', () => {
      render(<QuestionDisplay question={QUESTION_7x8} />);

      expect(
        screen.getByLabelText(/question.*multiplication/i)
      ).toBeInTheDocument();
    });
  });

  describe('Affichage reponse utilisateur', () => {
    it('affiche "..." si pas de reponse', () => {
      render(<QuestionDisplay question={QUESTION_7x8} userAnswer="" />);

      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('affiche la reponse saisie', () => {
      render(<QuestionDisplay question={QUESTION_7x8} userAnswer="56" />);

      expect(screen.getByText('56')).toBeInTheDocument();
    });

    it('affiche reponse partielle', () => {
      render(<QuestionDisplay question={QUESTION_7x8} userAnswer="5" />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Feedback correct/incorrect', () => {
    it('affiche feedback positif si isCorrect=true', () => {
      render(
        <QuestionDisplay
          question={QUESTION_7x8}
          userAnswer="56"
          isCorrect={true}
          showFeedback={true}
        />
      );

      expect(screen.getByTestId('feedback-correct')).toBeInTheDocument();
      expect(screen.getByText(/bravo/i)).toBeInTheDocument();
    });

    it('affiche feedback negatif si isCorrect=false', () => {
      render(
        <QuestionDisplay
          question={QUESTION_7x8}
          userAnswer="48"
          isCorrect={false}
          showFeedback={true}
        />
      );

      expect(screen.getByTestId('feedback-incorrect')).toBeInTheDocument();
      expect(screen.getByText(/56/)).toBeInTheDocument(); // Affiche bonne reponse
    });

    it('masque feedback si showFeedback=false', () => {
      render(
        <QuestionDisplay
          question={QUESTION_7x8}
          userAnswer="56"
          isCorrect={true}
          showFeedback={false}
        />
      );

      expect(screen.queryByTestId('feedback-correct')).not.toBeInTheDocument();
    });

    it('pas de feedback si isCorrect=null', () => {
      render(
        <QuestionDisplay
          question={QUESTION_7x8}
          userAnswer="5"
          isCorrect={null}
          showFeedback={false}
        />
      );

      expect(screen.queryByTestId('feedback-correct')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('feedback-incorrect')
      ).not.toBeInTheDocument();
    });
  });

  describe('Styles visuels', () => {
    it('applique style success sur bonne reponse', () => {
      render(
        <QuestionDisplay
          question={QUESTION_7x8}
          userAnswer="56"
          isCorrect={true}
          showFeedback={true}
        />
      );

      const container = screen.getByRole('region');
      expect(container).toHaveClass('bg-green-500/30');
    });

    it('applique style error sur mauvaise reponse', () => {
      render(
        <QuestionDisplay
          question={QUESTION_7x8}
          userAnswer="48"
          isCorrect={false}
          showFeedback={true}
        />
      );

      const container = screen.getByRole('region');
      expect(container).toHaveClass('bg-red-500/30');
    });

    it('style neutre sans feedback', () => {
      render(<QuestionDisplay question={QUESTION_7x8} userAnswer="" />);

      const container = screen.getByRole('region');
      expect(container).not.toHaveClass('bg-green-500/30');
      expect(container).not.toHaveClass('bg-red-500/30');
    });
  });

  describe('Props par defaut', () => {
    it('userAnswer defaut = ""', () => {
      render(<QuestionDisplay question={QUESTION_7x8} />);

      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('isCorrect defaut = null', () => {
      render(<QuestionDisplay question={QUESTION_7x8} />);

      expect(screen.queryByTestId('feedback-correct')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('feedback-incorrect')
      ).not.toBeInTheDocument();
    });

    it('showFeedback defaut = false', () => {
      render(<QuestionDisplay question={QUESTION_7x8} isCorrect={true} />);

      expect(screen.queryByTestId('feedback-correct')).not.toBeInTheDocument();
    });
  });
});
