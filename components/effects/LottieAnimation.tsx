'use client';

/**
 * LottieAnimation Component - Tables Magiques
 * ISO/IEC 25010 - Animations vectorielles Lottie
 *
 * Features:
 * - Animations légères et fluides
 * - Support reduced motion
 * - Imports centralises depuis lib/animations
 * - Types stricts
 */

import { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import type { LottieRefCurrentProps } from 'lottie-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { getAnimationData, getAnimationFallback } from '@/lib/animations';
import type { LottieAnimationProps } from '@/types/effects';

/**
 * LottieAnimation Component
 *
 * Affiche une animation Lottie avec fallback et reduced motion.
 *
 * @example
 * ```tsx
 * <LottieAnimation type="success" size={120} />
 * <LottieAnimation type="celebration" loop onComplete={() => {}} />
 * ```
 */
export function LottieAnimation({
  type,
  autoplay = true,
  loop = false,
  size = 100,
  onComplete,
  className,
}: LottieAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const { shouldAnimate } = useReducedMotion();

  // Callback complete
  useEffect(() => {
    if (lottieRef.current && onComplete && !loop) {
      // Note: lottie-react ne supporte pas directement onComplete
      // On utilise un timeout base sur la duree estimee
      const timeout = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [onComplete, loop]);

  // Map LottieAnimationType to LottieAnimationId
  const animationId = type as
    | 'success'
    | 'error'
    | 'loading'
    | 'celebration'
    | 'streak'
    | 'crown'
    | 'sparkles';

  // Reduced motion: afficher emoji statique
  if (!shouldAnimate) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Animation ${type}`}
      >
        <span style={{ fontSize: size * 0.6 }}>
          {getAnimationFallback(animationId)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Animation ${type}`}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={getAnimationData(animationId)}
        autoplay={autoplay}
        loop={loop}
        style={{ width: '100%', height: '100%' }}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
        }}
      />
    </div>
  );
}

export default LottieAnimation;
