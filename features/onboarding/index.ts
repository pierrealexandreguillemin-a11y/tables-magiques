/**
 * Feature Onboarding - Tables Magiques
 * ISO/IEC 25010 - Encapsulation feature
 *
 * Tour guide premiere visite
 *
 * @example
 * import { OnboardingTour, useFirstVisit, useOnboarding } from '@/features/onboarding';
 */

// Storage (localStorage persistence)
export {
  isFirstVisit,
  markAsVisited,
  clearFirstVisit,
  isTourCompleted,
  markTourCompleted,
  clearTourCompleted,
  resetOnboardingState,
  getInitialFirstVisit,
  getInitialTourCompleted,
} from './storage/onboardingStorage';

// Hooks
export { useFirstVisit } from './hooks/useFirstVisit';
export { useOnboarding } from './hooks/useOnboarding';

// Components
export { OnboardingTour, TourTrigger } from './components/OnboardingTour';
export { TourHighlight } from './components/TourHighlight';
export { TourTooltip } from './components/TourTooltip';
export { TourProgress } from './components/TourProgress';
