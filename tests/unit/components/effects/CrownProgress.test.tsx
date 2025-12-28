/**
 * Tests CrownProgress - TDD RED PHASE
 * ISO/IEC 29119 - Tests unitaires
 *
 * P0 Component - Indicateur progression couronne SVG
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CrownProgress } from '@/components/effects/CrownProgress';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
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
    path: ({
      className,
      d: pathD,
      fill,
      'data-testid': testId,
      ...props
    }: React.ComponentProps<'path'> & { 'data-testid'?: string }) => (
      <path
        className={className}
        d={pathD}
        fill={fill}
        data-testid={testId}
        {...props}
      />
    ),
    circle: ({
      className,
      cx,
      cy,
      r,
      fill,
      ...props
    }: React.ComponentProps<'circle'>) => (
      <circle
        className={className}
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        {...props}
      />
    ),
  },
}));

// Mock useReducedMotion
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => ({
    prefersReducedMotion: false,
    shouldAnimate: true,
  }),
}));

describe('CrownProgress', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendu de base', () => {
    it('rend le conteneur SVG', () => {
      render(<CrownProgress progress={50} />);

      const svg = screen.getByTestId('crown-progress');
      expect(svg).toBeInTheDocument();
    });

    it('rend le path de fond', () => {
      render(<CrownProgress progress={50} />);

      const background = screen.getByTestId('crown-background');
      expect(background).toBeInTheDocument();
    });

    it('rend le path de progression', () => {
      render(<CrownProgress progress={50} />);

      const fill = screen.getByTestId('crown-fill');
      expect(fill).toBeInTheDocument();
    });
  });

  describe('progression', () => {
    it('accepte progress 0', () => {
      render(<CrownProgress progress={0} />);

      const svg = screen.getByTestId('crown-progress');
      expect(svg).toHaveAttribute('data-progress', '0');
    });

    it('accepte progress 100', () => {
      render(<CrownProgress progress={100} />);

      const svg = screen.getByTestId('crown-progress');
      expect(svg).toHaveAttribute('data-progress', '100');
    });

    it('limite progress au minimum 0', () => {
      render(<CrownProgress progress={-10} />);

      const svg = screen.getByTestId('crown-progress');
      expect(svg).toHaveAttribute('data-progress', '0');
    });

    it('limite progress au maximum 100', () => {
      render(<CrownProgress progress={150} />);

      const svg = screen.getByTestId('crown-progress');
      expect(svg).toHaveAttribute('data-progress', '100');
    });
  });

  describe('tailles', () => {
    it('a taille md par defaut', () => {
      render(<CrownProgress progress={50} />);

      const svg = screen.getByTestId('crown-progress');
      expect(svg).toHaveClass('w-16', 'h-16');
    });

    it('accepte taille sm', () => {
      render(<CrownProgress progress={50} size="sm" />);

      const svg = screen.getByTestId('crown-progress');
      expect(svg).toHaveClass('w-12', 'h-12');
    });

    it('accepte taille lg', () => {
      render(<CrownProgress progress={50} size="lg" />);

      const svg = screen.getByTestId('crown-progress');
      expect(svg).toHaveClass('w-24', 'h-24');
    });
  });

  describe('variantes theme', () => {
    it('applique style princess par defaut', () => {
      render(<CrownProgress progress={50} />);

      const fill = screen.getByTestId('crown-fill');
      // Utilise gradient SVG pour haute qualite visuelle
      expect(fill).toHaveAttribute('fill', 'url(#crown-gradient-princess)');
    });

    it('applique style unicorn', () => {
      render(<CrownProgress progress={50} variant="unicorn" />);

      const fill = screen.getByTestId('crown-fill');
      expect(fill).toHaveAttribute('fill', 'url(#crown-gradient-unicorn)');
    });

    it('applique style star', () => {
      render(<CrownProgress progress={50} variant="star" />);

      const fill = screen.getByTestId('crown-fill');
      expect(fill).toHaveAttribute('fill', 'url(#crown-gradient-star)');
    });
  });

  describe('affichage texte', () => {
    it('affiche le pourcentage par defaut', () => {
      render(<CrownProgress progress={75} />);

      expect(screen.getByTestId('crown-text')).toHaveTextContent('75%');
    });

    it('peut masquer le texte', () => {
      render(<CrownProgress progress={75} showText={false} />);

      expect(screen.queryByTestId('crown-text')).not.toBeInTheDocument();
    });
  });

  describe('animation', () => {
    it('a data-animate true par defaut', () => {
      render(<CrownProgress progress={50} />);

      const svg = screen.getByTestId('crown-progress');
      expect(svg).toHaveAttribute('data-animate', 'true');
    });

    it('peut desactiver animation', () => {
      render(<CrownProgress progress={50} disableAnimation />);

      const svg = screen.getByTestId('crown-progress');
      expect(svg).toHaveAttribute('data-animate', 'false');
    });
  });

  describe('accessibilite', () => {
    it('a role progressbar', () => {
      render(<CrownProgress progress={50} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('a aria-valuenow', () => {
      render(<CrownProgress progress={75} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    });

    it('a aria-valuemin et max', () => {
      render(<CrownProgress progress={50} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    it('a aria-label', () => {
      render(<CrownProgress progress={50} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label', 'Progression');
    });
  });

  describe('customisation', () => {
    it('accepte className additionnel', () => {
      render(<CrownProgress progress={50} className="custom-class" />);

      const svg = screen.getByTestId('crown-progress');
      expect(svg).toHaveClass('custom-class');
    });
  });
});
