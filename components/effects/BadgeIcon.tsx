'use client';

/**
 * BadgeIcon - Icones pour badges
 * ISO/IEC 25010 - Emojis cartoon/familial + Lottie licorne
 *
 * Mapping:
 * - Emojis pour tous les badges (aspect enfantin)
 * - Lottie animation pour licorne (streak5)
 */

import { useMemo } from 'react';
import Lottie from 'lottie-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getAnimationData } from '@/lib/animations';
import { cn } from '@/lib/utils';
import type { BadgeId, BadgeIconProps } from '@/types/effects';

// Re-export pour compatibilite
export type { BadgeId, BadgeIconProps };

// =============================================================================
// INTERNAL CONFIG
// =============================================================================

interface BadgeIconConfig {
  type: 'lottie' | 'emoji';
  lottieId?: 'unicorn';
  emoji: string;
}

// =============================================================================
// BADGE ICON MAPPING - Emojis + Lottie licorne
// =============================================================================

const BADGE_ICONS: Record<BadgeId, BadgeIconConfig> = {
  // Practice badges
  first: { type: 'emoji', emoji: '⭐' },
  streak5: { type: 'lottie', lottieId: 'unicorn', emoji: '🦄' },
  streak10: { type: 'emoji', emoji: '👑' },
  perfect5: { type: 'emoji', emoji: '🌈' },
  streak20: { type: 'emoji', emoji: '✨' },
  perfect10: { type: 'emoji', emoji: '🧚' },
  streak30: { type: 'emoji', emoji: '👸' },
  streak50: { type: 'emoji', emoji: '🏆' },

  // Challenge badges
  speed5: { type: 'emoji', emoji: '⚡' },
  speed10: { type: 'emoji', emoji: '🥷' },
  speed15: { type: 'emoji', emoji: '🚀' },
  speed20: { type: 'emoji', emoji: '⚡👑' },
  perfectChallenge: { type: 'emoji', emoji: '💎' },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function BadgeIcon({
  badgeId,
  size = 48,
  locked = false,
  className,
  animate = true,
}: BadgeIconProps) {
  const { shouldAnimate } = useReducedMotion();
  const config = BADGE_ICONS[badgeId];

  const containerClasses = cn(
    'inline-flex items-center justify-center',
    locked && 'grayscale opacity-50',
    className
  );

  // Lottie unicorn animation data
  const unicornData = useMemo(() => {
    if (config.type === 'lottie' && config.lottieId === 'unicorn') {
      return getAnimationData('unicorn');
    }
    return null;
  }, [config]);

  // Lottie animation pour licorne (si animable et non locked)
  if (
    config.type === 'lottie' &&
    unicornData &&
    shouldAnimate &&
    animate &&
    !locked
  ) {
    return (
      <div
        className={containerClasses}
        style={{ width: size, height: size }}
        role="img"
        aria-label="Licorne magique animee"
      >
        <Lottie
          animationData={unicornData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  }

  // Emoji (fallback pour tous les cas)
  return (
    <span
      className={containerClasses}
      style={{ fontSize: size * 0.8 }}
      role="img"
      aria-label="Badge"
    >
      {config.emoji}
    </span>
  );
}

export default BadgeIcon;
