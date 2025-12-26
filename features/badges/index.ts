/**
 * Badges Feature - Barrel Export
 * ISO/IEC 25010 - Feature module encapsulation
 */

// Hooks / Logic
export {
  checkPracticeBadges,
  checkChallengeBadges,
  getNewBadges,
} from './hooks/badges';

// React Query Hooks
export { useBadges, useCheckBadges, badgesKeys } from './hooks/useBadges';

// API
export {
  fetchBadges,
  checkPracticeBadges as checkPracticeBadgesApi,
} from './api/badges';
export type {
  BadgeWithStatus,
  NewBadge,
  GetBadgesResponse,
  CheckBadgesResponse,
} from './api/badges';

// Components
export { BadgeCard } from './components/BadgeCard';
export { BadgeCollection } from './components/BadgeCollection';
export { BadgeUnlockNotification } from './components/BadgeUnlockNotification';

// Re-export types from source of truth
export type {
  BadgeDefinition,
  EarnedBadge,
  PracticeSessionStats,
  UserBadgeStats,
  BadgeUnlockResult,
} from '@/types/badge';

export {
  PRACTICE_BADGES,
  CHALLENGE_BADGES,
  ALL_BADGES,
  getBadgeById,
} from '@/config/badges';
