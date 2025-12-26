/**
 * useBadges - Hook React Query pour badges
 * ISO/IEC 25010 - Data fetching avec cache
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBadges,
  checkPracticeBadges,
  checkChallengeBadgesApi,
} from '../api/badges';
import type { NewBadge } from '../api/badges';
import type { PracticeSessionStats } from '@/types/badge';
import type { ChallengeResult } from '@/types/game';

// Query keys
export const badgesKeys = {
  all: ['badges'] as const,
  list: () => [...badgesKeys.all, 'list'] as const,
};

/**
 * Hook pour recuperer et gerer les badges
 */
export function useBadges() {
  const queryClient = useQueryClient();

  // Query: liste des badges
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: badgesKeys.list(),
    queryFn: fetchBadges,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation: check badges practice
  const checkPracticeMutation = useMutation({
    mutationFn: checkPracticeBadges,
    onSuccess: () => {
      // Invalider le cache pour recharger les badges
      queryClient.invalidateQueries({ queryKey: badgesKeys.all });
    },
  });

  // Mutation: check badges challenge
  const checkChallengeMutation = useMutation({
    mutationFn: checkChallengeBadgesApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: badgesKeys.all });
    },
  });

  return {
    // Data
    badges: data?.badges ?? [],
    earnedCount: data?.earnedCount ?? 0,
    totalCount: data?.totalCount ?? 0,

    // State
    isLoading,
    error: error?.message ?? null,

    // Actions
    refetch,
    checkPracticeBadges: async (
      stats: PracticeSessionStats
    ): Promise<NewBadge[]> => {
      const result = await checkPracticeMutation.mutateAsync(stats);
      return result.newBadges;
    },
    checkChallengeBadges: async (
      result: ChallengeResult
    ): Promise<NewBadge[]> => {
      const response = await checkChallengeMutation.mutateAsync(result);
      return response.newBadges;
    },

    // Mutation states
    isCheckingBadges:
      checkPracticeMutation.isPending || checkChallengeMutation.isPending,
  };
}

/**
 * Hook pour verifier les badges d'une session (practice ou challenge)
 * Usage simplifie pour les pages de jeu
 */
export function useCheckBadges() {
  const { checkPracticeBadges, checkChallengeBadges, isCheckingBadges } =
    useBadges();

  return {
    checkPractice: checkPracticeBadges,
    checkChallenge: checkChallengeBadges,
    isChecking: isCheckingBadges,
  };
}
