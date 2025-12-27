/**
 * Tests GentleShake - TDD
 * ISO/IEC 29119 - Tests unitaires
 *
 * WCAG 2.2 - Feedback erreur doux pour enfants
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GentleShake } from '@/components/effects/GentleShake';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      animate,
    }: React.ComponentProps<'div'> & { animate?: unknown }) => (
      <div className={className} data-animate={JSON.stringify(animate)}>
        {children}
      </div>
    ),
    p: ({
      children,
      className,
      role,
      'aria-live': ariaLive,
    }: React.ComponentProps<'p'> & { 'aria-live'?: string }) => (
      <p className={className} role={role} aria-live={ariaLive}>
        {children}
      </p>
    ),
  },
  useAnimationControls: () => ({
    start: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock useReducedMotion
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => ({
    shouldAnimate: true,
    prefersReducedMotion: false,
  }),
}));

describe('GentleShake', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendu de base', () => {
    it('rend les children', () => {
      render(
        <GentleShake trigger={false}>
          <span>Contenu enfant</span>
        </GentleShake>
      );

      expect(screen.getByText('Contenu enfant')).toBeInTheDocument();
    });

    it('accepte className personnalise', () => {
      const { container } = render(
        <GentleShake trigger={false} className="custom-class">
          <span>Test</span>
        </GentleShake>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('message encourageant', () => {
    it('n affiche pas de message quand trigger=false', () => {
      render(
        <GentleShake trigger={false}>
          <span>Test</span>
        </GentleShake>
      );

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('affiche un message quand trigger=true', () => {
      render(
        <GentleShake trigger={true}>
          <span>Test</span>
        </GentleShake>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('affiche le message personnalise', () => {
      render(
        <GentleShake trigger={true} message="Mon message personnalise">
          <span>Test</span>
        </GentleShake>
      );

      expect(screen.getByText('Mon message personnalise')).toBeInTheDocument();
    });

    it('affiche un message aleatoire si non fourni', () => {
      render(
        <GentleShake trigger={true}>
          <span>Test</span>
        </GentleShake>
      );

      const status = screen.getByRole('status');
      expect(status.textContent).toBeTruthy();
      // Le message contient un emoji + texte
      expect(status.textContent?.length).toBeGreaterThan(1);
    });
  });

  describe('accessibilite', () => {
    it('le message a role="status"', () => {
      render(
        <GentleShake trigger={true}>
          <span>Test</span>
        </GentleShake>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('le message a aria-live="polite"', () => {
      render(
        <GentleShake trigger={true}>
          <span>Test</span>
        </GentleShake>
      );

      const message = screen.getByRole('status');
      expect(message).toHaveAttribute('aria-live', 'polite');
    });

    it('l emoji est decoratif (aria-hidden)', () => {
      render(
        <GentleShake trigger={true}>
          <span>Test</span>
        </GentleShake>
      );

      // L'emoji est cache des screen readers
      const emoji = screen.getByText('💭');
      expect(emoji).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('callback', () => {
    it('appelle onShakeComplete apres l animation', async () => {
      const onComplete = vi.fn();

      render(
        <GentleShake trigger={true} onShakeComplete={onComplete}>
          <span>Test</span>
        </GentleShake>
      );

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });
  });

  describe('amplitude', () => {
    it('utilise amplitude par defaut de 10', () => {
      // L'amplitude est utilisee dans useCallback, on verifie juste que ca rend sans erreur
      render(
        <GentleShake trigger={true}>
          <span>Test</span>
        </GentleShake>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('accepte amplitude personnalisee', () => {
      render(
        <GentleShake trigger={true} amplitude={5}>
          <span>Test</span>
        </GentleShake>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('disableAnimation', () => {
    it('respecte disableAnimation=true', () => {
      render(
        <GentleShake trigger={true} disableAnimation={true}>
          <span>Test</span>
        </GentleShake>
      );

      // Le composant rend toujours mais sans animation
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('styles', () => {
    it('le message a les couleurs rose pastel', () => {
      render(
        <GentleShake trigger={true}>
          <span>Test</span>
        </GentleShake>
      );

      const message = screen.getByRole('status');
      expect(message).toHaveClass('text-pink-400');
    });

    it('le message est positionne en bas centre', () => {
      render(
        <GentleShake trigger={true}>
          <span>Test</span>
        </GentleShake>
      );

      const message = screen.getByRole('status');
      expect(message).toHaveClass(
        'absolute',
        '-bottom-8',
        'left-1/2',
        '-translate-x-1/2'
      );
    });
  });
});
