/**
 * CrownProgress - Indicateur progression couronne SVG
 * ISO/IEC 25010 - Utilisabilite, Performance
 *
 * P0 Component - Progression visuelle ludique
 */

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { ThemeVariant } from '@/types/effects';

/**
 * Tailles disponibles
 */
export type CrownSize = 'sm' | 'md' | 'lg';

/**
 * Props du composant CrownProgress
 */
export interface CrownProgressProps {
  /** Progression 0-100 */
  progress: number;
  /** Taille de la couronne */
  size?: CrownSize;
  /** Variante de theme */
  variant?: ThemeVariant;
  /** Afficher le texte pourcentage */
  showText?: boolean;
  /** Desactiver animations */
  disableAnimation?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Styles de taille
 */
const SIZE_STYLES: Record<CrownSize, string> = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

/**
 * Couleurs de remplissage par variante
 */
const FILL_COLORS: Record<ThemeVariant, string> = {
  princess: 'fill-pink-400',
  unicorn: 'fill-purple-400',
  star: 'fill-yellow-400',
  rainbow: 'fill-pink-400', // Gradient applied via defs
};

/**
 * Couleurs de fond par variante
 */
const BG_COLORS: Record<ThemeVariant, string> = {
  princess: 'fill-pink-100',
  unicorn: 'fill-purple-100',
  star: 'fill-yellow-100',
  rainbow: 'fill-gray-100',
};

/**
 * Path SVG de la couronne (viewBox 0 0 100 100)
 */
const CROWN_PATH =
  'M10 70 L20 30 L35 50 L50 20 L65 50 L80 30 L90 70 L85 75 L15 75 Z';

/**
 * Normaliser la progression entre 0 et 100
 */
function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * CrownProgress Component
 *
 * Couronne SVG avec progression animee.
 * Le remplissage monte progressivement dans la couronne.
 *
 * @example
 * ```tsx
 * <CrownProgress progress={75} variant="star" size="lg" />
 * ```
 */
export function CrownProgress({
  progress,
  size = 'md',
  variant = 'princess',
  showText = true,
  disableAnimation = false,
  className,
}: CrownProgressProps) {
  const { shouldAnimate } = useReducedMotion();
  const animate = shouldAnimate && !disableAnimation;

  const normalizedProgress = clampProgress(progress);

  // Calculate clip path for fill (bottom to top)
  // Progress 0 = clip at 100% (nothing visible)
  // Progress 100 = clip at 0% (all visible)
  const clipY = 100 - normalizedProgress;

  return (
    <motion.svg
      data-testid="crown-progress"
      data-progress={normalizedProgress.toString()}
      data-animate={animate ? 'true' : 'false'}
      role="progressbar"
      aria-valuenow={normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progression"
      viewBox="0 0 100 100"
      className={cn(SIZE_STYLES[size], className)}
    >
      {/* Gradient definition for rainbow */}
      <defs>
        <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <clipPath id={`crown-clip-${normalizedProgress}`}>
          <rect x="0" y={clipY} width="100" height={100 - clipY} />
        </clipPath>
      </defs>

      {/* Background crown */}
      <motion.path
        data-testid="crown-background"
        d={CROWN_PATH}
        className={cn(BG_COLORS[variant], 'stroke-none')}
      />

      {/* Filled crown (clipped) */}
      <motion.path
        data-testid="crown-fill"
        d={CROWN_PATH}
        className={cn(
          variant === 'rainbow' ? '' : FILL_COLORS[variant],
          'stroke-none'
        )}
        fill={variant === 'rainbow' ? 'url(#rainbow-gradient)' : undefined}
        clipPath={`url(#crown-clip-${normalizedProgress})`}
        initial={animate ? { opacity: 0 } : undefined}
        animate={animate ? { opacity: 1 } : undefined}
        transition={animate ? { duration: 0.3 } : undefined}
      />

      {/* Text percentage */}
      {showText && (
        <text
          data-testid="crown-text"
          x="50"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-current text-gray-700 font-bold"
          style={{ fontSize: '16px' }}
        >
          {normalizedProgress}%
        </text>
      )}
    </motion.svg>
  );
}

export default CrownProgress;
