/**
 * Types Effects - Tables Magiques
 * ISO/IEC 25010 - Maintenabilite (typage strict)
 *
 * SOURCE UNIQUE DE VERITE pour tous les types d'animation
 */

/**
 * Variantes de theme disponibles
 */
export type ThemeVariant = 'princess' | 'unicorn' | 'star' | 'rainbow';

/**
 * Etats possibles d'une animation
 */
export type AnimationState =
  | 'idle'
  | 'entering'
  | 'active'
  | 'exiting'
  | 'disabled';

/**
 * Types d'easing disponibles
 */
export type EasingType = 'bounce' | 'spring' | 'smooth' | 'elastic';

/**
 * Configuration d'un effet visuel
 */
export interface EffectConfig {
  /** Duree en ms (100-800ms pour enfants) */
  readonly duration: number;
  /** Fonction easing */
  readonly easing: EasingType;
  /** Delai avant demarrage en ms */
  readonly delay?: number;
  /** Nombre repetitions (-1 = infini) */
  readonly repeat?: number;
}

/**
 * Configuration des particules (confetti, etoiles)
 */
export interface ParticleConfig {
  /** Nombre de particules */
  readonly count: number;
  /** Couleurs des particules */
  readonly colors: readonly string[];
  /** Dispersion en pixels */
  readonly spread: number;
  /** Gravite (0 = flotte, 1 = tombe vite) */
  readonly gravity: number;
  /** Duree de vie en ms */
  readonly duration: number;
}

/**
 * Presets confetti predefinies
 */
export const CONFETTI_PRESETS = {
  small: {
    count: 20,
    colors: ['#ffb6d9', '#dda0dd', '#ffd700'],
    spread: 50,
    gravity: 0.8,
    duration: 800,
  },
  medium: {
    count: 40,
    colors: ['#ffb6d9', '#dda0dd', '#87ceeb', '#ffd700'],
    spread: 100,
    gravity: 0.6,
    duration: 1200,
  },
  large: {
    count: 80,
    colors: ['#ffb6d9', '#dda0dd', '#87ceeb', '#ffd700', '#b4e7ce'],
    spread: 150,
    gravity: 0.4,
    duration: 1500,
  },
} as const satisfies Record<string, ParticleConfig>;

/**
 * Type pour les cles de presets confetti
 */
export type ConfettiPresetKey = keyof typeof CONFETTI_PRESETS;

/**
 * Tokens timing adaptes enfants
 * (plus lent que adultes pour perception)
 */
export const TIMING = {
  /** Feedback immediat */
  instant: 100,
  /** Micro-interactions */
  fast: 200,
  /** Transitions standard */
  normal: 400,
  /** Animations victoire */
  celebration: 800,
  /** Effets "wow" */
  dramatic: 1200,
} as const;

/**
 * Type pour les cles de timing
 */
export type TimingKey = keyof typeof TIMING;

/**
 * Easing CSS values
 */
export const EASING = {
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
} as const satisfies Record<EasingType, string>;

/**
 * Props communes pour composants animes
 */
export interface AnimatedComponentProps {
  /** Classe CSS additionnelle */
  className?: string;
  /** Variante de theme */
  variant?: ThemeVariant;
  /** Desactiver les animations */
  disableAnimation?: boolean;
}

/**
 * Resultat du hook useReducedMotion
 */
export interface ReducedMotionResult {
  /** true si l'utilisateur prefere moins de mouvement */
  prefersReducedMotion: boolean;
  /** true si on doit animer (inverse de prefersReducedMotion) */
  shouldAnimate: boolean;
}
