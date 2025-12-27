/**
 * Types Settings - Tables Magiques
 * ISO/IEC 25010 - Configuration utilisateur
 *
 * Standards:
 * - WCAG 2.1 AA (accessibilite)
 * - COPPA (protection enfants)
 * - GDPR-K (consentement parental)
 */

// =============================================================================
// ACCESSIBILITY SETTINGS
// =============================================================================

/**
 * Parametres d'accessibilite
 */
export interface AccessibilitySettings {
  /** Reduire les animations (prefers-reduced-motion) */
  reducedMotion: boolean;
  /** Mode contraste eleve */
  highContrast: boolean;
  /** Police agrandie (1.0 = normal, 1.5 = 150%) */
  textScale: number;
  /** Optimise pour lecteur d'ecran */
  screenReaderOptimized: boolean;
}

/**
 * Valeurs par defaut accessibilite
 */
export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  reducedMotion: false, // Detecte automatiquement via prefers-reduced-motion
  highContrast: false,
  textScale: 1.0,
  screenReaderOptimized: false,
};

// =============================================================================
// AUDIO SETTINGS
// =============================================================================

/**
 * Parametres audio
 */
export interface AudioSettings {
  /** Sons d'interface actives */
  soundEnabled: boolean;
  /** Volume sons (0-1) */
  soundVolume: number;
  /** Musique de fond activee */
  musicEnabled: boolean;
  /** Volume musique (0-1) */
  musicVolume: number;
}

/**
 * Valeurs par defaut audio
 */
export const DEFAULT_AUDIO: AudioSettings = {
  soundEnabled: false, // OFF par defaut (respectueux)
  soundVolume: 0.5,
  musicEnabled: false,
  musicVolume: 0.3,
};

// =============================================================================
// DISPLAY SETTINGS
// =============================================================================

/**
 * Theme d'affichage
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Couleur d'accent
 */
export type AccentColor =
  | 'pink'
  | 'purple'
  | 'blue'
  | 'green'
  | 'orange'
  | 'rainbow';

/**
 * Parametres d'affichage
 */
export interface DisplaySettings {
  /** Theme clair/sombre/auto */
  theme: ThemeMode;
  /** Couleur d'accent */
  accentColor: AccentColor;
  /** Densite interface (compact/normal/comfortable) */
  density: 'compact' | 'normal' | 'comfortable';
}

/**
 * Valeurs par defaut affichage
 */
export const DEFAULT_DISPLAY: DisplaySettings = {
  theme: 'system',
  accentColor: 'pink',
  density: 'normal',
};

// =============================================================================
// GAME SETTINGS
// =============================================================================

/**
 * Niveau de difficulte
 */
export type DifficultyLevel = 'easy' | 'normal' | 'hard';

/**
 * Parametres de jeu
 */
export interface GameSettings {
  /** Niveau de difficulte */
  difficulty: DifficultyLevel;
  /** Temps par question en secondes (mode challenge) */
  timePerQuestion: number;
  /** Nombre de questions par session */
  questionsPerSession: number;
  /** Tables favorites (1-10) */
  favoriteTables: number[];
  /** Afficher indices */
  showHints: boolean;
}

/**
 * Valeurs par defaut jeu
 */
export const DEFAULT_GAME: GameSettings = {
  difficulty: 'normal',
  timePerQuestion: 10,
  questionsPerSession: 10,
  favoriteTables: [],
  showHints: true,
};

// =============================================================================
// NOTIFICATION SETTINGS
// =============================================================================

/**
 * Parametres notifications
 */
export interface NotificationSettings {
  /** Rappels quotidiens */
  dailyReminders: boolean;
  /** Heure rappel (format HH:MM) */
  reminderTime: string;
  /** Notification badges debloques */
  badgeUnlockNotifications: boolean;
  /** Notifications nouveautes app */
  appUpdatesNotifications: boolean;
}

/**
 * Valeurs par defaut notifications
 */
export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  dailyReminders: false,
  reminderTime: '17:00',
  badgeUnlockNotifications: true,
  appUpdatesNotifications: false,
};

// =============================================================================
// PRIVACY SETTINGS
// =============================================================================

/**
 * Parametres confidentialite (COPPA/GDPR-K)
 */
export interface PrivacySettings {
  /** Consentement parental obtenu */
  parentalConsent: boolean;
  /** Date consentement */
  consentDate: string | null;
  /** Collecte analytics */
  analyticsEnabled: boolean;
  /** Partage progression */
  shareProgress: boolean;
}

/**
 * Valeurs par defaut confidentialite
 */
export const DEFAULT_PRIVACY: PrivacySettings = {
  parentalConsent: false,
  consentDate: null,
  analyticsEnabled: false,
  shareProgress: false,
};

// =============================================================================
// COMBINED SETTINGS
// =============================================================================

/**
 * Toutes les settings combinees
 */
export interface UserSettings {
  accessibility: AccessibilitySettings;
  audio: AudioSettings;
  display: DisplaySettings;
  game: GameSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

/**
 * Valeurs par defaut completes
 */
export const DEFAULT_SETTINGS: UserSettings = {
  accessibility: DEFAULT_ACCESSIBILITY,
  audio: DEFAULT_AUDIO,
  display: DEFAULT_DISPLAY,
  game: DEFAULT_GAME,
  notifications: DEFAULT_NOTIFICATIONS,
  privacy: DEFAULT_PRIVACY,
};

// =============================================================================
// SETTINGS CATEGORIES
// =============================================================================

/**
 * Categories de settings pour UI
 */
export type SettingsCategory =
  | 'accessibility'
  | 'audio'
  | 'display'
  | 'game'
  | 'notifications'
  | 'privacy'
  | 'about';

/**
 * Metadata categorie
 */
export interface SettingsCategoryMeta {
  id: SettingsCategory;
  label: string;
  description: string;
  icon: string;
}

/**
 * Liste des categories
 */
export const SETTINGS_CATEGORIES: SettingsCategoryMeta[] = [
  {
    id: 'accessibility',
    label: 'Accessibilite',
    description: 'Animations, contraste, taille du texte',
    icon: 'accessibility',
  },
  {
    id: 'audio',
    label: 'Audio',
    description: 'Sons et musique',
    icon: 'volume-2',
  },
  {
    id: 'display',
    label: 'Affichage',
    description: 'Theme, couleurs, densite',
    icon: 'palette',
  },
  {
    id: 'game',
    label: 'Jeu',
    description: 'Difficulte, temps, questions',
    icon: 'gamepad-2',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Rappels et alertes',
    icon: 'bell',
  },
  {
    id: 'privacy',
    label: 'Confidentialite',
    description: 'Donnees et consentement',
    icon: 'shield',
  },
  {
    id: 'about',
    label: 'A propos',
    description: 'Version, licences, aide',
    icon: 'info',
  },
];

// =============================================================================
// STORAGE
// =============================================================================

/**
 * Cle localStorage pour settings
 */
export const SETTINGS_STORAGE_KEY = 'tables-magiques-settings';

/**
 * Version schema settings (pour migrations)
 */
export const SETTINGS_SCHEMA_VERSION = 1;

/**
 * Settings stockees avec metadata
 */
export interface StoredSettings {
  version: number;
  settings: UserSettings;
  updatedAt: string;
}
