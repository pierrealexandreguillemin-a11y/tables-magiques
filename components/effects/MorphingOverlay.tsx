/**
 * MorphingOverlay - Overlay balayage colore pour transitions de page
 * ISO/IEC 25010 - Animation fluide
 */

'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

/**
 * Variantes de couleur disponibles
 */
export type MorphingVariant = 'princess' | 'unicorn' | 'star' | 'rainbow';

/**
 * Themes de couleur pour l'overlay
 */
const OVERLAY_COLORS: Record<MorphingVariant, string> = {
  princess: '#f472b6', // pink-400
  unicorn: '#a855f7', // purple-500
  star: '#facc15', // yellow-400
  rainbow:
    'linear-gradient(135deg, #f472b6 0%, #a855f7 33%, #6366f1 66%, #3b82f6 100%)',
};

/**
 * Animation configs par direction
 */
const ANIMATIONS: Record<
  'enter' | 'exit' | 'full',
  {
    initial: { y: string };
    animate: { y: string | string[] };
    exit: { y?: string; opacity?: number };
    duration: number;
    times?: number[];
  }
> = {
  enter: {
    initial: { y: '100%' },
    animate: { y: '0%' },
    exit: { y: '-100%' },
    duration: 0.6,
  },
  exit: {
    initial: { y: '0%' },
    animate: { y: '-100%' },
    exit: { y: '-100%' },
    duration: 0.6,
  },
  full: {
    initial: { y: '100%' },
    animate: { y: ['0%', '0%', '-100%'] },
    exit: { opacity: 0 },
    duration: 1.2,
    times: [0, 0.45, 1],
  },
};

export interface MorphingOverlayProps {
  /** Est-ce que l'overlay est visible (pendant transition) */
  isAnimating: boolean;
  /** Variante de couleur */
  variant?: MorphingVariant;
  /** Direction de l'animation: enter, exit, ou full (cover+reveal) */
  direction?: 'enter' | 'exit' | 'full';
  /** Callback quand l'ecran est completement couvert (pour direction='full') */
  onMidpoint?: () => void;
  /** Callback quand l'animation est terminee */
  onAnimationComplete?: () => void;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * MorphingOverlay Component
 *
 * Utilise un div plein ecran avec animation CSS transform
 * pour un effet de balayage fluide et fiable sur tous les navigateurs.
 */
export function MorphingOverlay({
  isAnimating,
  variant = 'unicorn',
  direction = 'full',
  onMidpoint,
  onAnimationComplete,
  className,
}: MorphingOverlayProps) {
  const { shouldAnimate } = useReducedMotion();
  const midpointCalledRef = useRef(false);

  // Timer-based midpoint and completion
  useEffect(() => {
    if (!isAnimating || !shouldAnimate) {
      midpointCalledRef.current = false;
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    if (direction === 'full') {
      // Midpoint at ~45% of animation
      timers.push(
        setTimeout(() => {
          if (!midpointCalledRef.current && onMidpoint) {
            midpointCalledRef.current = true;
            onMidpoint();
          }
        }, 540)
      );

      // Complete at end
      timers.push(
        setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, 1200)
      );
    } else {
      timers.push(
        setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, 600)
      );
    }

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isAnimating, direction, onMidpoint, onAnimationComplete, shouldAnimate]);

  // Skip if reduced motion - call callbacks immediately
  useEffect(() => {
    if (!shouldAnimate && isAnimating) {
      if (onMidpoint) {
        setTimeout(onMidpoint, 0);
      }
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, 10);
      }
    }
  }, [shouldAnimate, isAnimating, onMidpoint, onAnimationComplete]);

  if (!shouldAnimate) {
    return null;
  }

  const config = ANIMATIONS[direction];
  const color = OVERLAY_COLORS[variant];

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          key="morphing-overlay"
          className={cn(
            'fixed inset-0 z-[9999] pointer-events-none',
            className
          )}
          style={{
            background: color,
          }}
          initial={config.initial}
          animate={config.animate}
          exit={config.exit}
          transition={{
            duration: config.duration,
            ease: [0.76, 0, 0.24, 1],
            times: config.times,
          }}
        />
      )}
    </AnimatePresence>
  );
}

export default MorphingOverlay;
