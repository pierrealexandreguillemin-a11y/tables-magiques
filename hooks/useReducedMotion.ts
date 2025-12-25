/**
 * useReducedMotion - Hook accessibilite mouvement reduit
 * ISO/IEC 25010 - Accessibilite
 * WCAG 2.1 - 2.3.3 Animation from Interactions
 *
 * Detecte la preference utilisateur pour le mouvement reduit
 * et reagit dynamiquement aux changements systeme.
 */

import { useState, useEffect } from 'react';
import type { ReducedMotionResult } from '@/types/effects';

/**
 * Media query pour detecter prefers-reduced-motion
 */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Obtenir la valeur initiale de la preference
 * SSR-safe: retourne false si window n'est pas disponible
 */
function getInitialValue(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Hook pour detecter la preference de mouvement reduit
 *
 * @returns Object avec prefersReducedMotion et shouldAnimate
 *
 * @example
 * ```tsx
 * function AnimatedButton() {
 *   const { shouldAnimate } = useReducedMotion();
 *
 *   return (
 *     <motion.button
 *       whileHover={shouldAnimate ? { scale: 1.05 } : undefined}
 *     >
 *       Click me
 *     </motion.button>
 *   );
 * }
 * ```
 */
export function useReducedMotion(): ReducedMotionResult {
  // Initialize with actual value (SSR-safe via getInitialValue)
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState(getInitialValue);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    // Handler for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return {
    prefersReducedMotion,
    shouldAnimate: !prefersReducedMotion,
  };
}

/**
 * Export default pour import plus simple
 */
export default useReducedMotion;
