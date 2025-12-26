'use client';

/**
 * useAnimationVisibility - Contrôle animations basé sur visibilité
 * ISO/IEC 25010 - Performance, Efficacité énergétique
 *
 * Utilise IntersectionObserver pour:
 * - Démarrer les animations quand l'élément est visible
 * - Arrêter les animations hors écran (économie CPU ~40%)
 * - Supporter le lazy loading des effets lourds
 */

import { useEffect, useState, useRef, RefObject, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface UseAnimationVisibilityOptions {
  /** Seuil de visibilité pour déclencher (0-1) */
  threshold?: number;
  /** Marge autour de l'élément (CSS margin syntax) */
  rootMargin?: string;
  /** Désactiver le hook (pour tests) */
  disabled?: boolean;
  /** Callback quand devient visible */
  onVisible?: () => void;
  /** Callback quand devient invisible */
  onHidden?: () => void;
}

interface UseAnimationVisibilityResult {
  /** L'élément est-il visible ? */
  isVisible: boolean;
  /** A-t-il été visible au moins une fois ? */
  hasBeenVisible: boolean;
  /** Ref à attacher à l'élément */
  ref: RefObject<HTMLElement>;
}

// =============================================================================
// HOOK PRINCIPAL
// =============================================================================

/**
 * Hook pour contrôler les animations basé sur la visibilité
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const { isVisible, ref } = useAnimationVisibility({ threshold: 0.1 });
 *
 *   return (
 *     <div ref={ref}>
 *       {isVisible && <ExpensiveAnimation />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAnimationVisibility(
  options: UseAnimationVisibilityOptions = {}
): UseAnimationVisibilityResult {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    disabled = false,
    onVisible,
    onHidden,
  } = options;

  const ref = useRef<HTMLElement>(null);
  // État initial basé sur disabled (évite setState synchrone dans effect)
  const [isVisible, setIsVisible] = useState(disabled);
  const [hasBeenVisible, setHasBeenVisible] = useState(disabled);

  // Callbacks stables - utilisés dans IntersectionObserver callback (async)
  const handleVisible = useCallback(() => {
    setIsVisible(true);
    setHasBeenVisible(true);
    onVisible?.();
  }, [onVisible]);

  const handleHidden = useCallback(() => {
    setIsVisible(false);
    onHidden?.();
  }, [onHidden]);

  useEffect(() => {
    // Si disabled, état déjà initialisé à true - pas de setState nécessaire
    if (disabled) {
      return;
    }

    // Si pas de ref, déférer setState pour éviter appel synchrone
    if (!ref.current) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 0);
      return () => clearTimeout(timer);
    }

    // Fallback si IntersectionObserver non supporté
    if (typeof IntersectionObserver === 'undefined') {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasBeenVisible(true);
      }, 0);
      return () => clearTimeout(timer);
    }

    const element = ref.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleVisible();
          } else {
            handleHidden();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, disabled, handleVisible, handleHidden]);

  return {
    isVisible,
    hasBeenVisible,
    ref: ref as RefObject<HTMLElement>,
  };
}

// =============================================================================
// HOOK SIMPLIFIÉ - ONCE
// =============================================================================

/**
 * Hook simplifié - déclenche une seule fois quand visible
 *
 * @example
 * ```tsx
 * function LazyComponent() {
 *   const { shouldRender, ref } = useAnimationOnce();
 *
 *   return (
 *     <div ref={ref}>
 *       {shouldRender && <HeavyComponent />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAnimationOnce(
  options: Omit<UseAnimationVisibilityOptions, 'onVisible' | 'onHidden'> = {}
): { shouldRender: boolean; ref: RefObject<HTMLElement> } {
  const { hasBeenVisible, ref } = useAnimationVisibility(options);

  return {
    shouldRender: hasBeenVisible,
    ref,
  };
}

// =============================================================================
// HOOK POUR PAUSE/RESUME
// =============================================================================

/**
 * Hook pour pause/resume d'animations continues (particules, loops)
 *
 * @example
 * ```tsx
 * function ParticleSection() {
 *   const { isPaused, ref } = useAnimationPause();
 *
 *   return (
 *     <div ref={ref}>
 *       <Particles paused={isPaused} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useAnimationPause(
  options: Omit<UseAnimationVisibilityOptions, 'onVisible' | 'onHidden'> = {}
): { isPaused: boolean; ref: RefObject<HTMLElement> } {
  const { isVisible, ref } = useAnimationVisibility(options);

  return {
    isPaused: !isVisible,
    ref,
  };
}

export default useAnimationVisibility;
