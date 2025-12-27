'use client';

/**
 * ScrollReveal - Animation au scroll
 * ISO/IEC 25010 - Enrichissement visuel defilement
 *
 * Features:
 * - Variants: fade-up, fade-down, scale, slide-left, slide-right
 * - Intersection Observer
 * - Respect reduced-motion
 * - TriggerOnce option
 */

import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ScrollRevealProps } from '@/types/effects';

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const getVariants = (variant: string): Variants => {
  const baseTransition = {
    type: 'spring' as const,
    stiffness: 100,
    damping: 20,
  };

  switch (variant) {
    case 'fade-up':
      return {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      };
    case 'fade-down':
      return {
        hidden: { opacity: 0, y: -40 },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      };
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: baseTransition },
      };
    case 'slide-left':
      return {
        hidden: { opacity: 0, x: -60 },
        visible: { opacity: 1, x: 0, transition: baseTransition },
      };
    case 'slide-right':
      return {
        hidden: { opacity: 0, x: 60 },
        visible: { opacity: 1, x: 0, transition: baseTransition },
      };
    default:
      return {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      };
  }
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.6,
  threshold = 0.2,
  triggerOnce = true,
  className,
}: ScrollRevealProps) {
  const { shouldAnimate } = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: triggerOnce,
    amount: threshold,
  });

  const variants = getVariants(variant);

  // Sans animation: rendu direct
  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ delay, duration }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollReveal pour liste avec stagger
 */
export function ScrollRevealList({
  children,
  variant = 'fade-up',
  staggerDelay = 0.1,
  threshold = 0.1,
  triggerOnce = true,
  className,
  itemClassName,
}: ScrollRevealProps & {
  staggerDelay?: number;
  itemClassName?: string;
}) {
  const { shouldAnimate } = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: triggerOnce,
    amount: threshold,
  });

  const itemVariants = getVariants(variant);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  // Wrapper children dans motion.div
  const items = Array.isArray(children) ? children : [children];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      {items.map((child, index) => (
        <motion.div
          key={index}
          className={itemClassName}
          variants={itemVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default ScrollReveal;
