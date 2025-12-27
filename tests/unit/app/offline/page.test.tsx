/**
 * Tests Unitaires - Offline Page
 * ISO/IEC 29119 - TDD: Tests page offline
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OfflinePage from '@/app/offline/page';

describe('OfflinePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendu', () => {
    it('affiche le titre Hors ligne', () => {
      render(<OfflinePage />);

      expect(
        screen.getByRole('heading', { name: /hors ligne/i })
      ).toBeInTheDocument();
    });

    it('affiche icone satellite', () => {
      render(<OfflinePage />);

      expect(screen.getByText('📡')).toBeInTheDocument();
    });

    it('affiche message explicatif', () => {
      render(<OfflinePage />);

      expect(screen.getByText(/pas connecte/i)).toBeInTheDocument();
    });

    it('affiche bouton reessayer', () => {
      render(<OfflinePage />);

      expect(
        screen.getByRole('button', { name: /reessayer/i })
      ).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('recharge la page au clic sur reessayer', () => {
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      render(<OfflinePage />);

      const button = screen.getByRole('button', { name: /reessayer/i });
      fireEvent.click(button);

      expect(reloadMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibilite', () => {
    it('a une structure heading correcte', () => {
      render(<OfflinePage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('bouton est focusable', () => {
      render(<OfflinePage />);

      const button = screen.getByRole('button');
      button.focus();

      expect(document.activeElement).toBe(button);
    });
  });

  describe('style', () => {
    it('a les classes dark mode', () => {
      const { container } = render(<OfflinePage />);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('dark:from-indigo-900');
    });
  });
});
