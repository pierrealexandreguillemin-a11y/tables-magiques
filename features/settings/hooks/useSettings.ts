'use client';

/**
 * useSettings Hook - Tables Magiques
 * ISO/IEC 25010 - Hook logique métier
 *
 * Responsabilité unique: état React des settings
 * Délègue la persistance à api/settingsStorage.ts
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  UserSettings,
  AccessibilitySettings,
  AudioSettings,
  DisplaySettings,
  GameSettings,
  NotificationSettings,
  PrivacySettings,
} from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import {
  loadSettings,
  saveSettings,
  exportSettingsToJson,
  importSettingsFromJson,
  isSettingsCategory,
  getInitialSettings,
} from '../api/settingsStorage';

// =============================================================================
// TYPES
// =============================================================================

type SettingsPath =
  | `accessibility.${keyof AccessibilitySettings}`
  | `audio.${keyof AudioSettings}`
  | `display.${keyof DisplaySettings}`
  | `game.${keyof GameSettings}`
  | `notifications.${keyof NotificationSettings}`
  | `privacy.${keyof PrivacySettings}`;

export interface UseSettingsResult {
  /** Current settings */
  settings: UserSettings;
  /** Loading state */
  isLoading: boolean;
  /** Error if present */
  error: Error | null;
  /** Update a single setting by path */
  updateSetting: <T>(path: SettingsPath, value: T) => void;
  /** Update entire category */
  updateCategory: <K extends keyof UserSettings>(
    category: K,
    values: Partial<UserSettings[K]>
  ) => void;
  /** Reset to defaults */
  resetSettings: () => void;
  /** Reset single category */
  resetCategory: (category: keyof UserSettings) => void;
  /** Export settings to JSON format */
  exportSettings: () => string;
  /** Import settings from JSON */
  importSettings: (json: string) => boolean;
  /** Last update timestamp */
  lastUpdated: Date | null;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Update nested setting by path (type-safe)
 */
function updateSettingByPath<T>(
  settings: UserSettings,
  path: SettingsPath,
  value: T
): UserSettings {
  const parts = path.split('.');
  const category = parts[0];
  const key = parts[1];

  if (!category || !key || !isSettingsCategory(category)) {
    return settings;
  }

  return {
    ...settings,
    [category]: {
      ...settings[category],
      [key]: value,
    },
  };
}

/**
 * Get initial last updated date
 */
function getInitialLastUpdated(): Date | null {
  if (typeof window === 'undefined') return null;
  const stored = loadSettings();
  return stored ? new Date(stored.updatedAt) : null;
}

// =============================================================================
// HOOK
// =============================================================================

export function useSettings(): UseSettingsResult {
  // Lazy initialization from storage
  const [settings, setSettings] = useState<UserSettings>(getInitialSettings);
  const [isLoading] = useState(false); // Sync init, no async loading
  const [error] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    getInitialLastUpdated
  );

  // Update single setting by path
  const updateSetting = useCallback(<T>(path: SettingsPath, value: T) => {
    setSettings((prev) => {
      const updated = updateSettingByPath(prev, path, value);
      saveSettings(updated);
      setLastUpdated(new Date());
      return updated;
    });
  }, []);

  // Update entire category
  const updateCategory = useCallback(
    <K extends keyof UserSettings>(
      category: K,
      values: Partial<UserSettings[K]>
    ) => {
      setSettings((prev) => {
        const updated = {
          ...prev,
          [category]: { ...prev[category], ...values },
        };
        saveSettings(updated);
        setLastUpdated(new Date());
        return updated;
      });
    },
    []
  );

  // Reset all settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    setLastUpdated(new Date());
  }, []);

  // Reset single category
  const resetCategory = useCallback((category: keyof UserSettings) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [category]: DEFAULT_SETTINGS[category],
      };
      saveSettings(updated);
      setLastUpdated(new Date());
      return updated;
    });
  }, []);

  // Export settings to JSON format
  const exportSettings = useCallback((): string => {
    return exportSettingsToJson(settings);
  }, [settings]);

  // Import settings from JSON
  const importSettings = useCallback((json: string): boolean => {
    const imported = importSettingsFromJson(json);
    if (!imported) {
      console.error('[useSettings] Import failed: invalid format');
      return false;
    }

    setSettings(imported);
    saveSettings(imported);
    setLastUpdated(new Date());
    return true;
  }, []);

  return useMemo(
    () => ({
      settings,
      isLoading,
      error,
      updateSetting,
      updateCategory,
      resetSettings,
      resetCategory,
      exportSettings,
      importSettings,
      lastUpdated,
    }),
    [
      settings,
      isLoading,
      error,
      updateSetting,
      updateCategory,
      resetSettings,
      resetCategory,
      exportSettings,
      importSettings,
      lastUpdated,
    ]
  );
}
