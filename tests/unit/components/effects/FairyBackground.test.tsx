/**
 * Tests FairyBackground - TDD
 * ISO/IEC 29119 - Tests unitaires
 *
 * P0 Component - Fond magique feerie avec tsParticles
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FairyBackground } from '@/components/effects/FairyBackground';

// Mock framer-motion to avoid animation issues in tests
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
  },
}));

// Mock tsParticles
vi.mock('@tsparticles/react', () => ({
  default: ({
    id,
    className,
    'data-testid': testId,
    options,
  }: {
    id: string;
    className?: string;
    'data-testid'?: string;
    options?: { particles?: { number?: { value?: number } } };
  }) => (
    <div
      id={id}
      className={className}
      data-testid={testId ?? 'particles-container'}
      data-particle-count={options?.particles?.number?.value?.toString()}
    />
  ),
  initParticlesEngine: vi.fn().mockResolvedValue(undefined),
}));

// Mock tsParticles slim engine
vi.mock('@tsparticles/slim', () => ({
  loadSlim: vi.fn().mockResolvedValue(undefined),
}));

describe('FairyBackground', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendu de base', () => {
    it('rend le conteneur principal', () => {
      render(<FairyBackground />);

      const container = screen.getByTestId('fairy-background');
      expect(container).toBeInTheDocument();
    });

    it('a la classe fixed inset-0 pour couvrir l ecran', () => {
      render(<FairyBackground />);

      const container = screen.getByTestId('fairy-background');
      expect(container).toHaveClass('fixed');
      expect(container).toHaveClass('inset-0');
    });

    it('a un z-index negatif pour etre derriere le contenu', () => {
      render(<FairyBackground />);

      const container = screen.getByTestId('fairy-background');
      expect(container).toHaveClass('-z-10');
    });
  });

  describe('nuages', () => {
    it('rend 3 nuages colores', () => {
      render(<FairyBackground />);

      const clouds = screen.getAllByTestId(/^cloud-/);
      expect(clouds).toHaveLength(3);
    });

    it('rend le nuage rose (princess)', () => {
      render(<FairyBackground />);

      const pinkCloud = screen.getByTestId('cloud-pink');
      expect(pinkCloud).toBeInTheDocument();
    });

    it('rend le nuage violet (unicorn)', () => {
      render(<FairyBackground />);

      const purpleCloud = screen.getByTestId('cloud-purple');
      expect(purpleCloud).toBeInTheDocument();
    });

    it('rend le nuage bleu (sky)', () => {
      render(<FairyBackground />);

      const blueCloud = screen.getByTestId('cloud-blue');
      expect(blueCloud).toBeInTheDocument();
    });
  });

  describe('particles (etoiles tsParticles)', () => {
    it('rend le conteneur particles apres initialisation', async () => {
      render(<FairyBackground />);

      const particles = await waitFor(() =>
        screen.getByTestId('particles-container')
      );
      expect(particles).toBeInTheDocument();
    });

    it('configure le nombre de particules par defaut (20)', async () => {
      render(<FairyBackground />);

      const particles = await waitFor(() =>
        screen.getByTestId('particles-container')
      );
      expect(particles).toHaveAttribute('data-particle-count', '20');
    });

    it('respecte le starCount personnalise', async () => {
      render(<FairyBackground starCount={50} />);

      const particles = await waitFor(() =>
        screen.getByTestId('particles-container')
      );
      expect(particles).toHaveAttribute('data-particle-count', '50');
    });
  });

  describe('accessibilite', () => {
    it('a role="presentation" car decoratif', () => {
      render(<FairyBackground />);

      const container = screen.getByTestId('fairy-background');
      expect(container).toHaveAttribute('role', 'presentation');
    });

    it('a aria-hidden="true"', () => {
      render(<FairyBackground />);

      const container = screen.getByTestId('fairy-background');
      expect(container).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('reduced motion', () => {
    it('accepte prop disableAnimation', () => {
      render(<FairyBackground disableAnimation />);

      const container = screen.getByTestId('fairy-background');
      expect(container).toBeInTheDocument();
    });
  });

  describe('customisation', () => {
    it('accepte className additionnel', () => {
      render(<FairyBackground className="custom-class" />);

      const container = screen.getByTestId('fairy-background');
      expect(container).toHaveClass('custom-class');
    });

    it('accepte prop starCount pour controler le nombre de particules', async () => {
      render(<FairyBackground starCount={10} />);

      const particles = await waitFor(() =>
        screen.getByTestId('particles-container')
      );
      expect(particles).toHaveAttribute('data-particle-count', '10');
    });
  });
});
