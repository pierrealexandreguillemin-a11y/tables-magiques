/**
 * MorphingOverlay - Overlay SVG morphing pour transitions de page
 * ISO/IEC 25010 - Animation fluide style Codrops
 *
 * Ref: https://tympanus.net/Development/MorphingPageTransition/
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

/**
 * Paths SVG pour l'effet morphing
 * Les paths doivent avoir le meme nombre de points pour un morphing fluide
 */
const SVG_PATHS = {
  // Path initial: ligne plate en bas
  start: 'M 0 100 V 100 Q 50 100 100 100 V 100 H 0',
  // Path intermediaire: vague montante
  wave: 'M 0 100 V 50 Q 50 0 100 50 V 100 H 0',
  // Path final: couvre tout l'ecran
  full: 'M 0 100 V 0 Q 50 0 100 0 V 100 H 0',
  // Path sortie: vague descendante inverse
  waveReverse: 'M 0 0 V 50 Q 50 100 100 50 V 0 H 0',
  // Path final sortie: ligne plate en haut
  end: 'M 0 0 V 0 Q 50 0 100 0 V 0 H 0',
};

/**
 * Variantes de couleur disponibles
 */
export type MorphingVariant = 'princess' | 'unicorn' | 'star' | 'rainbow';

/**
 * Themes de couleur pour l'overlay (couleurs directes pour SVG)
 */
const OVERLAY_COLORS: Record<MorphingVariant, string> = {
  princess: '#f472b6', // pink-400
  unicorn: '#a855f7', // purple-500
  star: '#facc15', // yellow-400
  rainbow: 'url(#morphing-gradient)',
};

export interface MorphingOverlayProps {
  /** Est-ce que l'overlay est visible (pendant transition) */
  isAnimating: boolean;
  /** Variante de couleur */
  variant?: MorphingVariant;
  /** Direction de l'animation */
  direction?: 'enter' | 'exit';
  /** Callback quand l'animation est terminee */
  onAnimationComplete?: () => void;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * MorphingOverlay Component
 *
 * Cree un effet de vague/blob SVG qui se morphe pendant
 * les transitions de page. L'effet est inspire de Codrops.
 *
 * @example
 * ```tsx
 * <MorphingOverlay
 *   isAnimating={isNavigating}
 *   variant="unicorn"
 *   onAnimationComplete={() => setIsNavigating(false)}
 * />
 * ```
 */
export function MorphingOverlay({
  isAnimating,
  variant = 'unicorn',
  direction = 'enter',
  onAnimationComplete,
  className,
}: MorphingOverlayProps) {
  const { shouldAnimate } = useReducedMotion();

  // Si reduced motion, pas d'overlay
  if (!shouldAnimate) {
    return null;
  }

  // Sequences de paths selon la direction
  // Enter: monte du bas pour couvrir l'ecran
  const enterSequence = [SVG_PATHS.start, SVG_PATHS.wave, SVG_PATHS.full];
  // Exit: descend pour reveler le contenu
  const exitSequence = [SVG_PATHS.full, SVG_PATHS.waveReverse, SVG_PATHS.end];

  const pathSequence = direction === 'enter' ? enterSequence : exitSequence;
  // Duree plus courte pour une transition plus snappy
  const duration = direction === 'enter' ? 0.6 : 0.8;

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className={cn(
            'fixed inset-0 z-[9999] pointer-events-none',
            className
          )}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Gradient definition pour variante rainbow */}
            <defs>
              <linearGradient
                id="morphing-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="33%" stopColor="#a855f7" />
                <stop offset="66%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            <motion.path
              fill={OVERLAY_COLORS[variant]}
              initial={{ d: pathSequence[0] }}
              animate={{
                d: pathSequence,
              }}
              transition={{
                duration,
                ease: [0.76, 0, 0.24, 1], // ease-in-out-expo
                times: [0, 0.4, 1],
              }}
              onAnimationComplete={onAnimationComplete}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MorphingOverlay;
