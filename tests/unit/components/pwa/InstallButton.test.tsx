/**
 * Tests Unitaires - InstallButton Component
 * ISO/IEC 29119 - TDD: Tests AVANT implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstallButton } from '@/components/pwa/InstallButton';

// Mock useInstallPrompt
const mockPromptInstall = vi.fn();
vi.mock('@/hooks/useInstallPrompt', () => ({
  useInstallPrompt: () => ({
    isInstallable: true,
    isInstalled: false,
    promptInstall: mockPromptInstall,
  }),
}));

describe('InstallButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPromptInstall.mockResolvedValue(true);
  });

  describe('rendu', () => {
    it('rend le bouton quand installable', () => {
      render(<InstallButton />);

      expect(
        screen.getByRole('button', { name: /installer/i })
      ).toBeInTheDocument();
    });

    it('affiche icone download', () => {
      render(<InstallButton />);

      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });

    it('applique className personnalise', () => {
      render(<InstallButton className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('interaction', () => {
    it('appelle promptInstall au clic', async () => {
      render(<InstallButton />);

      const button = screen.getByRole('button', { name: /installer/i });
      fireEvent.click(button);

      expect(mockPromptInstall).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibilite', () => {
    it('a aria-label descriptif', () => {
      render(<InstallButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });

    it('est focusable', () => {
      render(<InstallButton />);

      const button = screen.getByRole('button');
      button.focus();

      expect(document.activeElement).toBe(button);
    });
  });
});

describe('InstallButton - Non Installable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.doMock('@/hooks/useInstallPrompt', () => ({
      useInstallPrompt: () => ({
        isInstallable: false,
        isInstalled: false,
        promptInstall: mockPromptInstall,
      }),
    }));
  });

  it('ne rend rien si non installable', async () => {
    vi.resetModules();
    vi.doMock('@/hooks/useInstallPrompt', () => ({
      useInstallPrompt: () => ({
        isInstallable: false,
        isInstalled: false,
        promptInstall: mockPromptInstall,
      }),
    }));

    const { InstallButton: InstallButtonNotInstallable } =
      await import('@/components/pwa/InstallButton');
    const { container } = render(<InstallButtonNotInstallable />);

    expect(container.firstChild).toBeNull();
  });
});

describe('InstallButton - Already Installed', () => {
  it('ne rend rien si deja installe', async () => {
    vi.resetModules();
    vi.doMock('@/hooks/useInstallPrompt', () => ({
      useInstallPrompt: () => ({
        isInstallable: false,
        isInstalled: true,
        promptInstall: mockPromptInstall,
      }),
    }));

    const { InstallButton: InstallButtonInstalled } =
      await import('@/components/pwa/InstallButton');
    const { container } = render(<InstallButtonInstalled />);

    expect(container.firstChild).toBeNull();
  });
});
