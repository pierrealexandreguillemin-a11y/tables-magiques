/**
 * Profile Feature - Barrel Export
 * ISO/IEC 25010 - Feature module encapsulation
 */

// Components
export {
  ProfilePage,
  StatsCard,
  SessionHistory,
  ProgressChart,
} from './components';
export type {
  StatsCardProps,
  SessionHistoryProps,
  ProgressChartProps,
} from './components';

// React Query Hooks
export { useProfile, useSessionHistory, profileKeys } from './hooks/useProfile';

// API
export { fetchProfile, fetchSessionHistory } from './api/profile';
export type {
  ProfileApiResponse,
  SessionHistoryApiResponse,
} from './api/profile';

// Re-export types from source of truth
export type {
  UserStats,
  ModeStats,
  SessionSummary,
  SessionHistoryFilters,
  SessionHistoryResponse,
  TableProgress,
  ProgressOverview,
  ProfileData,
  GetProfileResponse,
  GetSessionHistoryResponse,
} from '@/types/profile';
