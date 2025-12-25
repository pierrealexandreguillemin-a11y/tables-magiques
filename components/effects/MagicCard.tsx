/**
 * MagicCard - Carte glassmorphism pour exercices
 * ISO/IEC 25010 - Utilisabilite, Performance
 *
 * P0 Component - Cartes d'exercices avec effet verre depoli
 */

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { ThemeVariant } from '@/types/effects';

/**
 * Props du composant MagicCard
 */
export interface MagicCardProps {
  /** Contenu de la carte */
  children: React.ReactNode;
  /** Variante de theme */
  variant?: ThemeVariant;
  /** Afficher effet glow */
  glow?: boolean;
  /** Handler de clic */
  onClick?: () => void;
  /** Padding personnalise */
  padding?: string;
  /** Element HTML semantique */
  as?: 'div' | 'article' | 'section';
  /** Classes CSS additionnelles */
  className?: string;
  /** Desactiver animations */
  disableAnimation?: boolean;
  /** Aria label pour accessibilite */
  'aria-label'?: string;
}

/**
 * Styles par variante (sans shadow - gere separement)
 */
const VARIANT_STYLES: Record<ThemeVariant, string> = {
  princess: 'bg-pink-50/40 border-pink-200/50',
  unicorn: 'bg-purple-50/40 border-purple-200/50',
  star: 'bg-yellow-50/40 border-yellow-200/50',
  rainbow:
    'bg-gradient-to-br from-pink-50/40 via-purple-50/40 to-blue-50/40 border-pink-200/30',
};

/**
 * Glow par variante
 */
const GLOW_STYLES: Record<ThemeVariant, string> = {
  princess: 'shadow-pink-300/30',
  unicorn: 'shadow-purple-300/30',
  star: 'shadow-yellow-300/30',
  rainbow: 'shadow-pink-300/20',
};

/**
 * MagicCard Component
 *
 * Carte avec effet glassmorphism (verre depoli) adapte au theme feerie.
 * Support complet des animations avec reduced motion.
 *
 * @example
 * ```tsx
 * <MagicCard variant="unicorn" onClick={() => selectTable(7)}>
 *   <h2>Table du 7</h2>
 *   <p>Niveau Licorne</p>
 * </MagicCard>
 * ```
 */
export function MagicCard({
  children,
  variant = 'princess',
  glow = true,
  onClick,
  padding = 'p-6',
  as: Component = 'div',
  className,
  disableAnimation = false,
  'aria-label': ariaLabel,
}: MagicCardProps) {
  const { shouldAnimate } = useReducedMotion();
  const animate = shouldAnimate && !disableAnimation;

  const isClickable = !!onClick;

  return (
    <motion.div
      data-testid="magic-card"
      role={Component === 'article' ? 'article' : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        // Base glassmorphism
        'relative rounded-3xl',
        'backdrop-blur-md',
        'border-2',
        padding,

        // Variante
        VARIANT_STYLES[variant],

        // Glow effect
        glow && 'shadow-xl',
        glow && GLOW_STYLES[variant],

        // Interactivite
        isClickable && 'cursor-pointer',

        // Custom
        className
      )}
      whileHover={
        animate && isClickable
          ? {
              scale: 1.02,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      whileTap={
        animate && isClickable
          ? {
              scale: 0.98,
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}

export default MagicCard;
