'use client';

/**
 * RippleEffect - Effet ripple Material Design
 * ISO/IEC 25010 - Feedback tactile boutons
 *
 * Features:
 * - Animation cercle expand
 * - Couleur personnalisable
 * - Respect reduced-motion
 */

import { useRipple } from '@/hooks/useRipple';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { RippleEffectProps } from '@/types/effects';

// =============================================================================
// COMPONENT
// =============================================================================

export function RippleEffect({
  children,
  color = 'rgba(255, 255, 255, 0.4)',
  duration = 600,
  disabled = false,
  className,
}: RippleEffectProps) {
  const { shouldAnimate } = useReducedMotion();
  const { ripples, addRipple } = useRipple(duration);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled && shouldAnimate) {
      addRipple(event);
    }
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
      style={{ isolation: 'isolate' }}
    >
      {children}

      {/* Ripples layer */}
      {shouldAnimate &&
        ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none rounded-full animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: color,
              transform: 'translate(-50%, -50%)',
              animationDuration: `${duration}ms`,
            }}
          />
        ))}
    </div>
  );
}

export default RippleEffect;
