/**
 * Animations - Tables Magiques
 * ISO/IEC 25010 - Barrel exports centralises
 *
 * Usage:
 * import { gsap, cardVariants, getAnimation } from '@/lib/animations';
 */

// =============================================================================
// GSAP
// =============================================================================

export { gsap, useGSAP } from './gsap/register';
export {
  // Effects
  confettiExplosion,
  fireworksDisplay,
  celebrationCascade,
  shakeError,
  animateScore,
  badgeUnlock,
  timerPulse,
  glowPulse,
  magneticHover,
  staggerReveal,
  numberWave,
  pageTransition,
  // Types
  type ConfettiConfig,
  type FireworksConfig,
  type ShakeConfig,
  type ScoreConfig,
  type GlowConfig,
} from './gsap/effects';

// =============================================================================
// FRAMER MOTION
// =============================================================================

export {
  // Transitions
  springTransition,
  bounceTransition,
  smoothTransition,
  // Variants - Cards
  cardVariants,
  // Variants - Buttons
  buttonVariants,
  magicButtonVariants,
  // Variants - Fade
  fadeVariants,
  fadeUpVariants,
  fadeDownVariants,
  // Variants - Scale
  scaleVariants,
  popVariants,
  // Variants - Slide
  slideLeftVariants,
  slideRightVariants,
  // Variants - Stagger
  staggerContainerVariants,
  staggerItemVariants,
  // Variants - Special
  mascotVariants,
  toastVariants,
  shakeVariants,
  celebrationVariants,
} from './framer/variants';

export {
  // Page transitions
  defaultPageTransition,
  quickPageTransition,
  springPageTransition,
  // Page variants
  pageFadeVariants,
  pageSlideUpVariants,
  pageSlideDownVariants,
  pageScaleVariants,
  pageMagicVariants,
  // Route variants
  routeVariants,
  getRouteVariants,
  // Layout
  layoutTransition,
  reducedMotionVariants,
  // Types
  type PageTransitionConfig,
} from './framer/transitions';

// =============================================================================
// LOTTIE
// =============================================================================

export {
  LOTTIE_ANIMATIONS,
  getAnimation,
  getAnimationData,
  getAnimationFallback,
  listAnimations,
  type LottieAnimationId,
  type LottieAnimationData,
} from './lottie/animations';

export {
  LOTTIE_PRESETS,
  getPreset,
  getStreakPreset,
  getScorePreset,
  type LottiePreset,
  type PresetContext,
} from './lottie/presets';

// =============================================================================
// PARTICLES
// =============================================================================

export {
  // Configs
  fairyConfig,
  starsConfig,
  confettiConfig,
  snowConfig,
  bubblesConfig,
  sparklesConfig,
  PARTICLE_CONFIGS,
  // Helpers
  getParticleConfig,
  listParticlePresets,
  // Types
  type ParticlePreset,
} from './particles/configs';

// =============================================================================
// LAZY LOADING (Performance)
// =============================================================================

export {
  LazyParticlesBackground,
  LazyLottieAnimation,
  LazySuccessExplosion,
  LazyBadgeUnlockModal,
  LazyFairyBackground,
  LazyGsapCelebration,
  preloadHeavyComponents,
  preloadParticles,
} from './lazy';
