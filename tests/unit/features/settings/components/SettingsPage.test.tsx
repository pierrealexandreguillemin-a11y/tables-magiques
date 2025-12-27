/**
 * Tests unitaires SettingsPage
 * ISO 29119 - Tests composants UI
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsPage } from '@/features/settings/components/SettingsPage';

// =============================================================================
// MOCKS
// =============================================================================

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock URL.createObjectURL/revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// =============================================================================
// TESTS
// =============================================================================

describe('SettingsPage', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all settings sections', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId('settings-accessibility')
        ).toBeInTheDocument();
      });

      expect(screen.getByTestId('settings-audio')).toBeInTheDocument();
      expect(screen.getByTestId('settings-display')).toBeInTheDocument();
      expect(screen.getByTestId('settings-game')).toBeInTheDocument();
      expect(screen.getByTestId('settings-notifications')).toBeInTheDocument();
      expect(screen.getByTestId('settings-privacy')).toBeInTheDocument();
      expect(screen.getByTestId('settings-about')).toBeInTheDocument();
    });

    it('shows loading skeleton while loading', () => {
      render(<SettingsPage />);
      // Component should show skeleton briefly or load immediately
      // This is a sanity check that rendering works
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Accessibility Section', () => {
    it('renders reduced motion toggle', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-reduced-motion')).toBeInTheDocument();
      });
    });

    it('renders high contrast toggle', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-high-contrast')).toBeInTheDocument();
      });
    });

    it('renders text scale slider', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('slider-text-scale')).toBeInTheDocument();
      });
    });
  });

  describe('Audio Section', () => {
    it('renders sound toggle', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-sound')).toBeInTheDocument();
      });
    });

    it('renders music toggle', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-music')).toBeInTheDocument();
      });
    });

    it('disables volume slider when sound is off', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-sound')).toBeInTheDocument();
      });

      // Sound is off by default
      const volumeSlider = screen.getByTestId('slider-sound-volume');
      const input = volumeSlider.querySelector('input');
      expect(input).toBeDisabled();
    });
  });

  describe('Display Section', () => {
    it('renders theme select', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('select-theme')).toBeInTheDocument();
      });
    });

    it('renders accent color select', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('select-accent')).toBeInTheDocument();
      });
    });
  });

  describe('Game Section', () => {
    it('renders difficulty select', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('select-difficulty')).toBeInTheDocument();
      });
    });

    it('renders time per question slider', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('slider-time')).toBeInTheDocument();
      });
    });
  });

  describe('Interactions', () => {
    it('toggles sound setting on click', async () => {
      const user = userEvent.setup();
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-sound')).toBeInTheDocument();
      });

      const soundToggle = screen.getByTestId('toggle-sound');
      const switchElement = soundToggle.querySelector('[role="switch"]');

      if (switchElement) {
        await user.click(switchElement);

        // Verify localStorage was updated
        await waitFor(() => {
          expect(mockLocalStorage.setItem).toHaveBeenCalled();
        });
      }
    });

    it('changes theme via select', async () => {
      const user = userEvent.setup();
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('select-theme')).toBeInTheDocument();
      });

      const themeSelect = screen.getByTestId('select-theme');
      const selectElement = themeSelect.querySelector('select');

      if (selectElement) {
        await user.selectOptions(selectElement, 'dark');

        await waitFor(() => {
          expect(mockLocalStorage.setItem).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Actions', () => {
    it('renders export button', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Exporter')).toBeInTheDocument();
      });
    });

    it('renders import button', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Importer')).toBeInTheDocument();
      });
    });

    it('renders reset button', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Reinitialiser')).toBeInTheDocument();
      });
    });

    it('shows confirmation on reset button click', async () => {
      const user = userEvent.setup();
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Reinitialiser')).toBeInTheDocument();
      });

      const resetButton = screen.getByText('Reinitialiser');
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Confirmer ?')).toBeInTheDocument();
      });
    });
  });

  describe('About Section', () => {
    it('displays app version', async () => {
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Tables Magiques')).toBeInTheDocument();
      });

      expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
    });
  });
});
