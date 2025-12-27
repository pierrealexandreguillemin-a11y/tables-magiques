/**
 * Tests AnswerIcon - TDD RED PHASE
 * ISO/IEC 29119 - Tests unitaires
 *
 * P0 Component - Icone feedback reponse (correct/incorrect)
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnswerIcon } from '@/components/effects/AnswerIcon';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      'data-testid': testId,
      ...props
    }: React.ComponentProps<'div'> & { 'data-testid'?: string }) => (
      <div className={className} data-testid={testId} {...props}>
        {children}
      </div>
    ),
    svg: ({
      children,
      className,
      'data-testid': testId,
      ...props
    }: React.ComponentProps<'svg'> & { 'data-testid'?: string }) => (
      <svg className={className} data-testid={testId} {...props}>
        {children}
      </svg>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe('AnswerIcon', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendu de base', () => {
    it('rend le conteneur principal', () => {
      render(<AnswerIcon type="correct" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toBeInTheDocument();
    });

    it('rend le SVG interne', () => {
      render(<AnswerIcon type="correct" />);

      const svg = screen.getByTestId('answer-icon-svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('type correct', () => {
    it('affiche checkmark pour correct', () => {
      render(<AnswerIcon type="correct" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveAttribute('data-type', 'correct');
    });

    it('a couleur verte pour correct', () => {
      render(<AnswerIcon type="correct" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveClass('text-emerald-500');
    });

    it('a un aria-label correct', () => {
      render(<AnswerIcon type="correct" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveAttribute('aria-label', 'Bonne reponse');
    });
  });

  describe('type incorrect', () => {
    it('affiche X pour incorrect', () => {
      render(<AnswerIcon type="incorrect" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveAttribute('data-type', 'incorrect');
    });

    it('a couleur rose pour incorrect', () => {
      render(<AnswerIcon type="incorrect" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveClass('text-rose-500');
    });

    it('a un aria-label incorrect', () => {
      render(<AnswerIcon type="incorrect" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveAttribute('aria-label', 'Mauvaise reponse');
    });
  });

  describe('tailles', () => {
    it('a taille md par defaut', () => {
      render(<AnswerIcon type="correct" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveClass('w-12', 'h-12');
    });

    it('accepte taille sm', () => {
      render(<AnswerIcon type="correct" size="sm" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveClass('w-8', 'h-8');
    });

    it('accepte taille lg', () => {
      render(<AnswerIcon type="correct" size="lg" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveClass('w-16', 'h-16');
    });
  });

  describe('variantes theme', () => {
    it('applique style princess par defaut', () => {
      render(<AnswerIcon type="correct" variant="princess" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveClass('drop-shadow-pink');
    });

    it('applique style unicorn', () => {
      render(<AnswerIcon type="correct" variant="unicorn" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveClass('drop-shadow-purple');
    });
  });

  describe('animation', () => {
    it('a attribut animate pour entree', () => {
      render(<AnswerIcon type="correct" />);

      const icon = screen.getByTestId('answer-icon');
      // Le composant doit avoir des props d'animation
      expect(icon).toBeInTheDocument();
    });
  });

  describe('accessibilite', () => {
    it('a role img', () => {
      render(<AnswerIcon type="correct" />);

      const icon = screen.getByRole('img');
      expect(icon).toBeInTheDocument();
    });

    it('respecte prefers-reduced-motion', () => {
      render(<AnswerIcon type="correct" disableAnimation />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveAttribute('data-animate', 'false');
    });
  });

  describe('customisation', () => {
    it('accepte className additionnel', () => {
      render(<AnswerIcon type="correct" className="custom-class" />);

      const icon = screen.getByTestId('answer-icon');
      expect(icon).toHaveClass('custom-class');
    });
  });
});
