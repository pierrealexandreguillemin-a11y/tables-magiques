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

import { useEffect } from 'react';
import { useRestartableAnimation } from '@/features/home/hooks/useRestartableAnimation';
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
  // disableAnimation handled by CSS prefers-reduced-motion
  children,
}: GentleShakeProps) {
  const shake = useRestartableAnimation('shake-error');

  useEffect(() => {
    if (trigger) {
      shake.trigger();
    }
  }, [trigger, shake]);

  const displayMessage = message || getRandomMessage();

  return (
    <div
      className={cn('relative', className, shake.className)}
      style={
        amplitude !== 10
          ? ({
              '--shake-amplitude': `${Math.min(amplitude, 10)}px`,
            } as React.CSSProperties)
          : undefined
      }
      onAnimationEnd={(e) => {
        if (e.animationName === 'shake-error') {
          shake.reset();
          onShakeComplete?.();
        }
      }}
    >
      {children}

      {/* Message encourageant */}
      {trigger && (
        <p
          className={cn(
            'animate-fade-up',
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
        </p>
      )}
    </div>
  );
}

export default GentleShake;
