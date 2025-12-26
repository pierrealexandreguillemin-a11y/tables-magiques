/**
 * Framer Motion Variants - Tables Magiques
 * ISO/IEC 25010 - Variants reutilisables
 *
 * Utiliser avec <motion.div variants={cardVariants} />
 */

import type { Variants, Transition } from 'framer-motion';

// =============================================================================
// TRANSITIONS PRESETS
// =============================================================================

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

export const bounceTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 15,
};

export const smoothTransition: Transition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};

// =============================================================================
// VARIANTS CARTE
// =============================================================================

export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// =============================================================================
// VARIANTS BOUTON
// =============================================================================

export const buttonVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
  },
  disabled: {
    opacity: 0.5,
    scale: 1,
  },
};

export const magicButtonVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0 4px 15px rgba(255,105,180,0.3)',
  },
  hover: {
    scale: 1.08,
    boxShadow: '0 8px 30px rgba(255,105,180,0.5)',
    transition: bounceTransition,
  },
  tap: {
    scale: 0.95,
    boxShadow: '0 2px 10px rgba(255,105,180,0.2)',
  },
};

// =============================================================================
// VARIANTS FADE
// =============================================================================

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

// =============================================================================
// VARIANTS SCALE
// =============================================================================

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 20,
    },
  },
  exit: { opacity: 0, scale: 0, transition: { duration: 0.15 } },
};

// =============================================================================
// VARIANTS SLIDE
// =============================================================================

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: springTransition },
  exit: { opacity: 0, x: 50, transition: { duration: 0.2 } },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: springTransition },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

// =============================================================================
// VARIANTS STAGGER (PARENT)
// =============================================================================

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: -10 },
};

// =============================================================================
// VARIANTS KAWAII / MASCOTTE
// =============================================================================

export const mascotVariants: Variants = {
  idle: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1.1,
    rotate: [-2, 2, -2, 0],
    transition: {
      rotate: { repeat: 0, duration: 0.4 },
    },
  },
  tap: {
    scale: 0.95,
  },
  happy: {
    scale: [1, 1.1, 1],
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.5 },
  },
  sad: {
    scale: 0.95,
    y: 5,
    transition: { duration: 0.3 },
  },
};

// =============================================================================
// VARIANTS TOAST
// =============================================================================

export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// =============================================================================
// VARIANTS SHAKE (ERREUR DOUCE)
// =============================================================================

export const shakeVariants: Variants = {
  idle: { x: 0 },
  shake: {
    x: [-5, 5, -5, 5, -3, 3, 0],
    transition: { duration: 0.4 },
  },
};

// =============================================================================
// VARIANTS CELEBRATION
// =============================================================================

export const celebrationVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    rotate: -180,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
    },
  },
};
