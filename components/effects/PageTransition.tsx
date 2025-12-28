/**
 * PageTransition - Wrapper pour transitions de page avec morphing SVG
 * ISO/IEC 25010 - Animations fluides entre routes
 *
 * Ref: https://tympanus.net/Development/MorphingPageTransition/
 */

'use client';

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MorphingOverlay, type MorphingVariant } from './MorphingOverlay';

/**
 * Variants pour l'animation de la page
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.98,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.98,
    filter: 'blur(4px)',
  },
};

/**
 * Transition spring pour la page
 */
const pageTransition = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 25,
  delay: 0.3, // Delai pour laisser le morphing commencer
};

/**
 * Map des routes vers les variantes de couleur morphing
 */
const ROUTE_VARIANTS: Record<string, MorphingVariant> = {
  '/': 'rainbow',
  '/practice': 'unicorn',
  '/challenge': 'star',
  '/profile': 'princess',
};

interface PageTransitionProps {
  children: React.ReactNode;
  /** Activer l'overlay morphing SVG (defaut: true) */
  enableMorphing?: boolean;
  /** Variante forcee (sinon basee sur la route) */
  variant?: MorphingVariant;
}

/**
 * PageTransition Component
 *
 * Wrapper qui ajoute des transitions fluides entre les pages
 * avec un effet de morphing SVG style Codrops.
 *
 * @example
 * ```tsx
 * // Dans template.tsx
 * export default function Template({ children }) {
 *   return <PageTransition>{children}</PageTransition>;
 * }
 * ```
 */
export function PageTransition({
  children,
  enableMorphing = true,
  variant,
}: PageTransitionProps) {
  const pathname = usePathname();
  const { shouldAnimate } = useReducedMotion();
  // Declencher le morphing au premier rendu si animations actives
  const [isTransitioning, setIsTransitioning] = useState(
    () => enableMorphing && typeof window !== 'undefined'
  );

  // Determiner la variante basee sur la route ou la prop
  const morphingVariant = variant ?? ROUTE_VARIANTS[pathname] ?? 'unicorn';

  // Callback quand le morphing est termine
  const handleMorphingComplete = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  // Sans animation, rendu direct
  if (!shouldAnimate) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Overlay SVG morphing */}
      {enableMorphing && (
        <MorphingOverlay
          isAnimating={isTransitioning}
          variant={morphingVariant}
          direction="enter"
          onAnimationComplete={handleMorphingComplete}
        />
      )}

      {/* Contenu de la page avec AnimatePresence */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default PageTransition;
