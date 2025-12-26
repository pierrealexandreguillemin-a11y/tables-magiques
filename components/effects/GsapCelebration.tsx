'use client';

/**
 * GsapCelebration Component - Tables Magiques
 * ISO/IEC 25010 - Effets de celebration GSAP
 *
 * Composant declaratif pour declencher des celebrations GSAP
 * avec support reduced motion et cleanup automatique.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useGsapEffects } from '@/hooks/useGsapEffects';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { AnimatedComponentProps } from '@/types/effects';

/**
 * Type de celebration disponible
 */
export type CelebrationType = 'confetti' | 'fireworks' | 'cascade' | 'none';

/**
 * Props du composant GsapCelebration
 */
export interface GsapCelebrationProps extends AnimatedComponentProps {
  /** Type de celebration a afficher */
  type: CelebrationType;
  /** Declencher la celebration */
  trigger: boolean;
  /** Callback quand la celebration est terminee */
  onComplete?: () => void;
  /** Nombre de particules (pour confetti) */
  particleCount?: number;
  /** Contenu enfant a wrapper */
  children?: React.ReactNode;
}

/**
 * GsapCelebration Component
 *
 * Wrapper declaratif pour les effets de celebration GSAP.
 * Utilise le hook useGsapEffects pour les animations.
 *
 * @example
 * ```tsx
 * // Celebration confetti declenchee par etat
 * <GsapCelebration type="confetti" trigger={isCorrect} particleCount={80}>
 *   <AnswerIcon state="correct" />
 * </GsapCelebration>
 *
 * // Feux d'artifice pour fin de niveau
 * <GsapCelebration type="fireworks" trigger={levelComplete}>
 *   <LevelCompleteCard />
 * </GsapCelebration>
 * ```
 */
export function GsapCelebration({
  type,
  trigger,
  onComplete,
  particleCount = 50,
  className,
  disableAnimation = false,
  children,
}: GsapCelebrationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { shouldAnimate } = useReducedMotion();
  const { confettiExplosion, fireworksDisplay, celebrationCascade } =
    useGsapEffects();

  const animate = shouldAnimate && !disableAnimation;

  // Fonction pour lancer la celebration
  const triggerCelebration = useCallback(() => {
    if (!containerRef.current || !animate || type === 'none') {
      onComplete?.();
      return;
    }

    const container = containerRef.current;

    switch (type) {
      case 'confetti':
        confettiExplosion(container, { count: particleCount });
        // Callback apres duree estimee
        setTimeout(() => onComplete?.(), 1500);
        break;

      case 'fireworks':
        fireworksDisplay(container);
        // Callback apres duree estimee
        setTimeout(() => onComplete?.(), 2000);
        break;

      case 'cascade':
        celebrationCascade(container);
        // Callback apres duree estimee
        setTimeout(() => onComplete?.(), 4000);
        break;

      default:
        onComplete?.();
    }
  }, [
    type,
    animate,
    particleCount,
    confettiExplosion,
    fireworksDisplay,
    celebrationCascade,
    onComplete,
  ]);

  // Declencher quand trigger passe a true
  useEffect(() => {
    if (trigger) {
      triggerCelebration();
    }
  }, [trigger, triggerCelebration]);

  return (
    <div
      ref={containerRef}
      data-testid="gsap-celebration"
      data-celebration-type={type}
      className={cn('relative', className)}
      style={{ position: 'relative', overflow: 'visible' }}
    >
      {children}
    </div>
  );
}

export default GsapCelebration;
