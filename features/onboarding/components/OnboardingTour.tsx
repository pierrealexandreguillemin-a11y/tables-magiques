'use client';

import { useEffect, useState, useCallback } from 'react';
import { TourHighlight } from './TourHighlight';
import { TourTooltip } from './TourTooltip';
import { useOnboarding } from '../hooks/useOnboarding';
import { useFirstVisit } from '../hooks/useFirstVisit';
import { cn } from '@/lib/utils';
import type { TourPlacement } from '@/types/onboarding';

// =============================================================================
// TYPES
// =============================================================================

interface OnboardingTourProps {
  /** Demarrer automatiquement si premiere visite */
  autoStart?: boolean;
  /** Classes additionnelles */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Calcule la position du tooltip selon le placement et la cible
 */
function getTooltipPosition(
  placement: TourPlacement,
  targetRect: DOMRect | null
): React.CSSProperties {
  if (!targetRect) {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const padding = 16;

  switch (placement) {
    case 'top':
      return {
        position: 'fixed',
        bottom: `${window.innerHeight - targetRect.top + padding}px`,
        left: `${targetRect.left + targetRect.width / 2}px`,
        transform: 'translateX(-50%)',
      };
    case 'bottom':
      return {
        position: 'fixed',
        top: `${targetRect.bottom + padding}px`,
        left: `${targetRect.left + targetRect.width / 2}px`,
        transform: 'translateX(-50%)',
      };
    case 'left':
      return {
        position: 'fixed',
        top: `${targetRect.top + targetRect.height / 2}px`,
        right: `${window.innerWidth - targetRect.left + padding}px`,
        transform: 'translateY(-50%)',
      };
    case 'right':
      return {
        position: 'fixed',
        top: `${targetRect.top + targetRect.height / 2}px`,
        left: `${targetRect.right + padding}px`,
        transform: 'translateY(-50%)',
      };
    case 'center':
    default:
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Composant principal tour guide onboarding
 * Combine Highlight + Tooltip + logique navigation
 */
export function OnboardingTour({
  autoStart = true,
  className,
}: OnboardingTourProps) {
  const { isFirstVisit, hasTourCompleted, markTourCompleted } = useFirstVisit();
  const { state, steps, currentStep, start, next, prev, skip, complete } =
    useOnboarding({
      onComplete: markTourCompleted,
      onSkip: markTourCompleted,
    });

  const [tooltipPosition, setTooltipPosition] = useState<React.CSSProperties>(
    {}
  );

  // Auto-start si premiere visite
  useEffect(() => {
    if (!autoStart || !isFirstVisit || hasTourCompleted || state.isActive) {
      return;
    }
    // Petit delai pour laisser la page charger
    const timer = setTimeout(() => {
      start();
    }, 500);
    return () => clearTimeout(timer);
  }, [autoStart, isFirstVisit, hasTourCompleted, state.isActive, start]);

  // Mise a jour position tooltip
  const updateTooltipPosition = useCallback(() => {
    if (!currentStep) return;

    const element = document.querySelector(currentStep.target);
    const rect = element?.getBoundingClientRect() ?? null;
    const position = getTooltipPosition(
      currentStep.placement ?? 'bottom',
      rect
    );
    setTooltipPosition(position);
  }, [currentStep]);

  useEffect(() => {
    // Utiliser RAF pour differ le setState et eviter l'erreur ESLint
    const rafId = requestAnimationFrame(() => {
      updateTooltipPosition();
    });

    window.addEventListener('resize', updateTooltipPosition);
    window.addEventListener('scroll', updateTooltipPosition, true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateTooltipPosition);
      window.removeEventListener('scroll', updateTooltipPosition, true);
    };
  }, [updateTooltipPosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!state.isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          skip();
          break;
        case 'ArrowRight':
        case 'Enter':
          if (state.currentStep === steps.length - 1) {
            complete();
          } else {
            next();
          }
          break;
        case 'ArrowLeft':
          if (state.currentStep > 0) {
            prev();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.isActive,
    state.currentStep,
    steps.length,
    next,
    prev,
    skip,
    complete,
  ]);

  // Ne rien rendre si pas actif
  if (!state.isActive || !currentStep) {
    return null;
  }

  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === steps.length - 1;

  return (
    <TourHighlight
      target={currentStep.target}
      spotlightClicks={currentStep.spotlightClicks}
      className={className}
    >
      <div className={cn('z-[10000]')} style={tooltipPosition}>
        <TourTooltip
          title={currentStep.title}
          content={currentStep.content}
          placement={currentStep.placement}
          currentIndex={state.currentStep}
          totalSteps={steps.length}
          canGoPrev={!isFirstStep}
          canGoNext={!isLastStep}
          canSkip={state.canSkip}
          isLast={isLastStep}
          onPrev={prev}
          onNext={next}
          onSkip={skip}
          onComplete={complete}
        />
      </div>
    </TourHighlight>
  );
}

// =============================================================================
// TRIGGER COMPONENT
// =============================================================================

interface TourTriggerProps {
  /** Enfants (bouton declencheur) */
  children: React.ReactNode;
  /** Classes additionnelles */
  className?: string;
}

/**
 * Composant declencheur pour relancer le tour
 * A utiliser dans Header ou Settings
 */
export function TourTrigger({ children, className }: TourTriggerProps) {
  const { start, reset } = useOnboarding();
  const { reset: resetFirstVisit } = useFirstVisit();

  const handleClick = useCallback(() => {
    resetFirstVisit();
    reset();
    start();
  }, [resetFirstVisit, reset, start]);

  return (
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  );
}
