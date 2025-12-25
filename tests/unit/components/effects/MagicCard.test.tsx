/**
 * Tests MagicCard - TDD RED PHASE
 * ISO/IEC 29119 - Tests unitaires
 *
 * P0 Component - Carte glassmorphism pour exercices
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MagicCard } from '@/components/effects/MagicCard';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      'data-testid': testId,
      onClick,
      ...props
    }: React.ComponentProps<'div'> & { 'data-testid'?: string }) => (
      <div
        className={className}
        data-testid={testId}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    ),
  },
}));

describe('MagicCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendu de base', () => {
    it('rend le conteneur principal', () => {
      render(<MagicCard>Contenu</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).toBeInTheDocument();
    });

    it('affiche le contenu children', () => {
      render(<MagicCard>Mon contenu de test</MagicCard>);

      expect(screen.getByText('Mon contenu de test')).toBeInTheDocument();
    });

    it('a les classes glassmorphism de base', () => {
      render(<MagicCard>Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).toHaveClass('backdrop-blur-md');
      expect(card).toHaveClass('rounded-3xl');
    });
  });

  describe('variantes', () => {
    it('applique le style princess par defaut', () => {
      render(<MagicCard>Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).toHaveClass('bg-pink-50/40');
    });

    it('applique le style unicorn', () => {
      render(<MagicCard variant="unicorn">Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).toHaveClass('bg-purple-50/40');
    });

    it('applique le style star', () => {
      render(<MagicCard variant="star">Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).toHaveClass('bg-yellow-50/40');
    });

    it('applique le style rainbow', () => {
      render(<MagicCard variant="rainbow">Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).toHaveClass('bg-gradient-to-br');
    });
  });

  describe('glow effect', () => {
    it('a un effet glow par defaut', () => {
      render(<MagicCard>Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).toHaveClass('shadow-xl');
    });

    it('peut desactiver le glow', () => {
      render(<MagicCard glow={false}>Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).not.toHaveClass('shadow-pink-300/30');
    });
  });

  describe('interactivite', () => {
    it('gere onClick', () => {
      const handleClick = vi.fn();
      render(<MagicCard onClick={handleClick}>Test</MagicCard>);

      fireEvent.click(screen.getByTestId('magic-card'));

      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('a cursor-pointer quand onClick est fourni', () => {
      render(<MagicCard onClick={() => {}}>Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('n a pas cursor-pointer sans onClick', () => {
      render(<MagicCard>Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('padding', () => {
    it('a un padding par defaut', () => {
      render(<MagicCard>Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).toHaveClass('p-6');
    });

    it('accepte padding personnalise', () => {
      render(<MagicCard padding="p-4">Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).toHaveClass('p-4');
      expect(card).not.toHaveClass('p-6');
    });
  });

  describe('accessibilite', () => {
    it('peut avoir un role article', () => {
      render(<MagicCard as="article">Test</MagicCard>);

      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    it('supporte aria-label', () => {
      render(<MagicCard aria-label="Carte exercice">Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).toHaveAttribute('aria-label', 'Carte exercice');
    });
  });

  describe('customisation', () => {
    it('accepte className additionnel', () => {
      render(<MagicCard className="custom-class">Test</MagicCard>);

      const card = screen.getByTestId('magic-card');
      expect(card).toHaveClass('custom-class');
    });
  });
});
