/**
 * useProfile - Hook React Query pour profil utilisateur
 * ISO/IEC 25010 - Gestion donnees profil avec cache
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProfile, fetchSessionHistory } from '../api/profile';
import type { SessionHistoryFilters, ProfileData } from '@/types/profile';

// Query keys
export const profileKeys = {
  all: ['profile'] as const,
  data: () => [...profileKeys.all, 'data'] as const,
  history: (filters?: SessionHistoryFilters) =>
    [...profileKeys.all, 'history', filters] as const,
};

/**
 * Hook pour recuperer les donnees profil
 */
export function useProfile() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: profileKeys.data(),
    queryFn: fetchProfile,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  // Extraire le profil si succes
  const profile: ProfileData | null =
    data?.success === true ? data.profile : null;

  return {
    // Data
    profile,
    user: profile?.user ?? null,
    stats: profile?.stats ?? null,
    modeStats: profile?.modeStats ?? null,
    recentSessions: profile?.recentSessions ?? [],
    progress: profile?.progress ?? null,
    badgeCount: profile?.badgeCount ?? 0,

    // State
    isLoading,
    error: error?.message ?? (data?.success === false ? data.error : null),
    isError: !!error || data?.success === false,

    // Actions
    refresh: refetch,
  };
}

/**
 * Hook pour recuperer l'historique des sessions
 */
export function useSessionHistory(filters?: SessionHistoryFilters) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: profileKeys.history(filters),
    queryFn: () => fetchSessionHistory(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
  });

  // Extraire l'historique si succes
  const history = data?.success === true ? data.history : null;

  return {
    // Data
    sessions: history?.sessions ?? [],
    total: history?.total ?? 0,
    hasMore: history?.hasMore ?? false,

    // State
    isLoading,
    error: error?.message ?? (data?.success === false ? data.error : null),
    isError: !!error || data?.success === false,

    // Actions
    refresh: refetch,
  };
}

export default useProfile;
