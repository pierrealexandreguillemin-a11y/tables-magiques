/**
 * Animations - Tables Magiques
 * ISO/IEC 25010 - Barrel exports centralises
 *
 * Usage:
 * import { cardVariants, getAnimation } from '@/lib/animations';
 */

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
// COLORS (shared palette)
// =============================================================================

export {
  FAIRY_COLORS,
  CONFETTI_COLORS,
  FIREWORKS_COLORS,
  STAR_COLORS,
  THEME_GRADIENTS,
  THEME_GLOWS,
  THEME_OVERLAYS,
  ACCENT_PURPLE,
  ACCENT_ORANGE,
} from './colors';

// =============================================================================
// LAZY LOADING (Performance)
// =============================================================================

export {
  LazyParticlesBackground,
  LazyLottieAnimation,
  LazySuccessExplosion,
  LazyBadgeUnlockModal,
  LazyFairyBackground,
  LazyKawaiiMascot,
  preloadHeavyComponents,
  preloadParticles,
} from './lazy';
