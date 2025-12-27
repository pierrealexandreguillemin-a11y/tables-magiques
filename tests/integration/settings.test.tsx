/**
 * Tests d'integration Settings
 * ISO 29119 - Integration hook + composants + localStorage
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsPage } from '@/features/settings/components/SettingsPage';
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  SETTINGS_SCHEMA_VERSION,
} from '@/types/settings';
import type { StoredSettings } from '@/types/settings';

// =============================================================================
// MOCKS - Transport uniquement
// =============================================================================

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

global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// =============================================================================
// FIXTURES
// =============================================================================

const CUSTOM_SETTINGS_FIXTURE: StoredSettings = {
  version: SETTINGS_SCHEMA_VERSION,
  settings: {
    ...DEFAULT_SETTINGS,
    audio: { ...DEFAULT_SETTINGS.audio, soundEnabled: true },
    display: { ...DEFAULT_SETTINGS.display, theme: 'dark' },
    accessibility: { ...DEFAULT_SETTINGS.accessibility, reducedMotion: true },
  },
  updatedAt: new Date().toISOString(),
};

// =============================================================================
// TESTS
// =============================================================================

describe('Settings Integration', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  describe('Persistence', () => {
    it('persists theme change to localStorage', async () => {
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
          const stored = JSON.parse(
            mockLocalStorage.getItem(SETTINGS_STORAGE_KEY) || '{}'
          );
          expect(stored.settings.display.theme).toBe('dark');
        });
      }
    });

    it('persists sound toggle to localStorage', async () => {
      const user = userEvent.setup();
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-sound')).toBeInTheDocument();
      });

      const soundToggle = screen.getByTestId('toggle-sound');
      const switchElement = soundToggle.querySelector('[role="switch"]');

      if (switchElement) {
        await user.click(switchElement);

        await waitFor(() => {
          const stored = JSON.parse(
            mockLocalStorage.getItem(SETTINGS_STORAGE_KEY) || '{}'
          );
          expect(stored.settings.audio.soundEnabled).toBe(true);
        });
      }
    });

    it('persists volume slider change to localStorage', async () => {
      // First enable sound
      mockLocalStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          version: SETTINGS_SCHEMA_VERSION,
          settings: {
            ...DEFAULT_SETTINGS,
            audio: { ...DEFAULT_SETTINGS.audio, soundEnabled: true },
          },
          updatedAt: new Date().toISOString(),
        })
      );

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('slider-sound-volume')).toBeInTheDocument();
      });

      const volumeSlider = screen.getByTestId('slider-sound-volume');
      const input = volumeSlider.querySelector('input');

      if (input) {
        // Change volume
        fireEvent.change(input, { target: { value: '75' } });

        await waitFor(() => {
          const stored = JSON.parse(
            mockLocalStorage.getItem(SETTINGS_STORAGE_KEY) || '{}'
          );
          expect(stored.settings.audio.soundVolume).toBe(0.75);
        });
      }
    });
  });

  describe('Loading saved settings', () => {
    it('loads and displays saved theme', async () => {
      mockLocalStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(CUSTOM_SETTINGS_FIXTURE)
      );

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('select-theme')).toBeInTheDocument();
      });

      const themeSelect = screen.getByTestId('select-theme');
      const selectElement = themeSelect.querySelector('select');

      expect(selectElement).toHaveValue('dark');
    });

    it('loads and displays saved sound toggle state', async () => {
      mockLocalStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(CUSTOM_SETTINGS_FIXTURE)
      );

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-sound')).toBeInTheDocument();
      });

      const soundToggle = screen.getByTestId('toggle-sound');
      const switchElement = soundToggle.querySelector('[role="switch"]');

      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Reset functionality', () => {
    it('resets all settings to defaults on double-click reset', async () => {
      const user = userEvent.setup();

      // Start with custom settings
      mockLocalStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(CUSTOM_SETTINGS_FIXTURE)
      );

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Reinitialiser')).toBeInTheDocument();
      });

      // First click
      const resetButton = screen.getByText('Reinitialiser');
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Confirmer ?')).toBeInTheDocument();
      });

      // Second click to confirm
      const confirmButton = screen.getByText('Confirmer ?');
      await user.click(confirmButton);

      await waitFor(() => {
        const stored = JSON.parse(
          mockLocalStorage.getItem(SETTINGS_STORAGE_KEY) || '{}'
        );
        expect(stored.settings).toEqual(DEFAULT_SETTINGS);
      });
    });
  });

  describe('Cascading settings', () => {
    it('enables volume slider when sound is enabled', async () => {
      const user = userEvent.setup();
      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-sound')).toBeInTheDocument();
      });

      // Initially disabled
      const volumeSlider = screen.getByTestId('slider-sound-volume');
      let input = volumeSlider.querySelector('input');
      expect(input).toBeDisabled();

      // Enable sound
      const soundToggle = screen.getByTestId('toggle-sound');
      const switchElement = soundToggle.querySelector('[role="switch"]');

      if (switchElement) {
        await user.click(switchElement);

        await waitFor(() => {
          input = volumeSlider.querySelector('input');
          expect(input).not.toBeDisabled();
        });
      }
    });
  });
});
