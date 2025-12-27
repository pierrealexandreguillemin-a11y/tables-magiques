/**
 * Tests MagicButton - TDD RED PHASE
 * ISO/IEC 29119 - Tests unitaires
 *
 * P0 Component - Bouton avec effet paillettes
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MagicButton } from '@/components/effects/MagicButton';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({
      children,
      className,
      'data-testid': testId,
      onClick,
      disabled,
      ...props
    }: React.ComponentProps<'button'> & { 'data-testid'?: string }) => (
      <button
        className={className}
        data-testid={testId}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    ),
    span: ({
      children,
      className,
      'data-testid': testId,
      ...props
    }: React.ComponentProps<'span'> & { 'data-testid'?: string }) => (
      <span className={className} data-testid={testId} {...props}>
        {children}
      </span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe('MagicButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendu de base', () => {
    it('rend le bouton', () => {
      render(<MagicButton>Verifier</MagicButton>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('affiche le texte children', () => {
      render(<MagicButton>Valider ma reponse</MagicButton>);

      expect(screen.getByText('Valider ma reponse')).toBeInTheDocument();
    });

    it('a les classes de gradient de base', () => {
      render(<MagicButton>Test</MagicButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-to-r');
    });
  });

  describe('variantes', () => {
    it('applique le style princess par defaut', () => {
      render(<MagicButton>Test</MagicButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-pink-400');
    });

    it('applique le style unicorn', () => {
      render(<MagicButton variant="unicorn">Test</MagicButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-purple-400');
    });

    it('applique le style star', () => {
      render(<MagicButton variant="star">Test</MagicButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-yellow-400');
    });
  });

  describe('interaction', () => {
    it('appelle onClick au clic', () => {
      const handleClick = vi.fn();
      render(<MagicButton onClick={handleClick}>Test</MagicButton>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('n appelle pas onClick si disabled', () => {
      const handleClick = vi.fn();
      render(
        <MagicButton onClick={handleClick} disabled>
          Test
        </MagicButton>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('n appelle pas onClick si loading', () => {
      const handleClick = vi.fn();
      render(
        <MagicButton onClick={handleClick} loading>
          Test
        </MagicButton>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('etats', () => {
    it('a opacity reduite quand disabled', () => {
      render(<MagicButton disabled>Test</MagicButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-50');
    });

    it('a cursor-not-allowed quand disabled', () => {
      render(<MagicButton disabled>Test</MagicButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('affiche spinner quand loading', () => {
      render(<MagicButton loading>Test</MagicButton>);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('cache le texte quand loading', () => {
      render(<MagicButton loading>Test</MagicButton>);

      const content = screen.getByTestId('button-content');
      expect(content).toHaveClass('opacity-0');
    });
  });

  describe('accessibilite', () => {
    it('a un touch target >= 48px', () => {
      render(<MagicButton>Test</MagicButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[48px]');
      expect(button).toHaveClass('min-w-[48px]');
    });

    it('a disabled attribute quand disabled', () => {
      render(<MagicButton disabled>Test</MagicButton>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('a aria-busy quand loading', () => {
      render(<MagicButton loading>Test</MagicButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('customisation', () => {
    it('accepte className additionnel', () => {
      render(<MagicButton className="custom-class">Test</MagicButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('accepte type submit', () => {
      render(<MagicButton type="submit">Envoyer</MagicButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });
});
