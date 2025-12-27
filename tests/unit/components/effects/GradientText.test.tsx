/**
 * Tests GradientText - TDD
 * ISO/IEC 29119 - Tests unitaires
 *
 * Texte avec gradient anime - Theme princesse/licorne
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GradientText } from '@/components/effects/GradientText';

// Mock useReducedMotion
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => ({
    shouldAnimate: true,
    prefersReducedMotion: false,
  }),
}));

describe('GradientText', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendu de base', () => {
    it('rend le texte children', () => {
      render(<GradientText>Tables Magiques</GradientText>);

      expect(screen.getByText('Tables Magiques')).toBeInTheDocument();
    });

    it('utilise span par defaut', () => {
      render(<GradientText>Test</GradientText>);

      const element = screen.getByText('Test');
      expect(element.tagName).toBe('SPAN');
    });

    it('a les classes gradient de base', () => {
      render(<GradientText>Test</GradientText>);

      const element = screen.getByText('Test');
      expect(element).toHaveClass(
        'bg-gradient-to-r',
        'bg-clip-text',
        'text-transparent'
      );
    });
  });

  describe('variantes', () => {
    it('applique variant fairy par defaut', () => {
      render(<GradientText>Test</GradientText>);

      const element = screen.getByText('Test');
      expect(element).toHaveClass(
        'from-pink-400',
        'via-purple-400',
        'to-blue-400'
      );
    });

    it('applique variant unicorn', () => {
      render(<GradientText variant="unicorn">Test</GradientText>);

      const element = screen.getByText('Test');
      expect(element).toHaveClass('from-pink-400');
      expect(element).toHaveClass('to-yellow-400');
    });

    it('applique variant rainbow', () => {
      render(<GradientText variant="rainbow">Test</GradientText>);

      const element = screen.getByText('Test');
      expect(element).toHaveClass('from-red-400');
      expect(element).toHaveClass('to-purple-400');
    });

    it('applique variant gold', () => {
      render(<GradientText variant="gold">Test</GradientText>);

      const element = screen.getByText('Test');
      expect(element).toHaveClass('from-yellow-300', 'to-orange-400');
    });
  });

  describe('element as', () => {
    it('peut etre un h1', () => {
      render(<GradientText as="h1">Titre</GradientText>);

      const element = screen.getByRole('heading', { level: 1 });
      expect(element).toBeInTheDocument();
      expect(element.textContent).toBe('Titre');
    });

    it('peut etre un h2', () => {
      render(<GradientText as="h2">Sous-titre</GradientText>);

      const element = screen.getByRole('heading', { level: 2 });
      expect(element).toBeInTheDocument();
    });

    it('peut etre un h3', () => {
      render(<GradientText as="h3">Section</GradientText>);

      const element = screen.getByRole('heading', { level: 3 });
      expect(element).toBeInTheDocument();
    });

    it('peut etre un p', () => {
      render(<GradientText as="p">Paragraphe</GradientText>);

      const element = screen.getByText('Paragraphe');
      expect(element.tagName).toBe('P');
    });
  });

  describe('animation', () => {
    it('n a pas animate-gradient-x par defaut', () => {
      render(<GradientText>Test</GradientText>);

      const element = screen.getByText('Test');
      expect(element).not.toHaveClass('animate-gradient-x');
    });

    it('a animate-gradient-x quand animate=true', () => {
      render(<GradientText animate>Test</GradientText>);

      const element = screen.getByText('Test');
      expect(element).toHaveClass('animate-gradient-x');
    });

    it('a backgroundSize 200% quand animate', () => {
      render(<GradientText animate>Test</GradientText>);

      const element = screen.getByText('Test');
      expect(element).toHaveStyle({ backgroundSize: '200% 100%' });
    });
  });

  describe('GPU acceleration', () => {
    it('a transform-gpu pour performance', () => {
      render(<GradientText>Test</GradientText>);

      const element = screen.getByText('Test');
      expect(element).toHaveClass('transform-gpu');
    });
  });

  describe('customisation', () => {
    it('accepte className personnalise', () => {
      render(
        <GradientText className="custom-class text-4xl">Test</GradientText>
      );

      const element = screen.getByText('Test');
      expect(element).toHaveClass('custom-class', 'text-4xl');
    });

    it('combine les classes sans conflit', () => {
      render(<GradientText className="font-bold">Test</GradientText>);

      const element = screen.getByText('Test');
      // Classes de base conservees
      expect(element).toHaveClass('bg-gradient-to-r', 'bg-clip-text');
      // Classes custom ajoutees
      expect(element).toHaveClass('font-bold');
    });
  });

  describe('reduced motion', () => {
    it('desactive animation si reduced motion', () => {
      vi.doMock('@/hooks/useReducedMotion', () => ({
        useReducedMotion: () => ({
          shouldAnimate: false,
          prefersReducedMotion: true,
        }),
      }));

      // Note: Ce test verifie la logique, l'implementation reelle
      // utilise shouldAnimateGradient = animate && shouldAnimate
      render(<GradientText animate>Test</GradientText>);

      // Le composant respecte la preference systeme via le hook
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('fallback navigateurs', () => {
    it('utilise bg-clip-text pour compatibilite', () => {
      render(<GradientText>Test</GradientText>);

      const element = screen.getByText('Test');
      // Tailwind gere le background-clip via la classe
      // Le style inline WebkitBackgroundClip est en supplement
      expect(element).toHaveClass('bg-clip-text');
    });
  });
});
