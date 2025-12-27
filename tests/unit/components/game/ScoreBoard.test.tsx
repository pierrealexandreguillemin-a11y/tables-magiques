/**
 * Tests Unitaires - ScoreBoard
 * ISO/IEC 29119 - TDD: Tests AVANT implementation
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBoard } from '@/features/game/components/ScoreBoard';

describe('ScoreBoard', () => {
  describe('Affichage score', () => {
    it('affiche le score courant', () => {
      render(<ScoreBoard score={5} total={10} />);

      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('affiche le total de questions', () => {
      render(<ScoreBoard score={5} total={10} />);

      expect(screen.getByText(/10/)).toBeInTheDocument();
    });

    it('affiche format "score / total"', () => {
      render(<ScoreBoard score={7} total={10} />);

      expect(screen.getByText(/7.*\/.*10/)).toBeInTheDocument();
    });

    it('gere score = 0', () => {
      render(<ScoreBoard score={0} total={5} />);

      expect(screen.getByText(/0.*\/.*5/)).toBeInTheDocument();
    });

    it('gere score parfait', () => {
      render(<ScoreBoard score={10} total={10} />);

      expect(screen.getByText(/10.*\/.*10/)).toBeInTheDocument();
    });
  });

  describe('Affichage progression', () => {
    it('affiche barre de progression', () => {
      render(
        <ScoreBoard
          score={5}
          total={10}
          currentQuestion={3}
          totalQuestions={10}
        />
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('progression a valeur correcte', () => {
      render(
        <ScoreBoard
          score={5}
          total={10}
          currentQuestion={5}
          totalQuestions={10}
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    });

    it('progression 100% en fin de partie', () => {
      render(
        <ScoreBoard
          score={8}
          total={10}
          currentQuestion={10}
          totalQuestions={10}
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    });

    it('affiche question courante', () => {
      render(
        <ScoreBoard
          score={5}
          total={10}
          currentQuestion={6}
          totalQuestions={10}
        />
      );

      expect(screen.getByText(/question.*6/i)).toBeInTheDocument();
    });
  });

  describe('Affichage streak', () => {
    it('affiche streak si >= 3', () => {
      render(<ScoreBoard score={5} total={10} streak={3} />);

      expect(screen.getByText(/série.*3/i)).toBeInTheDocument();
    });

    it('affiche streak avec emoji feu', () => {
      render(<ScoreBoard score={5} total={10} streak={5} />);

      expect(screen.getByText(/🔥/)).toBeInTheDocument();
    });

    it('masque streak si < 3', () => {
      render(<ScoreBoard score={5} total={10} streak={2} />);

      expect(screen.queryByText(/série/i)).not.toBeInTheDocument();
    });

    it('masque streak si = 0', () => {
      render(<ScoreBoard score={5} total={10} streak={0} />);

      expect(screen.queryByText(/série/i)).not.toBeInTheDocument();
    });

    it('streak defaut = 0', () => {
      render(<ScoreBoard score={5} total={10} />);

      expect(screen.queryByText(/série/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibilite', () => {
    it('a role region', () => {
      render(<ScoreBoard score={5} total={10} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('a aria-label descriptif', () => {
      render(<ScoreBoard score={5} total={10} />);

      expect(screen.getByLabelText(/score/i)).toBeInTheDocument();
    });

    it('score a aria-live pour annonces', () => {
      render(<ScoreBoard score={5} total={10} />);

      expect(screen.getByRole('region')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Styles conditionnels', () => {
    it('style normal sans streak', () => {
      render(<ScoreBoard score={5} total={10} />);

      const container = screen.getByRole('region');
      expect(container).not.toHaveClass('animate-pulse');
    });

    it('gere className personnalise', () => {
      render(<ScoreBoard score={5} total={10} className="custom-class" />);

      const container = screen.getByRole('region');
      expect(container).toHaveClass('custom-class');
    });
  });
});
