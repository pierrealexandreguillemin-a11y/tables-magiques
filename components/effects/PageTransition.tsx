/**
 * PageTransition - Wrapper pour transitions de page avec morphing SVG
 * ISO/IEC 25010 - Animations fluides entre routes
 *
 * Ref: https://tympanus.net/Development/MorphingPageTransition/
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MorphingOverlay, type MorphingVariant } from './MorphingOverlay';

/**
 * Variants pour l'animation de la page - Style Codrops
 * La page monte pendant que le morphing SVG se declenche
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 100,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -100,
    scale: 0.95,
  },
};

/**
 * Transition pour la page - synchronisee avec le morphing
 */
const pageTransition = {
  duration: 0.8,
  ease: [0.76, 0, 0.24, 1] as [number, number, number, number], // ease-in-out-expo
};

/**
 * Map des routes vers les variantes de couleur morphing
 */
const ROUTE_VARIANTS: Record<string, MorphingVariant> = {
  '/': 'rainbow',
  '/practice': 'unicorn',
  '/challenge': 'star',
  '/profile': 'princess',
  '/settings': 'unicorn',
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
  // Etat pour le morphing - commence a false pour eviter hydration mismatch
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Ref pour tracker la route precedente
  const previousPathnameRef = useRef<string | null>(null);
  // Ref pour tracker si on est monte cote client
  const hasMountedRef = useRef(false);

  // Declencher le morphing au premier rendu ET a chaque changement de route
  useEffect(() => {
    if (!enableMorphing || !shouldAnimate) return undefined;

    // Premier rendu cote client
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      const timer = setTimeout(() => setIsTransitioning(true), 0);
      return () => clearTimeout(timer);
    }

    // Changement de route
    if (
      previousPathnameRef.current !== null &&
      previousPathnameRef.current !== pathname
    ) {
      const timer = setTimeout(() => setIsTransitioning(true), 0);
      previousPathnameRef.current = pathname;
      return () => clearTimeout(timer);
    }

    previousPathnameRef.current = pathname;
    return undefined;
  }, [pathname, enableMorphing, shouldAnimate]);

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
