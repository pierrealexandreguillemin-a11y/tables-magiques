/**
 * Types - Sound System
 * ISO/IEC 25010 - Audio feedback pour enfants
 */

/**
 * Types de sons disponibles
 */
export type SoundType = 'correct' | 'incorrect' | 'levelUp' | 'click' | 'badge';

/**
 * Configuration d'un son
 */
export interface SoundConfig {
  /** Chemin du fichier audio */
  src: string;
  /** Volume par défaut (0-1) */
  volume: number;
  /** Durée approximative en ms */
  duration: number;
}

/**
 * État du système audio
 */
export interface SoundState {
  /** Son activé/désactivé */
  enabled: boolean;
  /** Volume global (0-1) */
  volume: number;
  /** Reduced motion respecté */
  reducedMotion: boolean;
}

/**
 * Catalogue des sons
 */
export const SOUND_CATALOG: Record<SoundType, SoundConfig> = {
  correct: {
    src: '/sounds/magic-ding.mp3',
    volume: 0.5,
    duration: 500,
  },
  incorrect: {
    src: '/sounds/soft-oops.mp3',
    volume: 0.4,
    duration: 400,
  },
  levelUp: {
    src: '/sounds/level-up.mp3',
    volume: 0.6,
    duration: 1000,
  },
  click: {
    src: '/sounds/click.mp3',
    volume: 0.3,
    duration: 100,
  },
  badge: {
    src: '/sounds/badge-unlock.mp3',
    volume: 0.6,
    duration: 800,
  },
};

/**
 * Clé localStorage pour persistance
 */
export const SOUND_STORAGE_KEY = 'tm_sound_settings';

/**
 * Paramètres par défaut
 */
export const DEFAULT_SOUND_STATE: SoundState = {
  enabled: false, // Son OFF par défaut (respectueux)
  volume: 0.5, // 50% volume
  reducedMotion: false,
};
