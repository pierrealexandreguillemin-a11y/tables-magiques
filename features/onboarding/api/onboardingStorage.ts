/**
 * Onboarding Storage API - Tables Magiques
 * ISO/IEC 25010 - Separation of Concerns
 *
 * Module de persistance localStorage pour l'onboarding
 * Responsabilite unique: lecture/ecriture/validation storage
 */

import { FIRST_VISIT_KEY, TOUR_COMPLETED_KEY } from '@/types/onboarding';

// =============================================================================
// FIRST VISIT
// =============================================================================

/**
 * Check if this is the first visit (SSR-safe)
 */
export function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(FIRST_VISIT_KEY) !== 'true';
}

/**
 * Mark as visited in localStorage
 */
export function markAsVisited(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FIRST_VISIT_KEY, 'true');
}

/**
 * Clear first visit flag
 */
export function clearFirstVisit(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FIRST_VISIT_KEY);
}

// =============================================================================
// TOUR COMPLETED
// =============================================================================

/**
 * Check if tour has been completed (SSR-safe)
 */
export function isTourCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
}

/**
 * Mark tour as completed in localStorage
 * Also marks as visited
 */
export function markTourCompleted(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
  localStorage.setItem(FIRST_VISIT_KEY, 'true');
}

/**
 * Clear tour completed flag
 */
export function clearTourCompleted(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOUR_COMPLETED_KEY);
}

// =============================================================================
// RESET
// =============================================================================

/**
 * Reset all onboarding state
 */
export function resetOnboardingState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FIRST_VISIT_KEY);
  localStorage.removeItem(TOUR_COMPLETED_KEY);
}

// =============================================================================
// INITIAL STATE GETTERS (for lazy initialization)
// =============================================================================

/**
 * Get initial first visit state (for useState lazy init)
 */
export function getInitialFirstVisit(): boolean {
  return isFirstVisit();
}

/**
 * Get initial tour completed state (for useState lazy init)
 */
export function getInitialTourCompleted(): boolean {
  return isTourCompleted();
}
