'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  TourState,
  TourStep,
  UseOnboardingResult,
} from '@/types/onboarding';
import { DEFAULT_TOUR_STATE, MAIN_TOUR_STEPS } from '@/types/onboarding';

// =============================================================================
// HOOK
// =============================================================================

interface UseOnboardingOptions {
  /** Etapes custom (par defaut: MAIN_TOUR_STEPS) */
  steps?: TourStep[];
  /** Callback a la completion */
  onComplete?: () => void;
  /** Callback au skip */
  onSkip?: () => void;
}

/**
 * Hook gestion tour guide onboarding
 */
export function useOnboarding(
  options: UseOnboardingOptions = {}
): UseOnboardingResult {
  const { steps = MAIN_TOUR_STEPS, onComplete, onSkip } = options;

  const [state, setState] = useState<TourState>(DEFAULT_TOUR_STATE);

  // Etape courante
  const currentStep = useMemo((): TourStep | null => {
    if (!state.isActive || state.currentStep >= steps.length) {
      return null;
    }
    return steps[state.currentStep] ?? null;
  }, [state.isActive, state.currentStep, steps]);

  // Demarrer le tour
  const start = useCallback(() => {
    setState({
      ...DEFAULT_TOUR_STATE,
      isActive: true,
      currentStep: 0,
    });
  }, []);

  // Etape suivante
  const next = useCallback(() => {
    setState((prev) => {
      const nextStep = prev.currentStep + 1;

      // Derniere etape -> complete
      if (nextStep >= steps.length) {
        onComplete?.();
        return {
          ...prev,
          isActive: false,
          isCompleted: true,
          currentStep: nextStep,
        };
      }

      return {
        ...prev,
        currentStep: nextStep,
      };
    });
  }, [steps.length, onComplete]);

  // Etape precedente
  const prev = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  // Sauter le tour
  const skip = useCallback(() => {
    onSkip?.();
    setState({
      ...DEFAULT_TOUR_STATE,
      isCompleted: true,
    });
  }, [onSkip]);

  // Terminer le tour
  const complete = useCallback(() => {
    onComplete?.();
    setState({
      ...DEFAULT_TOUR_STATE,
      isCompleted: true,
    });
  }, [onComplete]);

  // Reinitialiser
  const reset = useCallback(() => {
    setState(DEFAULT_TOUR_STATE);
  }, []);

  // Aller a une etape specifique
  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= steps.length) return;
      setState((prev) => ({
        ...prev,
        currentStep: stepIndex,
      }));
    },
    [steps.length]
  );

  // Mettre en pause
  const pause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  // Reprendre
  const resume = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: false,
    }));
  }, []);

  return useMemo(
    () => ({
      state,
      steps,
      currentStep,
      start,
      next,
      prev,
      skip,
      complete,
      reset,
      goToStep,
      pause,
      resume,
    }),
    [
      state,
      steps,
      currentStep,
      start,
      next,
      prev,
      skip,
      complete,
      reset,
      goToStep,
      pause,
      resume,
    ]
  );
}
