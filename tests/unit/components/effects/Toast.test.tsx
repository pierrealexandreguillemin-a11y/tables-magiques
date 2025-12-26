/**
 * Tests ToastContainer - TDD
 * ISO/IEC 29119 - Tests unitaires
 *
 * WCAG 2.2 - Toast Notifications accessibles
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastContainer } from '@/components/effects/Toast';
import type { Toast } from '@/types/effects';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      role,
      'aria-live': ariaLive,
      'aria-atomic': ariaAtomic,
      tabIndex,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...props
    }: React.ComponentProps<'div'> & {
      'aria-live'?: string;
      'aria-atomic'?: string;
    }) => (
      <div
        className={className}
        role={role}
        aria-live={ariaLive}
        aria-atomic={ariaAtomic}
        tabIndex={tabIndex}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      >
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
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
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

describe('ToastContainer', () => {
  const mockToast: Toast = {
    id: 'toast-1',
    type: 'success',
    message: 'Test message',
    duration: 6000,
    icon: '🌟',
  };

  const mockOnDismiss = vi.fn();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendu de base', () => {
    it('rend le container', () => {
      render(<ToastContainer toasts={[]} onDismiss={mockOnDismiss} />);

      const container = screen.getByTestId('toast-container');
      expect(container).toBeInTheDocument();
    });

    it('affiche une liste vide sans toasts', () => {
      render(<ToastContainer toasts={[]} onDismiss={mockOnDismiss} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('affiche un toast', () => {
      render(<ToastContainer toasts={[mockToast]} onDismiss={mockOnDismiss} />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('affiche plusieurs toasts', () => {
      const toasts: Toast[] = [
        mockToast,
        { id: 'toast-2', type: 'error', message: 'Erreur', icon: '💭' },
      ];

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('Erreur')).toBeInTheDocument();
    });
  });

  describe('accessibilite', () => {
    it('a role="alert"', () => {
      render(<ToastContainer toasts={[mockToast]} onDismiss={mockOnDismiss} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('a aria-live="polite"', () => {
      render(<ToastContainer toasts={[mockToast]} onDismiss={mockOnDismiss} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    it('a aria-atomic="true"', () => {
      render(<ToastContainer toasts={[mockToast]} onDismiss={mockOnDismiss} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-atomic', 'true');
    });

    it('est focusable (tabIndex=0)', () => {
      render(<ToastContainer toasts={[mockToast]} onDismiss={mockOnDismiss} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('tabIndex', '0');
    });

    it('le bouton fermer a aria-label', () => {
      render(<ToastContainer toasts={[mockToast]} onDismiss={mockOnDismiss} />);

      const closeBtn = screen.getByRole('button', { name: /fermer/i });
      expect(closeBtn).toBeInTheDocument();
    });

    it('a aria-label "Notifications" sur le container', () => {
      render(<ToastContainer toasts={[mockToast]} onDismiss={mockOnDismiss} />);

      const container = screen.getByTestId('toast-container');
      expect(container).toHaveAttribute('aria-label', 'Notifications');
    });
  });

  describe('dismiss', () => {
    it('appelle onDismiss au clic sur le toast', () => {
      render(<ToastContainer toasts={[mockToast]} onDismiss={mockOnDismiss} />);

      fireEvent.click(screen.getByRole('alert'));

      expect(mockOnDismiss).toHaveBeenCalledWith('toast-1');
    });

    it('appelle onDismiss au clic sur le bouton fermer', () => {
      render(<ToastContainer toasts={[mockToast]} onDismiss={mockOnDismiss} />);

      const closeBtn = screen.getByRole('button', { name: /fermer/i });
      fireEvent.click(closeBtn);

      expect(mockOnDismiss).toHaveBeenCalledWith('toast-1');
    });
  });

  describe('icones', () => {
    it('affiche l icone du toast', () => {
      render(<ToastContainer toasts={[mockToast]} onDismiss={mockOnDismiss} />);

      expect(screen.getByText('🌟')).toBeInTheDocument();
    });
  });

  describe('position', () => {
    it('position top-right par defaut', () => {
      render(<ToastContainer toasts={[mockToast]} onDismiss={mockOnDismiss} />);

      const container = screen.getByTestId('toast-container');
      expect(container).toHaveClass('top-4', 'right-4');
    });

    it('supporte position top-center', () => {
      render(
        <ToastContainer
          toasts={[mockToast]}
          onDismiss={mockOnDismiss}
          position="top-center"
        />
      );

      const container = screen.getByTestId('toast-container');
      expect(container).toHaveClass('top-4', 'left-1/2', '-translate-x-1/2');
    });

    it('supporte position bottom-right', () => {
      render(
        <ToastContainer
          toasts={[mockToast]}
          onDismiss={mockOnDismiss}
          position="bottom-right"
        />
      );

      const container = screen.getByTestId('toast-container');
      expect(container).toHaveClass('bottom-4', 'right-4');
    });
  });

  describe('styles par type', () => {
    it('applique les styles success', () => {
      render(<ToastContainer toasts={[mockToast]} onDismiss={mockOnDismiss} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-green-500/20');
    });

    it('applique les styles error', () => {
      const errorToast: Toast = { ...mockToast, type: 'error' };
      render(
        <ToastContainer toasts={[errorToast]} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-pink-500/20');
    });

    it('applique les styles star', () => {
      const starToast: Toast = { ...mockToast, type: 'star' };
      render(<ToastContainer toasts={[starToast]} onDismiss={mockOnDismiss} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-yellow-500/20');
    });

    it('applique les styles crown', () => {
      const crownToast: Toast = { ...mockToast, type: 'crown' };
      render(
        <ToastContainer toasts={[crownToast]} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-purple-500/20');
    });

    it('applique les styles info', () => {
      const infoToast: Toast = { ...mockToast, type: 'info' };
      render(<ToastContainer toasts={[infoToast]} onDismiss={mockOnDismiss} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-blue-500/20');
    });
  });
});
