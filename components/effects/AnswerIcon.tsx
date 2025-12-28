/**
 * AnswerIcon - Icone feedback reponse
 * ISO/IEC 25010 - Utilisabilite, Performance
 *
 * P0 Component - Feedback visuel correct/incorrect
 */

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { ThemeVariant } from '@/types/effects';

/**
 * Type de reponse
 */
export type AnswerType = 'correct' | 'incorrect';

/**
 * Tailles disponibles
 */
export type IconSize = 'sm' | 'md' | 'lg';

/**
 * Props du composant AnswerIcon
 */
export interface AnswerIconProps {
  /** Type de reponse */
  type: AnswerType;
  /** Taille de l'icone */
  size?: IconSize;
  /** Variante de theme */
  variant?: ThemeVariant;
  /** Desactiver animations */
  disableAnimation?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Styles de taille
 */
const SIZE_STYLES: Record<IconSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

/**
 * Couleurs par type
 */
const TYPE_COLORS: Record<AnswerType, string> = {
  correct: 'text-emerald-500',
  incorrect: 'text-rose-500',
};

/**
 * Labels accessibilite
 */
const ARIA_LABELS: Record<AnswerType, string> = {
  correct: 'Bonne réponse',
  incorrect: 'Mauvaise réponse',
};

/**
 * Drop shadow par variante
 */
const DROP_SHADOW_STYLES: Record<ThemeVariant, string> = {
  princess: 'drop-shadow-pink',
  unicorn: 'drop-shadow-purple',
  star: 'drop-shadow-yellow',
  rainbow: 'drop-shadow-pink',
};

/**
 * Checkmark SVG path
 */
function CheckmarkPath() {
  return (
    <path
      d="M5 13l4 4L19 7"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

/**
 * X mark SVG path
 */
function XMarkPath() {
  return (
    <>
      <path
        d="M6 6l12 12"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M18 6l-12 12"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </>
  );
}

/**
 * AnswerIcon Component
 *
 * Icone animee pour feedback reponse correct/incorrect.
 * Animation de scale et rotation a l'entree.
 *
 * @example
 * ```tsx
 * <AnswerIcon type="correct" size="lg" variant="unicorn" />
 * ```
 */
export function AnswerIcon({
  type,
  size = 'md',
  variant = 'princess',
  disableAnimation = false,
  className,
}: AnswerIconProps) {
  const { shouldAnimate } = useReducedMotion();
  const animate = shouldAnimate && !disableAnimation;

  return (
    <motion.div
      data-testid="answer-icon"
      data-type={type}
      data-animate={animate ? 'true' : 'false'}
      role="img"
      aria-label={ARIA_LABELS[type]}
      className={cn(
        // Size
        SIZE_STYLES[size],
        // Color
        TYPE_COLORS[type],
        // Shadow
        DROP_SHADOW_STYLES[variant],
        // Custom
        className
      )}
      initial={animate ? { scale: 0, rotate: -180 } : undefined}
      animate={animate ? { scale: 1, rotate: 0 } : undefined}
      transition={
        animate
          ? {
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }
          : undefined
      }
    >
      <motion.svg
        data-testid="answer-icon-svg"
        viewBox="0 0 24 24"
        className="w-full h-full"
      >
        {type === 'correct' ? <CheckmarkPath /> : <XMarkPath />}
      </motion.svg>
    </motion.div>
  );
}

export default AnswerIcon;
