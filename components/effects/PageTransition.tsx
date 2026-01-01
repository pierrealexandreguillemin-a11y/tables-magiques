/**
 * PageTransition - Wrapper pour transitions de page avec balayage colore
 * ISO/IEC 25010 - Animations fluides entre routes
 *
 * L'overlay balaie l'ecran du bas vers le haut pour couvrir,
 * le contenu change au midpoint, puis l'overlay continue vers le haut pour reveler.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MorphingOverlay, type MorphingVariant } from './MorphingOverlay';

/**
 * Map des routes vers les variantes de couleur
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
 * Balayage colore qui masque le changement de page.
 */
export function PageTransition({
  children,
  enableMorphing = true,
  variant,
}: PageTransitionProps) {
  const pathname = usePathname();
  const { shouldAnimate } = useReducedMotion();

  // State
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [transitionVariant, setTransitionVariant] =
    useState<MorphingVariant>('unicorn');

  // Refs pour stocker les valeurs pending
  const previousPathnameRef = useRef<string>(pathname);
  const pendingChildrenRef = useRef(children);
  const isFirstRenderRef = useRef(true);

  // Mettre a jour les pending refs
  useEffect(() => {
    pendingChildrenRef.current = children;
  }, [children]);

  // Detecter changement de route et declencher transition
  useEffect(() => {
    // Skip first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // Route changed?
    if (previousPathnameRef.current !== pathname && !isTransitioning) {
      previousPathnameRef.current = pathname;

      // Store the variant for the TARGET route (the new page)
      const targetVariant = variant ?? ROUTE_VARIANTS[pathname] ?? 'unicorn';

      if (enableMorphing && shouldAnimate) {
        // Use setTimeout to avoid synchronous setState in effect
        const timer = setTimeout(() => {
          setTransitionVariant(targetVariant);
          setIsTransitioning(true);
        }, 0);
        return () => clearTimeout(timer);
      } else {
        // No animation - just swap content
        const timer = setTimeout(() => {
          setDisplayedChildren(children);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [
    pathname,
    children,
    isTransitioning,
    enableMorphing,
    shouldAnimate,
    variant,
  ]);

  // Midpoint: swap content when screen is covered
  const handleMidpoint = useCallback(() => {
    setDisplayedChildren(pendingChildrenRef.current);
  }, []);

  // Complete: end transition
  const handleComplete = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  // Render without animation if reduced motion
  if (!shouldAnimate) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Overlay balayage colore */}
      {enableMorphing && (
        <MorphingOverlay
          isAnimating={isTransitioning}
          variant={transitionVariant}
          direction="full"
          onMidpoint={handleMidpoint}
          onAnimationComplete={handleComplete}
        />
      )}

      {/* Contenu (affiche l'ancienne page jusqu'au midpoint) */}
      <div className="min-h-screen">{displayedChildren}</div>
    </>
  );
}

export default PageTransition;
