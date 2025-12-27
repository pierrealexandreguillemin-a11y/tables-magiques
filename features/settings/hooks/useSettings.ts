'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  UserSettings,
  StoredSettings,
  AccessibilitySettings,
  AudioSettings,
  DisplaySettings,
  GameSettings,
  NotificationSettings,
  PrivacySettings,
} from '@/types/settings';
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  SETTINGS_SCHEMA_VERSION,
} from '@/types/settings';

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

interface UseSettingsResult {
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
 * Merge settings with defaults (shallow per category)
 */
function mergeWithDefaults(partial: Partial<UserSettings>): UserSettings {
  return {
    accessibility: {
      ...DEFAULT_SETTINGS.accessibility,
      ...partial.accessibility,
    },
    audio: { ...DEFAULT_SETTINGS.audio, ...partial.audio },
    display: { ...DEFAULT_SETTINGS.display, ...partial.display },
    game: { ...DEFAULT_SETTINGS.game, ...partial.game },
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...partial.notifications,
    },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...partial.privacy },
  };
}

/**
 * Migrate settings from old schema version
 */
function migrateSettings(stored: StoredSettings): UserSettings {
  // Migration v0 -> v1: Add missing fields
  if (stored.version < 1) {
    return mergeWithDefaults(stored.settings);
  }

  // Future migrations go here
  return stored.settings;
}

/**
 * Type guard for StoredSettings
 */
function isStoredSettings(value: unknown): value is StoredSettings {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'version' in value &&
    typeof value.version === 'number' &&
    'settings' in value &&
    typeof value.settings === 'object' &&
    value.settings !== null &&
    'updatedAt' in value &&
    typeof value.updatedAt === 'string'
  );
}

/**
 * Load settings from localStorage
 */
function loadFromStorage(): StoredSettings | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredSettings(parsed)) {
      console.warn('[useSettings] Invalid stored settings format');
      return null;
    }
    return parsed;
  } catch {
    console.warn('[useSettings] Failed to load settings from localStorage');
    return null;
  }
}

/**
 * Save settings to localStorage
 */
function saveToStorage(settings: UserSettings): void {
  if (typeof window === 'undefined') return;

  try {
    const stored: StoredSettings = {
      version: SETTINGS_SCHEMA_VERSION,
      settings,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(stored));
  } catch (err) {
    console.error('[useSettings] Failed to save settings:', err);
  }
}

/**
 * Type guard for valid category
 */
function isSettingsCategory(key: string): key is keyof UserSettings {
  return [
    'accessibility',
    'audio',
    'display',
    'game',
    'notifications',
    'privacy',
  ].includes(key);
}

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

// =============================================================================
// HOOK
// =============================================================================

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load settings on mount
  useEffect(() => {
    try {
      const stored = loadFromStorage();

      if (stored) {
        // Migrate if needed
        const migrated =
          stored.version < SETTINGS_SCHEMA_VERSION
            ? migrateSettings(stored)
            : stored.settings;

        // Merge with defaults to ensure all fields exist
        const merged = mergeWithDefaults(migrated);
        setSettings(merged);
        setLastUpdated(new Date(stored.updatedAt));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load settings')
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update single setting by path
  const updateSetting = useCallback(<T>(path: SettingsPath, value: T) => {
    setSettings((prev) => {
      const updated = updateSettingByPath(prev, path, value);
      saveToStorage(updated);
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
        saveToStorage(updated);
        setLastUpdated(new Date());
        return updated;
      });
    },
    []
  );

  // Reset all settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveToStorage(DEFAULT_SETTINGS);
    setLastUpdated(new Date());
  }, []);

  // Reset single category
  const resetCategory = useCallback((category: keyof UserSettings) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [category]: DEFAULT_SETTINGS[category],
      };
      saveToStorage(updated);
      setLastUpdated(new Date());
      return updated;
    });
  }, []);

  // Export settings to JSON format
  const exportSettings = useCallback((): string => {
    const exported: StoredSettings = {
      version: SETTINGS_SCHEMA_VERSION,
      settings,
      updatedAt: new Date().toISOString(),
    };
    return JSON.stringify(exported, null, 2);
  }, [settings]);

  // Import settings from JSON
  const importSettings = useCallback((json: string): boolean => {
    try {
      const parsed: unknown = JSON.parse(json);

      // Validate structure with type guard
      if (!isStoredSettings(parsed)) {
        throw new Error('Invalid settings format');
      }

      // Migrate if needed
      const migrated =
        parsed.version < SETTINGS_SCHEMA_VERSION
          ? migrateSettings(parsed)
          : parsed.settings;

      // Merge with defaults
      const merged = mergeWithDefaults(migrated);
      setSettings(merged);
      saveToStorage(merged);
      setLastUpdated(new Date());

      return true;
    } catch (err) {
      console.error('[useSettings] Import failed:', err);
      return false;
    }
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
