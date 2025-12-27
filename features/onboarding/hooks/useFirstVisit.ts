'use client';

import { useState, useCallback, useMemo } from 'react';
import type { UseFirstVisitResult } from '@/types/onboarding';
import { FIRST_VISIT_KEY, TOUR_COMPLETED_KEY } from '@/types/onboarding';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Lit l'etat initial depuis localStorage (SSR-safe)
 */
function getInitialFirstVisit(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(FIRST_VISIT_KEY) !== 'true';
}

function getInitialTourCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook detection premiere visite
 * Utilise localStorage pour persister l'etat
 */
export function useFirstVisit(): UseFirstVisitResult {
  // Initialisation paresseuse pour eviter setState dans useEffect
  const [isFirstVisit, setIsFirstVisit] = useState(getInitialFirstVisit);
  const [hasTourCompleted, setHasTourCompleted] = useState(
    getInitialTourCompleted
  );

  // Marquer comme visite
  const markAsVisited = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    setIsFirstVisit(false);
  }, []);

  // Marquer tour complete
  const markTourCompleted = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    setHasTourCompleted(true);
    // Marquer aussi comme visite
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    setIsFirstVisit(false);
  }, []);

  // Reset (pour debug/tests)
  const reset = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(FIRST_VISIT_KEY);
    localStorage.removeItem(TOUR_COMPLETED_KEY);
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
