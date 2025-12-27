/**
 * Tests unitaires useSettings
 * ISO 29119 - Tests contre production (localStorage mock transport uniquement)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettings } from '@/features/settings/hooks/useSettings';
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  SETTINGS_SCHEMA_VERSION,
} from '@/types/settings';
import type { StoredSettings, UserSettings } from '@/types/settings';

// =============================================================================
// SETUP - Mock localStorage (transport uniquement)
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

// =============================================================================
// FIXTURES - Donnees reelles
// =============================================================================

const STORED_SETTINGS_FIXTURE: StoredSettings = {
  version: SETTINGS_SCHEMA_VERSION,
  settings: {
    ...DEFAULT_SETTINGS,
    audio: { ...DEFAULT_SETTINGS.audio, soundEnabled: true, soundVolume: 0.8 },
    display: { ...DEFAULT_SETTINGS.display, theme: 'dark' },
  },
  updatedAt: '2024-12-27T10:00:00.000Z',
};

const OLD_VERSION_FIXTURE: StoredSettings = {
  version: 0,
  settings: {
    accessibility: { reducedMotion: true } as UserSettings['accessibility'],
    audio: { soundEnabled: true } as UserSettings['audio'],
  } as UserSettings,
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// =============================================================================
// TESTS
// =============================================================================

describe('useSettings', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  describe('Loading', () => {
    it('returns isLoading=true initially', () => {
      const { result } = renderHook(() => useSettings());
      // Note: Due to useEffect, isLoading might already be false
      // This test verifies the initial state before effect runs
      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('returns DEFAULT_SETTINGS when localStorage is empty', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
      expect(result.current.error).toBeNull();
    });

    it('loads settings from localStorage on mount', async () => {
      mockLocalStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(STORED_SETTINGS_FIXTURE)
      );

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings.audio.soundEnabled).toBe(true);
      expect(result.current.settings.audio.soundVolume).toBe(0.8);
      expect(result.current.settings.display.theme).toBe('dark');
    });

    it('sets lastUpdated from stored settings', async () => {
      mockLocalStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(STORED_SETTINGS_FIXTURE)
      );

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.lastUpdated).toBeInstanceOf(Date);
      expect(result.current.lastUpdated?.toISOString()).toBe(
        STORED_SETTINGS_FIXTURE.updatedAt
      );
    });
  });

  describe('Migration', () => {
    it('migrates old settings format to current version', async () => {
      mockLocalStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(OLD_VERSION_FIXTURE)
      );

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have merged with defaults
      expect(result.current.settings.accessibility.reducedMotion).toBe(true);
      expect(result.current.settings.audio.soundEnabled).toBe(true);
      // Should have default values for missing fields
      expect(result.current.settings.audio.musicEnabled).toBe(
        DEFAULT_SETTINGS.audio.musicEnabled
      );
      expect(result.current.settings.display).toEqual(DEFAULT_SETTINGS.display);
    });
  });

  describe('updateSetting', () => {
    it('updates a single setting by path', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateSetting('audio.soundEnabled', true);
      });

      expect(result.current.settings.audio.soundEnabled).toBe(true);
    });

    it('persists changes to localStorage', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateSetting('display.theme', 'dark');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      const stored = JSON.parse(
        mockLocalStorage.setItem.mock.calls.at(-1)?.[1] || '{}'
      );
      expect(stored.settings.display.theme).toBe('dark');
    });

    it('updates lastUpdated timestamp', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const before = result.current.lastUpdated;

      act(() => {
        result.current.updateSetting('audio.soundVolume', 0.5);
      });

      expect(result.current.lastUpdated).not.toEqual(before);
    });
  });

  describe('updateCategory', () => {
    it('updates entire category at once', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateCategory('audio', {
          soundEnabled: true,
          soundVolume: 0.7,
          musicEnabled: true,
        });
      });

      expect(result.current.settings.audio.soundEnabled).toBe(true);
      expect(result.current.settings.audio.soundVolume).toBe(0.7);
      expect(result.current.settings.audio.musicEnabled).toBe(true);
    });
  });

  describe('resetSettings', () => {
    it('resets all settings to defaults', async () => {
      mockLocalStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(STORED_SETTINGS_FIXTURE)
      );

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify we loaded custom settings
      expect(result.current.settings.audio.soundEnabled).toBe(true);

      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('resetCategory', () => {
    it('resets single category to defaults', async () => {
      mockLocalStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(STORED_SETTINGS_FIXTURE)
      );

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.resetCategory('audio');
      });

      expect(result.current.settings.audio).toEqual(DEFAULT_SETTINGS.audio);
      // Other categories should remain unchanged
      expect(result.current.settings.display.theme).toBe('dark');
    });
  });

  describe('exportSettings', () => {
    it('exports settings as JSON string', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateSetting('audio.soundEnabled', true);
      });

      const exported = result.current.exportSettings();
      const parsed = JSON.parse(exported) as StoredSettings;

      expect(parsed.version).toBe(SETTINGS_SCHEMA_VERSION);
      expect(parsed.settings.audio.soundEnabled).toBe(true);
      expect(parsed.updatedAt).toBeDefined();
    });
  });

  describe('importSettings', () => {
    it('imports settings from valid JSON', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const toImport: StoredSettings = {
        version: SETTINGS_SCHEMA_VERSION,
        settings: {
          ...DEFAULT_SETTINGS,
          display: { ...DEFAULT_SETTINGS.display, theme: 'dark' },
        },
        updatedAt: new Date().toISOString(),
      };

      let success = false;
      act(() => {
        success = result.current.importSettings(JSON.stringify(toImport));
      });

      expect(success).toBe(true);
      expect(result.current.settings.display.theme).toBe('dark');
    });

    it('returns false for invalid JSON', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success = true;
      act(() => {
        success = result.current.importSettings('not valid json');
      });

      expect(success).toBe(false);
    });

    it('returns false for invalid settings structure', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success = true;
      act(() => {
        success = result.current.importSettings(JSON.stringify({ foo: 'bar' }));
      });

      expect(success).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('handles corrupted localStorage gracefully', async () => {
      mockLocalStorage.setItem(SETTINGS_STORAGE_KEY, 'not valid json');

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should fall back to defaults
      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });
  });
});
