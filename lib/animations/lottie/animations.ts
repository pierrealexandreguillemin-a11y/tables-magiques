/**
 * Lottie Animations - Tables Magiques
 * ISO/IEC 25010 - Import centralise des animations
 *
 * Fichiers JSON dans lib/lottie/
 */

// =============================================================================
// IMPORTS ANIMATIONS JSON
// =============================================================================

import successCheck from '@/lib/lottie/success-check.json';
import magicWand from '@/lib/lottie/magic-wand.json';
import confetti from '@/lib/lottie/confetti.json';
import loadingStars from '@/lib/lottie/loading-stars.json';
import fireworks from '@/lib/lottie/fireworks.json';
import starFavorite from '@/lib/lottie/star-favorite.json';
import thumbsUp from '@/lib/lottie/thumbs-up.json';
import unicorn from '@/lib/lottie/unicorn.json';

// =============================================================================
// TYPES
// =============================================================================

export type LottieAnimationId =
  | 'success'
  | 'error'
  | 'loading'
  | 'celebration'
  | 'streak'
  | 'crown'
  | 'sparkles'
  | 'magic-wand'
  | 'fireworks'
  | 'thumbs-up'
  | 'unicorn';

export interface LottieAnimationData {
  /** Animation JSON data */
  data: object;
  /** Default loop setting */
  loop: boolean;
  /** Default autoplay setting */
  autoplay: boolean;
  /** Emoji fallback for reduced motion */
  fallbackEmoji: string;
  /** Description for accessibility */
  description: string;
}

// =============================================================================
// ANIMATION REGISTRY
// =============================================================================

/**
 * Registry de toutes les animations Lottie
 * Source unique de verite
 */
export const LOTTIE_ANIMATIONS: Record<LottieAnimationId, LottieAnimationData> =
  {
    success: {
      data: successCheck,
      loop: false,
      autoplay: true,
      fallbackEmoji: '✅',
      description: 'Animation de succes',
    },
    error: {
      data: thumbsUp,
      loop: false,
      autoplay: true,
      fallbackEmoji: '💭',
      description: 'Animation encouragement erreur',
    },
    loading: {
      data: magicWand,
      loop: true,
      autoplay: true,
      fallbackEmoji: '✨',
      description: 'Animation de chargement',
    },
    celebration: {
      data: confetti,
      loop: false,
      autoplay: true,
      fallbackEmoji: '🎉',
      description: 'Animation celebration',
    },
    streak: {
      data: fireworks,
      loop: false,
      autoplay: true,
      fallbackEmoji: '🔥',
      description: 'Animation serie reussie',
    },
    crown: {
      data: starFavorite,
      loop: false,
      autoplay: true,
      fallbackEmoji: '👑',
      description: 'Animation couronne victoire',
    },
    sparkles: {
      data: loadingStars,
      loop: true,
      autoplay: true,
      fallbackEmoji: '✨',
      description: 'Animation paillettes',
    },
    'magic-wand': {
      data: magicWand,
      loop: true,
      autoplay: true,
      fallbackEmoji: '🪄',
      description: 'Animation baguette magique',
    },
    fireworks: {
      data: fireworks,
      loop: false,
      autoplay: true,
      fallbackEmoji: '🎆',
      description: 'Animation feux artifice',
    },
    'thumbs-up': {
      data: thumbsUp,
      loop: false,
      autoplay: true,
      fallbackEmoji: '👍',
      description: 'Animation pouce leve',
    },
    unicorn: {
      data: unicorn,
      loop: true,
      autoplay: true,
      fallbackEmoji: '🦄',
      description: 'Animation licorne magique',
    },
  };

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Obtenir une animation par son ID
 */
export function getAnimation(id: LottieAnimationId): LottieAnimationData {
  return LOTTIE_ANIMATIONS[id];
}

/**
 * Obtenir les data JSON d'une animation
 */
export function getAnimationData(id: LottieAnimationId): object {
  return LOTTIE_ANIMATIONS[id].data;
}

/**
 * Obtenir l'emoji fallback d'une animation
 */
export function getAnimationFallback(id: LottieAnimationId): string {
  return LOTTIE_ANIMATIONS[id].fallbackEmoji;
}

/**
 * Liste de toutes les animations disponibles
 * Définie explicitement pour éviter type assertion
 */
const ANIMATION_IDS: readonly LottieAnimationId[] = [
  'success',
  'error',
  'loading',
  'celebration',
  'streak',
  'crown',
  'sparkles',
  'magic-wand',
  'fireworks',
  'thumbs-up',
  'unicorn',
] as const;

export function listAnimations(): LottieAnimationId[] {
  return [...ANIMATION_IDS];
}
