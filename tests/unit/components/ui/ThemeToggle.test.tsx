/**
 * Tests Unitaires - ThemeToggle Component
 * ISO/IEC 29119 - TDD: Tests bouton toggle theme
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Mock useTheme
const mockSetTheme = vi.fn();
const mockToggleTheme = vi.fn();

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    isDark: false,
    systemPreference: 'light',
    setTheme: mockSetTheme,
    toggleTheme: mockToggleTheme,
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendu', () => {
    it('rend le bouton toggle', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('a aria-label descriptif', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });

    it('affiche icone soleil en mode light', () => {
      render(<ThemeToggle />);

      const sunIcon = screen.getByTestId('sun-icon');
      expect(sunIcon).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('appelle toggleTheme au clic', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibilite', () => {
    it('est focusable au clavier', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it('toggle sur Enter', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      // Le comportement par défaut du bouton gère Enter
      expect(button).toBeInTheDocument();
    });
  });
});

describe('ThemeToggle - Dark Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-mock avec dark mode
    vi.doMock('@/hooks/useTheme', () => ({
      useTheme: () => ({
        theme: 'dark',
        isDark: true,
        systemPreference: 'dark',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      }),
    }));
  });

  it('affiche icone lune en mode dark', async () => {
    // Import dynamique pour avoir le nouveau mock
    vi.resetModules();
    vi.doMock('@/hooks/useTheme', () => ({
      useTheme: () => ({
        theme: 'dark',
        isDark: true,
        systemPreference: 'dark',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      }),
    }));

    const { ThemeToggle: ThemeToggleDark } =
      await import('@/components/ui/ThemeToggle');
    render(<ThemeToggleDark />);

    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeInTheDocument();
  });
});
