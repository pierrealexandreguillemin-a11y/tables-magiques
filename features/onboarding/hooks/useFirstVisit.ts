'use client';

/**
 * useFirstVisit Hook - Tables Magiques
 * ISO/IEC 25010 - Hook logique metier
 *
 * Responsabilite unique: etat React de premiere visite
 * Delegue la persistance a api/onboardingStorage.ts
 */

import { useState, useCallback, useMemo } from 'react';
import type { UseFirstVisitResult } from '@/types/onboarding';
import {
  getInitialFirstVisit,
  getInitialTourCompleted,
  markAsVisited as apiMarkAsVisited,
  markTourCompleted as apiMarkTourCompleted,
  resetOnboardingState,
} from '../api/onboardingStorage';

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook detection premiere visite
 * Delegue la persistance a api/onboardingStorage.ts
 */
export function useFirstVisit(): UseFirstVisitResult {
  // Initialisation paresseuse pour eviter setState dans useEffect
  const [isFirstVisit, setIsFirstVisit] = useState(getInitialFirstVisit);
  const [hasTourCompleted, setHasTourCompleted] = useState(
    getInitialTourCompleted
  );

  // Marquer comme visite
  const markAsVisited = useCallback(() => {
    apiMarkAsVisited();
    setIsFirstVisit(false);
  }, []);

  // Marquer tour complete
  const markTourCompleted = useCallback(() => {
    apiMarkTourCompleted();
    setHasTourCompleted(true);
    setIsFirstVisit(false);
  }, []);

  // Reset (pour debug/tests)
  const reset = useCallback(() => {
    resetOnboardingState();
    setIsFirstVisit(true);
    setHasTourCompleted(false);
  }, []);

  return useMemo(
    () => ({
      isFirstVisit,
      hasTourCompleted,
      markAsVisited,
      markTourCompleted,
      reset,
    }),
    [isFirstVisit, hasTourCompleted, markAsVisited, markTourCompleted, reset]
  );
}
