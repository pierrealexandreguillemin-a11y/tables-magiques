/**
 * Tests MagicCounter - TDD RED PHASE
 * ISO/IEC 29119 - Tests unitaires
 *
 * P0 Component - Compteur anime avec GSAP
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MagicCounter } from '@/components/effects/MagicCounter';

// Mock GSAP
const mockGsapTo = vi.fn();
vi.mock('gsap', () => ({
  gsap: {
    to: (target: unknown, config: unknown) => {
      mockGsapTo(target, config);
      // Simulate immediate completion for tests
      const cfg = config as { onUpdate?: () => void; duration?: number };
      if (cfg.onUpdate) {
        cfg.onUpdate();
      }
      return { kill: vi.fn() };
    },
  },
}));

// Mock useReducedMotion
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => ({
    prefersReducedMotion: false,
    shouldAnimate: true,
  }),
}));

describe('MagicCounter', () => {
  beforeEach(() => {
    mockGsapTo.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendu de base', () => {
    it('rend le conteneur principal', () => {
      render(<MagicCounter value={42} />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toBeInTheDocument();
    });

    it('affiche la valeur', () => {
      render(<MagicCounter value={100} />);

      // La valeur doit etre affichee (meme si animee)
      const counter = screen.getByTestId('magic-counter');
      expect(counter).toBeInTheDocument();
    });

    it('a les classes de base', () => {
      render(<MagicCounter value={0} />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveClass('font-bold');
    });
  });

  describe('animation GSAP', () => {
    it('utilise GSAP pour animer', () => {
      render(<MagicCounter value={50} />);

      // GSAP.to doit etre appele
      expect(mockGsapTo).toHaveBeenCalled();
    });

    it('anime vers la nouvelle valeur', () => {
      const { rerender } = render(<MagicCounter value={0} />);
      mockGsapTo.mockClear();

      rerender(<MagicCounter value={100} />);

      expect(mockGsapTo).toHaveBeenCalled();
    });
  });

  describe('format', () => {
    it('formate sans decimales par defaut', () => {
      render(<MagicCounter value={42} />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveAttribute('data-format', 'integer');
    });

    it('supporte format decimal', () => {
      render(<MagicCounter value={3.14} format="decimal" />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveAttribute('data-format', 'decimal');
    });

    it('supporte format pourcentage', () => {
      render(<MagicCounter value={75} format="percent" />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveAttribute('data-format', 'percent');
    });
  });

  describe('tailles', () => {
    it('a taille md par defaut', () => {
      render(<MagicCounter value={0} />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveClass('text-2xl');
    });

    it('accepte taille sm', () => {
      render(<MagicCounter value={0} size="sm" />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveClass('text-lg');
    });

    it('accepte taille lg', () => {
      render(<MagicCounter value={0} size="lg" />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveClass('text-4xl');
    });

    it('accepte taille xl', () => {
      render(<MagicCounter value={0} size="xl" />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveClass('text-6xl');
    });
  });

  describe('variantes theme', () => {
    it('applique style princess par defaut', () => {
      render(<MagicCounter value={0} />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveClass('text-pink-600');
    });

    it('applique style unicorn', () => {
      render(<MagicCounter value={0} variant="unicorn" />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveClass('text-purple-600');
    });

    it('applique style star', () => {
      render(<MagicCounter value={0} variant="star" />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveClass('text-yellow-600');
    });
  });

  describe('prefixe et suffixe', () => {
    it('affiche prefixe', () => {
      render(<MagicCounter value={100} prefix="+" />);

      expect(screen.getByTestId('counter-prefix')).toHaveTextContent('+');
    });

    it('affiche suffixe', () => {
      render(<MagicCounter value={50} suffix=" pts" />);

      expect(screen.getByTestId('counter-suffix')).toHaveTextContent('pts');
    });

    it('affiche prefixe et suffixe ensemble', () => {
      render(<MagicCounter value={10} prefix="+" suffix=" etoiles" />);

      expect(screen.getByTestId('counter-prefix')).toHaveTextContent('+');
      expect(screen.getByTestId('counter-suffix')).toHaveTextContent('etoiles');
    });
  });

  describe('accessibilite', () => {
    it('a aria-live polite', () => {
      render(<MagicCounter value={0} />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveAttribute('aria-live', 'polite');
    });

    it('a role status', () => {
      render(<MagicCounter value={0} />);

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('respecte prefers-reduced-motion', () => {
      render(<MagicCounter value={100} disableAnimation />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveAttribute('data-animate', 'false');
    });
  });

  describe('customisation', () => {
    it('accepte className additionnel', () => {
      render(<MagicCounter value={0} className="custom-class" />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveClass('custom-class');
    });

    it('accepte duration personnalisee', () => {
      render(<MagicCounter value={100} duration={2} />);

      const counter = screen.getByTestId('magic-counter');
      expect(counter).toHaveAttribute('data-duration', '2');
    });
  });
});
