/**
 * GradientBorder - Bordure gradient animee
 * ISO/IEC 25010 - Effet visuel premium pour elements speciaux
 */

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { ThemeVariant } from '@/types/effects';

export interface GradientBorderProps {
  /** Contenu a entourer */
  children: React.ReactNode;
  /** Variante de theme */
  variant?: ThemeVariant;
  /** Epaisseur de la bordure en pixels */
  borderWidth?: number;
  /** Rayon des coins */
  borderRadius?: string;
  /** Animer le gradient */
  animate?: boolean;
  /** Vitesse d'animation en secondes */
  animationDuration?: number;
  /** Effet glow */
  glow?: boolean;
  /** Classes CSS additionnelles pour le conteneur */
  className?: string;
  /** Classes CSS additionnelles pour le contenu */
  contentClassName?: string;
}

/**
 * Gradients par variante
 */
const GRADIENT_COLORS: Record<ThemeVariant, string> = {
  princess: 'linear-gradient(90deg, #ff69b4, #ff1493, #ba55d3, #ff69b4)',
  unicorn: 'linear-gradient(90deg, #a855f7, #8b5cf6, #6366f1, #a855f7)',
  star: 'linear-gradient(90deg, #fbbf24, #f59e0b, #eab308, #fbbf24)',
  rainbow:
    'linear-gradient(90deg, #ff69b4, #a855f7, #3b82f6, #22c55e, #fbbf24, #ff69b4)',
};

/**
 * Couleurs glow par variante
 */
const GLOW_COLORS: Record<ThemeVariant, string> = {
  princess: 'rgba(255, 105, 180, 0.5)',
  unicorn: 'rgba(168, 85, 247, 0.5)',
  star: 'rgba(251, 191, 36, 0.5)',
  rainbow: 'rgba(168, 85, 247, 0.4)',
};

/**
 * GradientBorder Component
 *
 * Enveloppe un element avec une bordure gradient animee.
 * Utilise la technique du pseudo-element avec mask.
 *
 * @example
 * ```tsx
 * <GradientBorder variant="rainbow" animate glow>
 *   <div className="p-4 bg-white">
 *     Contenu avec bordure arc-en-ciel
 *   </div>
 * </GradientBorder>
 * ```
 */
export function GradientBorder({
  children,
  variant = 'unicorn',
  borderWidth = 2,
  borderRadius = '1rem',
  animate = false,
  animationDuration = 3,
  glow = false,
  className,
  contentClassName,
}: GradientBorderProps) {
  const { shouldAnimate } = useReducedMotion();
  const shouldAnimateGradient = animate && shouldAnimate;

  return (
    <div
      className={cn('relative', className)}
      style={{
        padding: borderWidth,
        borderRadius,
      }}
    >
      {/* Gradient border layer */}
      <motion.div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: GRADIENT_COLORS[variant],
          backgroundSize: animate ? '200% 100%' : '100% 100%',
          boxShadow: glow ? `0 0 20px ${GLOW_COLORS[variant]}` : undefined,
        }}
        animate={
          shouldAnimateGradient
            ? {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }
            : undefined
        }
        transition={
          shouldAnimateGradient
            ? {
                duration: animationDuration,
                repeat: Infinity,
                ease: 'linear',
              }
            : undefined
        }
        aria-hidden="true"
      />

      {/* Content layer */}
      <div
        className={cn(
          'relative bg-white dark:bg-gray-900 rounded-[inherit]',
          contentClassName
        )}
        style={{
          borderRadius: `calc(${borderRadius} - ${borderWidth}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * GradientBorderCard - Version simplifiee avec padding integre
 */
export interface GradientBorderCardProps extends GradientBorderProps {
  /** Padding du contenu */
  padding?: string;
}

export function GradientBorderCard({
  children,
  padding = 'p-4',
  contentClassName,
  ...props
}: GradientBorderCardProps) {
  return (
    <GradientBorder {...props} contentClassName={cn(padding, contentClassName)}>
      {children}
    </GradientBorder>
  );
}

export default GradientBorder;
