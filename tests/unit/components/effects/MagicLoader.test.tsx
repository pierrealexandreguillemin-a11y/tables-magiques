/**
 * Tests MagicLoader - TDD RED PHASE
 * ISO/IEC 29119 - Tests unitaires
 *
 * P0 Component - Loader anime avec Lottie
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MagicLoader } from '@/components/effects/MagicLoader';

// Mock lottie-react - filtre animationData pour éviter warning React
vi.mock('lottie-react', () => ({
  default: ({
    'data-testid': testId,
    className,
    loop,
    autoplay,
  }: {
    'data-testid'?: string;
    className?: string;
    loop?: boolean;
    autoplay?: boolean;
    animationData?: unknown;
  }) => (
    <div
      data-testid={testId ?? 'lottie-animation'}
      className={className}
      data-loop={loop?.toString()}
      data-autoplay={autoplay?.toString()}
    />
  ),
}));

// Mock useReducedMotion
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => ({
    prefersReducedMotion: false,
    shouldAnimate: true,
  }),
}));

describe('MagicLoader', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendu de base', () => {
    it('rend le conteneur principal', () => {
      render(<MagicLoader />);

      const loader = screen.getByTestId('magic-loader');
      expect(loader).toBeInTheDocument();
    });

    it('rend l animation Lottie', () => {
      render(<MagicLoader />);

      const lottie = screen.getByTestId('lottie-animation');
      expect(lottie).toBeInTheDocument();
    });
  });

  describe('types de loader', () => {
    it('affiche type wand par defaut', () => {
      render(<MagicLoader />);

      const loader = screen.getByTestId('magic-loader');
      expect(loader).toHaveAttribute('data-type', 'wand');
    });

    it('supporte type sparkle', () => {
      render(<MagicLoader type="sparkle" />);

      const loader = screen.getByTestId('magic-loader');
      expect(loader).toHaveAttribute('data-type', 'sparkle');
    });

    it('supporte type unicorn', () => {
      render(<MagicLoader type="unicorn" />);

      const loader = screen.getByTestId('magic-loader');
      expect(loader).toHaveAttribute('data-type', 'unicorn');
    });

    it('supporte type star', () => {
      render(<MagicLoader type="star" />);

      const loader = screen.getByTestId('magic-loader');
      expect(loader).toHaveAttribute('data-type', 'star');
    });
  });

  describe('tailles', () => {
    it('a taille md par defaut', () => {
      render(<MagicLoader />);

      // La taille est sur le div enfant qui contient l'animation
      const loader = screen.getByTestId('magic-loader');
      const sizeContainer = loader.querySelector('div');
      expect(sizeContainer).toHaveClass('w-16', 'h-16');
    });

    it('accepte taille sm', () => {
      render(<MagicLoader size="sm" />);

      const loader = screen.getByTestId('magic-loader');
      const sizeContainer = loader.querySelector('div');
      expect(sizeContainer).toHaveClass('w-12', 'h-12');
    });

    it('accepte taille lg', () => {
      render(<MagicLoader size="lg" />);

      const loader = screen.getByTestId('magic-loader');
      const sizeContainer = loader.querySelector('div');
      expect(sizeContainer).toHaveClass('w-24', 'h-24');
    });

    it('accepte taille xl', () => {
      render(<MagicLoader size="xl" />);

      const loader = screen.getByTestId('magic-loader');
      const sizeContainer = loader.querySelector('div');
      expect(sizeContainer).toHaveClass('w-32', 'h-32');
    });
  });

  describe('texte de chargement', () => {
    it('n affiche pas de texte par defaut', () => {
      render(<MagicLoader />);

      expect(screen.queryByTestId('loader-text')).not.toBeInTheDocument();
    });

    it('affiche le texte personnalise', () => {
      render(<MagicLoader text="Chargement magique..." />);

      const text = screen.getByTestId('loader-text');
      expect(text).toHaveTextContent('Chargement magique...');
    });
  });

  describe('animation Lottie', () => {
    it('a loop active par defaut', () => {
      render(<MagicLoader />);

      const lottie = screen.getByTestId('lottie-animation');
      expect(lottie).toHaveAttribute('data-loop', 'true');
    });

    it('a autoplay active par defaut', () => {
      render(<MagicLoader />);

      const lottie = screen.getByTestId('lottie-animation');
      expect(lottie).toHaveAttribute('data-autoplay', 'true');
    });
  });

  describe('accessibilite', () => {
    it('a role status', () => {
      render(<MagicLoader />);

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
    });

    it('a aria-busy true', () => {
      render(<MagicLoader />);

      const loader = screen.getByTestId('magic-loader');
      expect(loader).toHaveAttribute('aria-busy', 'true');
    });

    it('a aria-label par defaut', () => {
      render(<MagicLoader />);

      const loader = screen.getByTestId('magic-loader');
      expect(loader).toHaveAttribute('aria-label', 'Chargement en cours');
    });

    it('utilise text comme aria-label si fourni', () => {
      render(<MagicLoader text="Preparation de la magie" />);

      const loader = screen.getByTestId('magic-loader');
      expect(loader).toHaveAttribute('aria-label', 'Preparation de la magie');
    });
  });

  describe('reduced motion', () => {
    it('a data-animate true par defaut', () => {
      render(<MagicLoader />);

      const loader = screen.getByTestId('magic-loader');
      expect(loader).toHaveAttribute('data-animate', 'true');
    });

    it('peut desactiver animation', () => {
      render(<MagicLoader disableAnimation />);

      const loader = screen.getByTestId('magic-loader');
      expect(loader).toHaveAttribute('data-animate', 'false');
    });
  });

  describe('customisation', () => {
    it('accepte className additionnel', () => {
      render(<MagicLoader className="custom-class" />);

      const loader = screen.getByTestId('magic-loader');
      expect(loader).toHaveClass('custom-class');
    });
  });
});
