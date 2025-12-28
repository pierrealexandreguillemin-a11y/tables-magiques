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
 * Couleurs de remplissage par variante - IDs des gradients
 */
const FILL_GRADIENT_IDS: Record<ThemeVariant, string> = {
  princess: 'crown-gradient-princess',
  unicorn: 'crown-gradient-unicorn',
  star: 'crown-gradient-star',
  rainbow: 'crown-gradient-rainbow',
};

/**
 * Couleurs de fond par variante - GOLD pour toutes (couronne = or)
 * En dark mode, on utilise une couleur doree plus saturee
 */
const BG_FILL_COLORS: Record<ThemeVariant, string> = {
  princess: '#d4a574', // Bronze dore
  unicorn: '#c9a961', // Or antique
  star: '#d4a854', // Or classique
  rainbow: '#c9a961', // Or antique
};

/**
 * Path SVG de la couronne HAUTE QUALITE (viewBox 0 0 100 100)
 * Design plus detaille avec joyaux
 */
const CROWN_PATH =
  'M8 72 L18 28 C19 26 21 26 22 28 L32 48 C33 50 35 50 36 48 L48 18 C49 16 51 16 52 18 L64 48 C65 50 67 50 68 48 L78 28 C79 26 81 26 82 28 L92 72 C93 74 92 76 90 76 L10 76 C8 76 7 74 8 72 Z';

/**
 * Points pour les joyaux sur la couronne
 */
const JEWEL_POSITIONS = [
  { cx: 50, cy: 28, r: 4 }, // Centre top
  { cx: 30, cy: 45, r: 3 }, // Left
  { cx: 70, cy: 45, r: 3 }, // Right
];

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
      className={cn(SIZE_STYLES[size], 'drop-shadow-lg', className)}
    >
      {/* Gradients haute qualite par variante */}
      <defs>
        {/* Princess gradient - rose dore */}
        <linearGradient
          id="crown-gradient-princess"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="30%" stopColor="#fbbf24" />
          <stop offset="70%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        {/* Unicorn gradient - violet magique */}
        <linearGradient
          id="crown-gradient-unicorn"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="30%" stopColor="#c084fc" />
          <stop offset="70%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Star gradient - or brillant */}
        <linearGradient
          id="crown-gradient-star"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#fde047" />
          <stop offset="70%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>

        {/* Rainbow gradient */}
        <linearGradient
          id="crown-gradient-rainbow"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="25%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="75%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="crown-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Jewel gradient */}
        <radialGradient id="jewel-gradient">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#fbbf24" />
        </radialGradient>

        <clipPath id={`crown-clip-${normalizedProgress}`}>
          <rect x="0" y={clipY} width="100" height={100 - clipY} />
        </clipPath>
      </defs>

      {/* Background crown - couleur doree de base */}
      <motion.path
        data-testid="crown-background"
        d={CROWN_PATH}
        style={{ fill: BG_FILL_COLORS[variant] }}
        stroke="#fbbf24"
        strokeWidth="1.5"
      />

      {/* Filled crown with gradient (clipped) */}
      <motion.path
        data-testid="crown-fill"
        d={CROWN_PATH}
        fill={`url(#${FILL_GRADIENT_IDS[variant]})`}
        clipPath={`url(#crown-clip-${normalizedProgress})`}
        filter="url(#crown-glow)"
        initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
        animate={animate ? { opacity: 1, scale: 1 } : undefined}
        transition={
          animate
            ? { duration: 0.5, type: 'spring', stiffness: 200 }
            : undefined
        }
      />

      {/* Stroke contour for definition */}
      <motion.path
        d={CROWN_PATH}
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />

      {/* Joyaux scintillants */}
      {JEWEL_POSITIONS.map((jewel, i) => (
        <motion.circle
          key={i}
          cx={jewel.cx}
          cy={jewel.cy}
          r={jewel.r}
          fill="url(#jewel-gradient)"
          filter="url(#crown-glow)"
          initial={animate ? { scale: 0 } : undefined}
          animate={animate ? { scale: [1, 1.2, 1] } : undefined}
          transition={
            animate
              ? {
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }
              : undefined
          }
        />
      ))}

      {/* Text percentage */}
      {showText && (
        <text
          data-testid="crown-text"
          x="50"
          y="90"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-current font-bold"
          style={{ fontSize: '14px', fill: '#fbbf24' }}
        >
          {normalizedProgress}%
        </text>
      )}
    </motion.svg>
  );
}

export default CrownProgress;
