'use client';

/**
 * Hook useGsapEffects - Integration GSAP pour React
 * ISO/IEC 25010 - Module reutilisable, performances visuelles optimisees
 *
 * Expose les 12 effets GSAP de lib/animations/gsap-effects.ts
 * avec support reduced motion et cleanup automatique.
 */

import { useCallback, useMemo } from 'react';
import { useReducedMotion } from './useReducedMotion';
import * as gsapEffects from '@/lib/animations/gsap-effects';
import type {
  UseGsapEffectsResult,
  GsapConfettiConfig,
  GsapScoreConfig,
  GsapGlowConfig,
  GsapCleanupFunction,
} from '@/types/effects';

/**
 * Hook pour utiliser les effets GSAP avec support reduced motion
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { confettiExplosion, shakeError, isReady } = useGsapEffects();
 *   const containerRef = useRef<HTMLDivElement>(null);
 *
 *   const handleSuccess = () => {
 *     if (containerRef.current) {
 *       confettiExplosion(containerRef.current, { count: 80 });
 *     }
 *   };
 *
 *   return <div ref={containerRef}>...</div>;
 * }
 * ```
 */
export function useGsapEffects(): UseGsapEffectsResult {
  const { shouldAnimate } = useReducedMotion();

  // Explosion de confetti
  const confettiExplosion = useCallback(
    (container: HTMLElement, config?: GsapConfettiConfig) => {
      if (!shouldAnimate) return;
      gsapEffects.confettiExplosion(container, config?.count ?? 50);
    },
    [shouldAnimate]
  );

  // Feux d'artifice
  const fireworksDisplay = useCallback(
    (container: HTMLElement) => {
      if (!shouldAnimate) return;
      gsapEffects.fireworksDisplay(container);
    },
    [shouldAnimate]
  );

  // Shake pour erreur
  const shakeError = useCallback(
    (element: HTMLElement) => {
      if (!shouldAnimate) return;
      gsapEffects.shakeError(element);
    },
    [shouldAnimate]
  );

  // Animation deblocage badge
  const badgeUnlock = useCallback(
    (element: HTMLElement) => {
      if (!shouldAnimate) return;
      gsapEffects.badgeUnlock(element);
    },
    [shouldAnimate]
  );

  // Timer pulse (retourne cleanup function)
  const timerPulse = useCallback(
    (element: HTMLElement): GsapCleanupFunction => {
      if (!shouldAnimate) return () => {};
      const tween = gsapEffects.timerPulse(element);
      return () => tween.kill();
    },
    [shouldAnimate]
  );

  // Stagger reveal pour listes
  const staggerReveal = useCallback(
    (elements: HTMLElement[] | NodeListOf<Element>) => {
      if (!shouldAnimate) return;
      gsapEffects.staggerReveal(elements);
    },
    [shouldAnimate]
  );

  // Transition de page
  const pageTransition = useMemo(
    () => ({
      enter: (element: HTMLElement) => {
        if (!shouldAnimate) return;
        gsapEffects.pageTransition.enter(element);
      },
      exit: (element: HTMLElement, onComplete: () => void) => {
        if (!shouldAnimate) {
          onComplete();
          return;
        }
        gsapEffects.pageTransition.exit(element, onComplete);
      },
    }),
    [shouldAnimate]
  );

  // Vague d'animation pour clavier
  const numberWave = useCallback(
    (elements: HTMLElement[] | NodeListOf<Element>) => {
      if (!shouldAnimate) return;
      gsapEffects.numberWave(elements);
    },
    [shouldAnimate]
  );

  // Cascade de celebration
  const celebrationCascade = useCallback(
    (container: HTMLElement) => {
      if (!shouldAnimate) return;
      gsapEffects.celebrationCascade(container);
    },
    [shouldAnimate]
  );

  // Glow pulsant (retourne cleanup function)
  const glowPulse = useCallback(
    (element: HTMLElement, config?: GsapGlowConfig): GsapCleanupFunction => {
      if (!shouldAnimate) return () => {};
      const tween = gsapEffects.glowPulse(element, config?.color ?? '#ff69b4');
      return () => tween.kill();
    },
    [shouldAnimate]
  );

  // Animation de score
  const animateScore = useCallback(
    (element: HTMLElement, config: GsapScoreConfig) => {
      if (!shouldAnimate) {
        element.textContent = config.to.toString();
        return;
      }
      gsapEffects.animateScore(element, config.from, config.to);
    },
    [shouldAnimate]
  );

  // Effet magnetique hover (retourne cleanup function)
  const magneticHover = useCallback(
    (element: HTMLElement): GsapCleanupFunction => {
      if (!shouldAnimate) return () => {};
      return gsapEffects.magneticHover(element);
    },
    [shouldAnimate]
  );

  return {
    confettiExplosion,
    fireworksDisplay,
    shakeError,
    badgeUnlock,
    timerPulse,
    staggerReveal,
    pageTransition,
    numberWave,
    celebrationCascade,
    glowPulse,
    animateScore,
    magneticHover,
    isReady: true,
  };
}

export default useGsapEffects;
