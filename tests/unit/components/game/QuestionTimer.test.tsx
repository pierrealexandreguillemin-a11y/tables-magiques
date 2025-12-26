/**
 * Tests Unitaires - QuestionTimer
 * ISO/IEC 29119 - TDD: Tests AVANT implementation
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuestionTimer } from '@/features/game/components/QuestionTimer';

describe('QuestionTimer', () => {
  describe('Affichage temps', () => {
    it('affiche 5 pour 5 secondes', () => {
      render(<QuestionTimer timeRemaining={5} maxTime={5} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('affiche 3 pour 3 secondes', () => {
      render(<QuestionTimer timeRemaining={3} maxTime={5} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('affiche 0 pour 0 secondes', () => {
      render(<QuestionTimer timeRemaining={0} maxTime={5} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Barre de progression', () => {
    it('affiche progressbar avec role', () => {
      render(<QuestionTimer timeRemaining={5} maxTime={5} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('progressbar a aria-valuenow correct', () => {
      render(<QuestionTimer timeRemaining={3} maxTime={5} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    });

    it('progressbar a aria-valuemax correct', () => {
      render(<QuestionTimer timeRemaining={3} maxTime={5} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemax', '5');
    });

    it('progressbar a aria-valuemin = 0', () => {
      render(<QuestionTimer timeRemaining={3} maxTime={5} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    });

    it('largeur proportionnelle au temps restant', () => {
      render(<QuestionTimer timeRemaining={2} maxTime={5} />);

      // 2/5 = 40%
      const progressbar = screen.getByRole('progressbar');
      const fill = progressbar.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveStyle({ width: '40%' });
    });

    it('largeur 100% quand temps plein', () => {
      render(<QuestionTimer timeRemaining={5} maxTime={5} />);

      const progressbar = screen.getByRole('progressbar');
      const fill = progressbar.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveStyle({ width: '100%' });
    });

    it('largeur 0% quand temps ecoule', () => {
      render(<QuestionTimer timeRemaining={0} maxTime={5} />);

      const progressbar = screen.getByRole('progressbar');
      const fill = progressbar.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveStyle({ width: '0%' });
    });
  });

  describe('Style urgence', () => {
    it('style normal au-dessus de 2 secondes', () => {
      render(<QuestionTimer timeRemaining={3} maxTime={5} />);

      const progressbar = screen.getByRole('progressbar');
      const fill = progressbar.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveClass('bg-blue-500');
    });

    it('style warning a 2 secondes', () => {
      render(<QuestionTimer timeRemaining={2} maxTime={5} />);

      const progressbar = screen.getByRole('progressbar');
      const fill = progressbar.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveClass('bg-yellow-500');
    });

    it('style danger a 1 seconde', () => {
      render(<QuestionTimer timeRemaining={1} maxTime={5} />);

      const progressbar = screen.getByRole('progressbar');
      const fill = progressbar.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveClass('bg-red-500');
    });

    it('animation pulse sous 2 secondes', () => {
      render(<QuestionTimer timeRemaining={1} maxTime={5} />);

      const progressbar = screen.getByRole('progressbar');
      const fill = progressbar.querySelector('[data-testid="progress-fill"]');
      expect(fill).toHaveClass('animate-pulse');
    });
  });

  describe('Accessibilite', () => {
    it('a aria-label descriptif', () => {
      render(<QuestionTimer timeRemaining={3} maxTime={5} />);

      expect(screen.getByLabelText(/temps.*question/i)).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepte className personnalise', () => {
      render(
        <QuestionTimer timeRemaining={5} maxTime={5} className="custom-class" />
      );

      const container = screen.getByRole('progressbar').parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });
});
