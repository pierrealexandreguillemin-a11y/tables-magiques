/**
 * Settings Storage API - Tables Magiques
 * ISO/IEC 25010 - Separation of Concerns
 *
 * Module de persistance localStorage pour les settings
 * Responsabilité unique: lecture/écriture/validation storage
 */

import type { UserSettings, StoredSettings } from '@/types/settings';
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  SETTINGS_SCHEMA_VERSION,
} from '@/types/settings';

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for StoredSettings
 */
export function isStoredSettings(value: unknown): value is StoredSettings {
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
 * Type guard for valid category
 */
export function isSettingsCategory(key: string): key is keyof UserSettings {
  return [
    'accessibility',
    'audio',
    'display',
    'game',
    'notifications',
    'privacy',
  ].includes(key);
}

// =============================================================================
// MERGE & MIGRATION
// =============================================================================

/**
 * Merge settings with defaults (shallow per category)
 */
export function mergeWithDefaults(
  partial: Partial<UserSettings>
): UserSettings {
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
export function migrateSettings(stored: StoredSettings): UserSettings {
  // Migration v0 -> v1: Add missing fields
  if (stored.version < 1) {
    return mergeWithDefaults(stored.settings);
  }

  // Future migrations go here
  return stored.settings;
}

// =============================================================================
// STORAGE OPERATIONS
// =============================================================================

/**
 * Load settings from localStorage
 * @returns StoredSettings or null if not found/invalid
 */
export function loadSettings(): StoredSettings | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredSettings(parsed)) {
      console.warn('[settingsStorage] Invalid stored settings format');
      return null;
    }
    return parsed;
  } catch {
    console.warn('[settingsStorage] Failed to load settings from localStorage');
    return null;
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;

  try {
    const stored: StoredSettings = {
      version: SETTINGS_SCHEMA_VERSION,
      settings,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(stored));
  } catch (err) {
    console.error('[settingsStorage] Failed to save settings:', err);
  }
}

/**
 * Clear settings from localStorage
 */
export function clearSettings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
}

/**
 * Export settings to JSON string
 */
export function exportSettingsToJson(settings: UserSettings): string {
  const exported: StoredSettings = {
    version: SETTINGS_SCHEMA_VERSION,
    settings,
    updatedAt: new Date().toISOString(),
  };
  return JSON.stringify(exported, null, 2);
}

/**
 * Import settings from JSON string
 * @returns UserSettings or null if invalid
 */
export function importSettingsFromJson(json: string): UserSettings | null {
  try {
    const parsed: unknown = JSON.parse(json);

    if (!isStoredSettings(parsed)) {
      return null;
    }

    // Migrate if needed
    const migrated =
      parsed.version < SETTINGS_SCHEMA_VERSION
        ? migrateSettings(parsed)
        : parsed.settings;

    // Merge with defaults
    return mergeWithDefaults(migrated);
  } catch {
    return null;
  }
}

/**
 * Get initial settings (for lazy initialization)
 * SSR-safe: returns defaults on server, loaded settings on client
 */
export function getInitialSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  const stored = loadSettings();
  if (!stored) return DEFAULT_SETTINGS;

  const migrated =
    stored.version < SETTINGS_SCHEMA_VERSION
      ? migrateSettings(stored)
      : stored.settings;

  return mergeWithDefaults(migrated);
}
