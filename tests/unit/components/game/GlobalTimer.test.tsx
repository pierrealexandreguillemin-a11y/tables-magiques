/**
 * Tests Unitaires - GlobalTimer
 * ISO/IEC 29119 - TDD: Tests AVANT implementation
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlobalTimer } from '@/features/game/components/GlobalTimer';

describe('GlobalTimer', () => {
  describe('Affichage temps', () => {
    it('affiche 3:00 pour 180 secondes', () => {
      render(<GlobalTimer timeRemaining={180} />);

      expect(screen.getByText('3:00')).toBeInTheDocument();
    });

    it('affiche 1:30 pour 90 secondes', () => {
      render(<GlobalTimer timeRemaining={90} />);

      expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    it('affiche 0:05 pour 5 secondes', () => {
      render(<GlobalTimer timeRemaining={5} />);

      expect(screen.getByText('0:05')).toBeInTheDocument();
    });

    it('affiche 0:00 pour 0 secondes', () => {
      render(<GlobalTimer timeRemaining={0} />);

      expect(screen.getByText('0:00')).toBeInTheDocument();
    });
  });

  describe('Style urgence', () => {
    it('style normal au-dessus de 30 secondes', () => {
      render(<GlobalTimer timeRemaining={60} />);

      const timer = screen.getByRole('timer');
      expect(timer).not.toHaveClass('animate-pulse');
      expect(timer).not.toHaveClass('text-red-500');
    });

    it('style urgence sous 30 secondes', () => {
      render(<GlobalTimer timeRemaining={25} />);

      const timer = screen.getByRole('timer');
      expect(timer).toHaveClass('text-red-400');
    });

    it('animation pulse sous 30 secondes', () => {
      render(<GlobalTimer timeRemaining={15} />);

      const timer = screen.getByRole('timer');
      expect(timer).toHaveClass('animate-pulse');
    });

    it('style critique sous 10 secondes', () => {
      render(<GlobalTimer timeRemaining={8} />);

      const timer = screen.getByRole('timer');
      expect(timer).toHaveClass('text-red-500');
    });
  });

  describe('Accessibilite', () => {
    it('a role timer', () => {
      render(<GlobalTimer timeRemaining={60} />);

      expect(screen.getByRole('timer')).toBeInTheDocument();
    });

    it('a aria-label descriptif', () => {
      render(<GlobalTimer timeRemaining={60} />);

      expect(screen.getByLabelText(/temps.*restant/i)).toBeInTheDocument();
    });

    it('a aria-live pour annonces', () => {
      render(<GlobalTimer timeRemaining={60} />);

      const timer = screen.getByRole('timer');
      expect(timer).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Props', () => {
    it('accepte className personnalise', () => {
      render(<GlobalTimer timeRemaining={60} className="custom-class" />);

      const timer = screen.getByRole('timer');
      expect(timer).toHaveClass('custom-class');
    });
  });
});
