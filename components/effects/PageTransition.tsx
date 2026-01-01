/**
 * PageTransition - Wrapper pour transitions de page avec morphing SVG
 * ISO/IEC 25010 - Animations fluides entre routes
 *
 * Utilise le mode 'full' du MorphingOverlay: l'overlay couvre l'ecran,
 * le contenu change au midpoint, puis l'overlay se retire.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MorphingOverlay, type MorphingVariant } from './MorphingOverlay';

/**
 * Variants pour l'animation de la page (fade simple)
 */
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = {
  duration: 0.2,
  ease: 'easeOut' as const,
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
  enableMorphing?: boolean;
  variant?: MorphingVariant;
}

/**
 * PageTransition Component
 *
 * L'overlay fait une animation complete: cover -> pause -> reveal
 * Le contenu change au milieu quand l'ecran est couvert.
 */
export function PageTransition({
  children,
  enableMorphing = true,
  variant,
}: PageTransitionProps) {
  const pathname = usePathname();
  const { shouldAnimate } = useReducedMotion();

  // Etat de la transition
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [displayedPathname, setDisplayedPathname] = useState(pathname);

  // Refs
  const previousPathnameRef = useRef<string>(pathname);
  const isFirstRenderRef = useRef(true);
  const pendingChildrenRef = useRef(children);
  const pendingPathnameRef = useRef(pathname);

  // Garder les pending refs a jour (dans un effet pour respecter les regles React)
  useEffect(() => {
    pendingChildrenRef.current = children;
    pendingPathnameRef.current = pathname;
  }, [children, pathname]);

  // Detecter changement de route
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousPathnameRef.current = pathname;
      return;
    }

    if (previousPathnameRef.current !== pathname && !isTransitioning) {
      if (enableMorphing && shouldAnimate) {
        const timer = setTimeout(() => setIsTransitioning(true), 0);
        previousPathnameRef.current = pathname;
        return () => clearTimeout(timer);
      } else {
        // Sans animation
        const timer = setTimeout(() => {
          setDisplayedChildren(children);
          setDisplayedPathname(pathname);
        }, 0);
        previousPathnameRef.current = pathname;
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [pathname, isTransitioning, enableMorphing, shouldAnimate, children]);

  // Callback au midpoint: changer le contenu
  const handleMidpoint = useCallback(() => {
    setDisplayedChildren(pendingChildrenRef.current);
    setDisplayedPathname(pendingPathnameRef.current);
  }, []);

  // Callback a la fin: terminer la transition
  const handleComplete = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const morphingVariant = variant ?? ROUTE_VARIANTS[pathname] ?? 'unicorn';

  if (!shouldAnimate) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Overlay: animation complete cover->reveal */}
      {enableMorphing && isTransitioning && (
        <MorphingOverlay
          isAnimating={true}
          variant={morphingVariant}
          direction="full"
          onMidpoint={handleMidpoint}
          onAnimationComplete={handleComplete}
        />
      )}

      {/* Contenu de la page */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={displayedPathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
          className="min-h-screen"
        >
          {displayedChildren}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default PageTransition;
