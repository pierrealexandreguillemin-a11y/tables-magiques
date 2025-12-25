/**
 * Tests FairyBackground - TDD RED PHASE
 * ISO/IEC 29119 - Tests unitaires
 *
 * P0 Component - Fond magique feerie
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  describe('etoiles', () => {
    it('rend des etoiles scintillantes', () => {
      render(<FairyBackground />);

      const stars = screen.getAllByTestId(/^star-/);
      expect(stars.length).toBeGreaterThan(0);
    });

    it('rend entre 15 et 25 etoiles par defaut', () => {
      render(<FairyBackground />);

      const stars = screen.getAllByTestId(/^star-/);
      expect(stars.length).toBeGreaterThanOrEqual(15);
      expect(stars.length).toBeLessThanOrEqual(25);
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

    it('accepte prop starCount pour controler le nombre d etoiles', () => {
      render(<FairyBackground starCount={10} />);

      const stars = screen.getAllByTestId(/^star-/);
      expect(stars).toHaveLength(10);
    });
  });
});
