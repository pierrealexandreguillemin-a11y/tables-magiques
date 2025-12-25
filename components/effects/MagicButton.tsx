/**
 * MagicButton - Bouton avec effet paillettes
 * ISO/IEC 25010 - Utilisabilite, Performance
 *
 * P0 Component - Bouton de validation reponse
 */

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { TIMING, type ThemeVariant } from '@/types/effects';

/**
 * Generer les positions des sparkles (hors render)
 */
function generateSparklePositions(
  count: number
): Array<{ left: string; top: string }> {
  return Array.from({ length: count }, () => ({
    left: `${20 + Math.random() * 60}%`,
    top: `${20 + Math.random() * 60}%`,
  }));
}

/**
 * Props du composant MagicButton
 */
export interface MagicButtonProps {
  /** Contenu du bouton */
  children: React.ReactNode;
  /** Handler de clic */
  onClick?: () => void;
  /** Variante de theme */
  variant?: ThemeVariant;
  /** Etat desactive */
  disabled?: boolean;
  /** Etat de chargement */
  loading?: boolean;
  /** Type de bouton HTML */
  type?: 'button' | 'submit' | 'reset';
  /** Classes CSS additionnelles */
  className?: string;
  /** Desactiver animations */
  disableAnimation?: boolean;
}

/**
 * Styles de gradient par variante
 */
const VARIANT_STYLES: Record<ThemeVariant, string> = {
  princess: 'from-pink-400 via-pink-500 to-purple-500',
  unicorn: 'from-purple-400 via-pink-400 to-blue-400',
  star: 'from-yellow-400 via-orange-400 to-pink-400',
  rainbow: 'from-red-400 via-yellow-400 to-blue-400',
};

/**
 * Nombre de particules sparkle
 */
const SPARKLE_COUNT = 8;

/**
 * MagicButton Component
 *
 * Bouton avec gradient anime et effet paillettes au clic.
 * Touch target 48px minimum pour accessibilite enfant.
 *
 * @example
 * ```tsx
 * <MagicButton onClick={() => checkAnswer()} variant="unicorn">
 *   Verifier
 * </MagicButton>
 * ```
 */
export function MagicButton({
  children,
  onClick,
  variant = 'princess',
  disabled = false,
  loading = false,
  type = 'button',
  className,
  disableAnimation = false,
}: MagicButtonProps) {
  const [showSparkles, setShowSparkles] = useState(false);
  const [sparklePositions, setSparklePositions] = useState<
    Array<{ left: string; top: string }>
  >([]);
  const { shouldAnimate } = useReducedMotion();
  const animate = shouldAnimate && !disableAnimation;

  const isDisabled = disabled || loading;

  const handleClick = useCallback(() => {
    if (isDisabled) return;

    if (animate) {
      // Generate positions BEFORE render (event handler = not render)
      setSparklePositions(generateSparklePositions(SPARKLE_COUNT));
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), TIMING.celebration);
    }

    onClick?.();
  }, [isDisabled, animate, onClick]);

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        // Base
        'relative px-8 py-4 rounded-2xl overflow-hidden',
        'font-bold text-lg text-white',
        // Gradient
        'bg-gradient-to-r',
        VARIANT_STYLES[variant],
        // Touch target (A11Y)
        'min-h-[48px] min-w-[48px]',
        // Shadow
        'shadow-lg shadow-pink-500/25',
        // States
        isDisabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        // Custom
        className
      )}
      whileHover={animate && !isDisabled ? { scale: 1.05 } : undefined}
      whileTap={animate && !isDisabled ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Sparkle particles */}
      <AnimatePresence>
        {showSparkles && animate && sparklePositions.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {sparklePositions.map((pos, i) => (
              <motion.span
                key={i}
                data-testid="sparkle-particle"
                className="absolute w-2 h-2 bg-yellow-200 rounded-full"
                initial={{
                  left: '50%',
                  top: '50%',
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  left: pos.left,
                  top: pos.top,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: TIMING.celebration / 1000 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Loading spinner */}
      {loading && (
        <motion.span
          data-testid="loading-spinner"
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </motion.span>
      )}

      {/* Content */}
      <span
        data-testid="button-content"
        className={cn('relative z-10', loading && 'opacity-0')}
      >
        {children}
      </span>
    </motion.button>
  );
}

export default MagicButton;
