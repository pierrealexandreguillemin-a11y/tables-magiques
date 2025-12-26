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

// ============================================================================
// GSAP EFFECTS - Types ISO/IEC 25010
// ============================================================================

/**
 * Types d'effets GSAP disponibles
 */
export type GsapEffectType =
  | 'confetti'
  | 'fireworks'
  | 'shake'
  | 'badgeUnlock'
  | 'timerPulse'
  | 'staggerReveal'
  | 'pageTransition'
  | 'numberWave'
  | 'celebrationCascade'
  | 'glowPulse'
  | 'scoreAnimate'
  | 'magneticHover';

/**
 * Configuration confetti GSAP
 */
export interface GsapConfettiConfig {
  /** Nombre de particules (defaut: 50) */
  count?: number;
  /** Couleurs des particules */
  colors?: string[];
}

/**
 * Configuration fireworks GSAP
 */
export interface GsapFireworksConfig {
  /** Nombre de feux d'artifice */
  burstCount?: number;
  /** Delai entre chaque burst en ms */
  burstDelay?: number;
}

/**
 * Configuration shake GSAP
 */
export interface GsapShakeConfig {
  /** Intensite du shake en pixels */
  intensity?: number;
  /** Nombre d'oscillations */
  oscillations?: number;
}

/**
 * Configuration score animation GSAP
 */
export interface GsapScoreConfig {
  /** Valeur de depart */
  from: number;
  /** Valeur d'arrivee */
  to: number;
  /** Duree en secondes */
  duration?: number;
}

/**
 * Configuration glow pulse GSAP
 */
export interface GsapGlowConfig {
  /** Couleur du glow */
  color?: string;
  /** Intensite (taille du glow en px) */
  intensity?: number;
}

/**
 * Configuration timer pulse GSAP
 */
export interface GsapTimerPulseConfig {
  /** Couleur d'alerte */
  alertColor?: string;
  /** Echelle du pulse */
  scale?: number;
}

/**
 * Options de cleanup pour effets GSAP
 */
export interface GsapCleanupFunction {
  (): void;
}

/**
 * Resultat d'un effet GSAP
 */
export interface GsapEffectResult {
  /** Fonction de nettoyage (kill animation) */
  cleanup: GsapCleanupFunction;
  /** Timeline GSAP si applicable */
  timeline?: gsap.core.Timeline;
}

/**
 * Hook result pour useGsapEffects
 */
export interface UseGsapEffectsResult {
  /** Lance une explosion de confetti */
  confettiExplosion: (
    container: HTMLElement,
    config?: GsapConfettiConfig
  ) => void;
  /** Lance un feu d'artifice */
  fireworksDisplay: (container: HTMLElement) => void;
  /** Shake doux pour erreur */
  shakeError: (element: HTMLElement) => void;
  /** Animation deblocage badge */
  badgeUnlock: (element: HTMLElement) => void;
  /** Pulse pour timer critique */
  timerPulse: (element: HTMLElement) => GsapCleanupFunction;
  /** Reveal progressif d'elements */
  staggerReveal: (elements: HTMLElement[] | NodeListOf<Element>) => void;
  /** Transition de page */
  pageTransition: {
    enter: (element: HTMLElement) => void;
    exit: (element: HTMLElement, onComplete: () => void) => void;
  };
  /** Vague d'animation pour clavier */
  numberWave: (elements: HTMLElement[] | NodeListOf<Element>) => void;
  /** Cascade de celebration */
  celebrationCascade: (container: HTMLElement) => void;
  /** Glow pulsant */
  glowPulse: (
    element: HTMLElement,
    config?: GsapGlowConfig
  ) => GsapCleanupFunction;
  /** Animation de score */
  animateScore: (element: HTMLElement, config: GsapScoreConfig) => void;
  /** Effet magnetique hover */
  magneticHover: (element: HTMLElement) => GsapCleanupFunction;
  /** Si les effets sont disponibles */
  isReady: boolean;
}
