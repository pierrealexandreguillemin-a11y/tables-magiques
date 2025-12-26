'use client';

/**
 * GradientText Component - Tables Magiques
 * ISO/IEC 25010 - Texte avec gradient anime
 *
 * Features:
 * - Gradients theme princesse/licorne
 * - Animation optionnelle (GPU acceleree)
 * - Reduced motion support
 * - @property CSS pour transitions smooth
 */

import { useMemo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { GradientTextProps, GradientVariant } from '@/types/effects';

/**
 * Configuration des gradients par variante
 */
const GRADIENTS: Record<GradientVariant, string> = {
  fairy: 'from-pink-400 via-purple-400 to-blue-400',
  unicorn:
    'from-pink-400 via-purple-500 via-blue-400 via-green-400 to-yellow-400',
  rainbow:
    'from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400',
  gold: 'from-yellow-300 via-amber-400 to-orange-400',
};

/**
 * GradientText Component
 *
 * Affiche du texte avec un gradient colore anime.
 * Utilise background-clip: text pour le rendu.
 *
 * @example
 * ```tsx
 * <GradientText variant="fairy" animate>
 *   Tables Magiques
 * </GradientText>
 *
 * <GradientText as="h1" variant="unicorn">
 *   Bravo!
 * </GradientText>
 * ```
 */
export function GradientText({
  children,
  variant = 'fairy',
  animate = false,
  as: Component = 'span',
  className,
}: GradientTextProps) {
  const { shouldAnimate } = useReducedMotion();

  // Animation seulement si demandee ET reduced motion non active
  const shouldAnimateGradient = animate && shouldAnimate;

  const gradientClass = useMemo(() => GRADIENTS[variant], [variant]);

  return (
    <Component
      className={cn(
        // Base styles
        'bg-gradient-to-r bg-clip-text text-transparent',
        // Gradient variant
        gradientClass,
        // Animation
        shouldAnimateGradient && 'animate-gradient-x',
        // GPU acceleration
        'transform-gpu',
        className
      )}
      style={{
        // Fallback pour anciens navigateurs
        WebkitBackgroundClip: 'text',
        // Animation custom property (si supportee)
        backgroundSize: shouldAnimateGradient ? '200% 100%' : undefined,
      }}
    >
      {children}
    </Component>
  );
}

export default GradientText;
