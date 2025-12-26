'use client';

/**
 * GentleShake Component - Tables Magiques
 * ISO/IEC 25010 + WCAG 2.2 - Feedback erreur doux pour enfants
 *
 * Features:
 * - Shake subtil (max 10px, 400ms)
 * - Message encourageant (jamais punitif)
 * - Reduced motion support
 * - Couleurs douces (rose pastel)
 */

import { useEffect, useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { GentleShakeProps } from '@/types/effects';

/**
 * Messages encourageants aleatoires
 */
const ENCOURAGING_MESSAGES = [
  'Presque! Essaie encore',
  'Tu y es presque!',
  'Continue, tu vas y arriver!',
  'Encore un petit effort!',
];

/**
 * Obtenir un message encourageant aleatoire
 */
function getRandomMessage(): string {
  const index = Math.floor(Math.random() * ENCOURAGING_MESSAGES.length);
  return ENCOURAGING_MESSAGES[index] || ENCOURAGING_MESSAGES[0]!;
}

/**
 * GentleShake Component
 *
 * Wrapper qui applique un shake doux quand trigger passe a true.
 * Ideal pour feedback d'erreur non-punitif pour enfants.
 *
 * @example
 * ```tsx
 * <GentleShake trigger={isWrong} message="Presque!">
 *   <AnswerInput />
 * </GentleShake>
 * ```
 */
export function GentleShake({
  trigger,
  onShakeComplete,
  amplitude = 10,
  message,
  className,
  disableAnimation = false,
  children,
}: GentleShakeProps) {
  const { shouldAnimate } = useReducedMotion();
  const controls = useAnimationControls();

  const animate = shouldAnimate && !disableAnimation;

  // Fonction pour declencher le shake
  const shake = useCallback(async () => {
    if (!animate) {
      // Reduced motion: flash opacity instead
      await controls.start({
        opacity: [1, 0.5, 1],
        transition: { duration: 0.3 },
      });
    } else {
      // Shake animation
      const amp = Math.min(amplitude, 10); // Cap amplitude
      await controls.start({
        x: [0, amp, -amp, amp, 0],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      });
    }
    onShakeComplete?.();
  }, [controls, animate, amplitude, onShakeComplete]);

  // Declencher quand trigger passe a true
  useEffect(() => {
    if (trigger) {
      shake();
    }
  }, [trigger, shake]);

  const displayMessage = message || getRandomMessage();

  return (
    <div className={cn('relative', className)}>
      <motion.div animate={controls}>{children}</motion.div>

      {/* Message encourageant */}
      {trigger && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            'absolute -bottom-8 left-1/2 -translate-x-1/2',
            'text-pink-400 dark:text-pink-300',
            'text-sm font-medium whitespace-nowrap',
            'flex items-center gap-1'
          )}
          role="status"
          aria-live="polite"
        >
          <span aria-hidden="true">💭</span>
          {displayMessage}
        </motion.p>
      )}
    </div>
  );
}

export default GentleShake;
