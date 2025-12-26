/**
 * Page Transitions - Tables Magiques
 * ISO/IEC 25010 - Transitions entre pages
 *
 * A utiliser avec AnimatePresence dans layout
 */

import type { Variants, Transition } from 'framer-motion';

// =============================================================================
// TYPES
// =============================================================================

export interface PageTransitionConfig {
  duration?: number;
  delay?: number;
}

// =============================================================================
// TRANSITIONS PRESETS
// =============================================================================

/**
 * Transition par defaut pour enfants (plus lente)
 */
export const defaultPageTransition: Transition = {
  type: 'tween',
  ease: [0.4, 0, 0.2, 1], // ease-in-out
  duration: 0.4,
};

/**
 * Transition rapide
 */
export const quickPageTransition: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.2,
};

/**
 * Transition spring douce
 */
export const springPageTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

// =============================================================================
// PAGE VARIANTS - FADE
// =============================================================================

export const pageFadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: defaultPageTransition,
  },
  exit: {
    opacity: 0,
    transition: quickPageTransition,
  },
};

// =============================================================================
// PAGE VARIANTS - SLIDE UP
// =============================================================================

export const pageSlideUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: defaultPageTransition,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: quickPageTransition,
  },
};

// =============================================================================
// PAGE VARIANTS - SLIDE DOWN
// =============================================================================

export const pageSlideDownVariants: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: defaultPageTransition,
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: quickPageTransition,
  },
};

// =============================================================================
// PAGE VARIANTS - SCALE
// =============================================================================

export const pageScaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springPageTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: quickPageTransition,
  },
};

// =============================================================================
// PAGE VARIANTS - MAGIC (THEME ENFANT)
// =============================================================================

export const pageMagicVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 30,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1], // overshoot
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    filter: 'blur(5px)',
    transition: {
      duration: 0.3,
    },
  },
};

// =============================================================================
// ROUTE-SPECIFIC VARIANTS
// =============================================================================

/**
 * Variants par route pour personnalisation
 */
export const routeVariants: Record<string, Variants> = {
  '/': pageMagicVariants,
  '/practice': pageSlideUpVariants,
  '/challenge': pageScaleVariants,
  '/profile': pageFadeVariants,
  default: pageSlideUpVariants,
};

/**
 * Obtenir les variants pour une route
 */
export function getRouteVariants(pathname: string): Variants {
  return routeVariants[pathname] ?? pageSlideUpVariants;
}

// =============================================================================
// LAYOUT ANIMATIONS
// =============================================================================

/**
 * Animation pour layout changes (resize, reorder)
 */
export const layoutTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

// =============================================================================
// REDUCED MOTION VARIANTS
// =============================================================================

/**
 * Variants sans animation (prefers-reduced-motion)
 */
export const reducedMotionVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
