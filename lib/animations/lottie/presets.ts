/**
 * Lottie Presets - Tables Magiques
 * ISO/IEC 25010 - Configurations par contexte
 */

import type { LottieAnimationId } from './animations';

// =============================================================================
// TYPES
// =============================================================================

export interface LottiePreset {
  /** ID de l'animation */
  animationId: LottieAnimationId;
  /** Taille en pixels */
  size: number;
  /** Jouer en boucle */
  loop: boolean;
  /** Lecture automatique */
  autoplay: boolean;
  /** Duree estimee en ms (pour callbacks) */
  duration: number;
}

export type PresetContext =
  | 'correct-answer'
  | 'wrong-answer'
  | 'streak-3'
  | 'streak-5'
  | 'streak-10'
  | 'level-complete'
  | 'perfect-score'
  | 'badge-unlock'
  | 'loading'
  | 'idle';

// =============================================================================
// PRESETS PAR CONTEXTE
// =============================================================================

/**
 * Presets d'animation par contexte d'utilisation
 */
export const LOTTIE_PRESETS: Record<PresetContext, LottiePreset> = {
  'correct-answer': {
    animationId: 'success',
    size: 120,
    loop: false,
    autoplay: true,
    duration: 1500,
  },
  'wrong-answer': {
    animationId: 'error',
    size: 100,
    loop: false,
    autoplay: true,
    duration: 1200,
  },
  'streak-3': {
    animationId: 'sparkles',
    size: 80,
    loop: false,
    autoplay: true,
    duration: 1000,
  },
  'streak-5': {
    animationId: 'streak',
    size: 100,
    loop: false,
    autoplay: true,
    duration: 1500,
  },
  'streak-10': {
    animationId: 'fireworks',
    size: 150,
    loop: false,
    autoplay: true,
    duration: 2000,
  },
  'level-complete': {
    animationId: 'celebration',
    size: 150,
    loop: false,
    autoplay: true,
    duration: 2500,
  },
  'perfect-score': {
    animationId: 'crown',
    size: 180,
    loop: false,
    autoplay: true,
    duration: 2000,
  },
  'badge-unlock': {
    animationId: 'celebration',
    size: 120,
    loop: false,
    autoplay: true,
    duration: 2000,
  },
  loading: {
    animationId: 'loading',
    size: 80,
    loop: true,
    autoplay: true,
    duration: 0, // infini
  },
  idle: {
    animationId: 'sparkles',
    size: 60,
    loop: true,
    autoplay: true,
    duration: 0, // infini
  },
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Obtenir un preset par contexte
 */
export function getPreset(context: PresetContext): LottiePreset {
  return LOTTIE_PRESETS[context];
}

/**
 * Obtenir le preset pour une serie
 */
export function getStreakPreset(streak: number): LottiePreset {
  if (streak >= 10) return LOTTIE_PRESETS['streak-10'];
  if (streak >= 5) return LOTTIE_PRESETS['streak-5'];
  if (streak >= 3) return LOTTIE_PRESETS['streak-3'];
  return LOTTIE_PRESETS['correct-answer'];
}

/**
 * Obtenir le preset pour un score
 */
export function getScorePreset(score: number, total: number): LottiePreset {
  const accuracy = score / total;
  if (accuracy === 1) return LOTTIE_PRESETS['perfect-score'];
  if (accuracy >= 0.8) return LOTTIE_PRESETS['level-complete'];
  return LOTTIE_PRESETS['level-complete'];
}
