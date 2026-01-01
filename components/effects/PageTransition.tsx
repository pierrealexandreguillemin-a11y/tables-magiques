/**
 * PageTransition - Wrapper pour transitions de page avec morphing SVG
 * ISO/IEC 25010 - Animations fluides entre routes
 *
 * Le morphing COUVRE l'ecran instantanement, puis SE RETIRE pour reveler
 * le nouveau contenu. Cela masque le changement de page.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MorphingOverlay, type MorphingVariant } from './MorphingOverlay';

/**
 * Variants pour l'animation de la page
 * Le contenu apparait apres que l'overlay se soit retire
 */
const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

/**
 * Transition rapide pour le contenu - l'overlay gere la vraie transition
 */
const pageTransition = {
  duration: 0.3,
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
  /** Activer l'overlay morphing SVG (defaut: true) */
  enableMorphing?: boolean;
  /** Variante forcee (sinon basee sur la route) */
  variant?: MorphingVariant;
}

/**
 * PageTransition Component
 *
 * L'overlay COUVRE instantanement l'ecran au changement de route,
 * puis SE RETIRE pour reveler le nouveau contenu.
 */
export function PageTransition({
  children,
  enableMorphing = true,
  variant,
}: PageTransitionProps) {
  const pathname = usePathname();
  const { shouldAnimate } = useReducedMotion();
  // Phase: 'idle' | 'covering' | 'revealing'
  const [phase, setPhase] = useState<'idle' | 'covering' | 'revealing'>('idle');
  // Stocker le contenu actuel pendant la transition
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [displayedPathname, setDisplayedPathname] = useState(pathname);
  // Ref pour tracker la route precedente
  const previousPathnameRef = useRef<string>(pathname);
  // Ref pour tracker si c'est le premier rendu
  const isFirstRenderRef = useRef(true);

  // Detecter changement de route et declencher la sequence
  useEffect(() => {
    // Premier rendu: pas de transition, juste afficher
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousPathnameRef.current = pathname;
      return;
    }

    // Si la route a change et qu'on n'est pas deja en transition
    if (previousPathnameRef.current !== pathname && phase === 'idle') {
      if (enableMorphing && shouldAnimate) {
        // Demarrer la phase "covering" - differe pour eviter cascade
        const timer = setTimeout(() => setPhase('covering'), 0);
        previousPathnameRef.current = pathname;
        return () => clearTimeout(timer);
      } else {
        // Sans animation, mise a jour directe (differe)
        const timer = setTimeout(() => {
          setDisplayedChildren(children);
          setDisplayedPathname(pathname);
        }, 0);
        previousPathnameRef.current = pathname;
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [pathname, phase, enableMorphing, shouldAnimate, children]);

  // Quand on passe en phase 'covering', attendre que l'overlay couvre,
  // puis mettre a jour le contenu et passer en 'revealing'
  const handleCoverComplete = useCallback(() => {
    // L'ecran est couvert, on peut changer le contenu
    setDisplayedChildren(children);
    setDisplayedPathname(pathname);
    // Passer en phase revealing - l'overlay se retire
    setPhase('revealing');
  }, [children, pathname]);

  // Quand la phase 'revealing' est terminee
  const handleRevealComplete = useCallback(() => {
    setPhase('idle');
  }, []);

  // Determiner la variante basee sur la route destination
  const morphingVariant = variant ?? ROUTE_VARIANTS[pathname] ?? 'unicorn';

  // Sans animation, rendu direct
  if (!shouldAnimate) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Overlay SVG morphing */}
      {enableMorphing && (
        <MorphingOverlay
          isAnimating={phase === 'covering' || phase === 'revealing'}
          variant={morphingVariant}
          direction={phase === 'covering' ? 'enter' : 'exit'}
          onAnimationComplete={
            phase === 'covering' ? handleCoverComplete : handleRevealComplete
          }
        />
      )}

      {/* Contenu de la page - affiche le contenu "displayed" */}
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
