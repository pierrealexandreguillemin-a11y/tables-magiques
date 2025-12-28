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
 * Styles par variante - GLASSMORPHISM FORT
 * Fond blanc/colore semi-transparent avec bordure visible
 */
const VARIANT_STYLES: Record<ThemeVariant, string> = {
  princess:
    'bg-white/70 border-pink-300/80 dark:bg-pink-950/60 dark:border-pink-400/50',
  unicorn:
    'bg-white/70 border-purple-300/80 dark:bg-purple-950/60 dark:border-purple-400/50',
  star: 'bg-white/70 border-yellow-300/80 dark:bg-yellow-950/60 dark:border-yellow-400/50',
  rainbow:
    'bg-gradient-to-br from-white/80 via-pink-50/70 to-purple-50/70 border-pink-300/60 dark:from-pink-950/60 dark:via-purple-950/60 dark:to-indigo-950/60',
};

/**
 * Glow par variante - OMBRE FORTE ET COLOREE
 */
const GLOW_STYLES: Record<ThemeVariant, string> = {
  princess:
    'shadow-[0_8px_32px_rgba(244,114,182,0.4)] dark:shadow-[0_8px_32px_rgba(244,114,182,0.3)]',
  unicorn:
    'shadow-[0_8px_32px_rgba(168,85,247,0.4)] dark:shadow-[0_8px_32px_rgba(168,85,247,0.3)]',
  star: 'shadow-[0_8px_32px_rgba(250,204,21,0.4)] dark:shadow-[0_8px_32px_rgba(250,204,21,0.3)]',
  rainbow:
    'shadow-[0_8px_32px_rgba(219,39,119,0.3)] dark:shadow-[0_8px_32px_rgba(219,39,119,0.25)]',
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
