/**
 * Tests Unitaires - useBadges Hook
 * ISO/IEC 29119 - TDD: Tests hook React Query badges
 */

import { describe, it, expect } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import {
  useBadges,
  useCheckBadges,
  badgesKeys,
} from '@/features/badges/hooks/useBadges';
import { renderQueryHook, createTestQueryClient } from '../../../../utils';
import type { PracticeSessionStats } from '@/types/badge';
import type { ChallengeResult } from '@/types/game';
import { EARNED_BADGES_FIXTURE } from '../../../../fixtures';

// MSW server is started globally in tests/setup.ts

describe('useBadges Hook', () => {
  describe('badgesKeys', () => {
    it('retourne les bonnes query keys', () => {
      expect(badgesKeys.all).toEqual(['badges']);
      expect(badgesKeys.list()).toEqual(['badges', 'list']);
    });
  });

  describe('Initial state', () => {
    it('demarre en loading', () => {
      const { result } = renderQueryHook(() => useBadges());

      expect(result.current.isLoading).toBe(true);
    });

    it('badges vide initialement', () => {
      const { result } = renderQueryHook(() => useBadges());

      expect(result.current.badges).toEqual([]);
    });

    it('compteurs a 0 initialement', () => {
      const { result } = renderQueryHook(() => useBadges());

      expect(result.current.earnedCount).toBe(0);
      expect(result.current.totalCount).toBe(0);
    });
  });

  describe('Loaded state', () => {
    it('charge les badges', async () => {
      const { result } = renderQueryHook(() => useBadges());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.badges.length).toBe(EARNED_BADGES_FIXTURE.length);
    });

    it('retourne earnedCount correct', async () => {
      const { result } = renderQueryHook(() => useBadges());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.earnedCount).toBe(EARNED_BADGES_FIXTURE.length);
    });

    it('retourne totalCount correct', async () => {
      const { result } = renderQueryHook(() => useBadges());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.totalCount).toBe(13);
    });
  });

  describe('checkPracticeBadges', () => {
    const practiceStats: PracticeSessionStats = {
      correctAnswers: 10,
      totalQuestions: 12,
      currentStreak: 5,
      maxStreak: 8,
    };

    it('retourne nouveaux badges', async () => {
      const queryClient = createTestQueryClient();
      const { result } = renderQueryHook(() => useBadges(), { queryClient });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newBadges: unknown[] = [];
      await act(async () => {
        newBadges = await result.current.checkPracticeBadges(practiceStats);
      });

      expect(Array.isArray(newBadges)).toBe(true);
      expect(newBadges.length).toBeGreaterThan(0);
    });

    it('isCheckingBadges false apres mutation', async () => {
      const { result } = renderQueryHook(() => useBadges());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.checkPracticeBadges(practiceStats);
      });

      // After mutation completes, isCheckingBadges should be false
      expect(result.current.isCheckingBadges).toBe(false);
    });
  });

  describe('checkChallengeBadges', () => {
    const challengeResult: ChallengeResult = {
      correctAnswers: 15,
      totalQuestions: 20,
      accuracy: 0.75,
      timeBonus: 50,
      streakBonus: 30,
      totalScore: 200,
    };

    it('retourne nouveaux badges', async () => {
      const queryClient = createTestQueryClient();
      const { result } = renderQueryHook(() => useBadges(), { queryClient });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newBadges: unknown[] = [];
      await act(async () => {
        newBadges = await result.current.checkChallengeBadges(challengeResult);
      });

      expect(Array.isArray(newBadges)).toBe(true);
      expect(newBadges.length).toBeGreaterThan(0);
    });
  });

  describe('refetch', () => {
    it('refetch recharge les badges', async () => {
      const queryClient = createTestQueryClient();
      const { result } = renderQueryHook(() => useBadges(), { queryClient });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.badges.length).toBe(EARNED_BADGES_FIXTURE.length);
    });
  });
});

describe('useCheckBadges Hook', () => {
  it('expose checkPractice', async () => {
    const { result } = renderQueryHook(() => useCheckBadges());

    // Wait for hook to be ready
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(typeof result.current.checkPractice).toBe('function');
  });

  it('expose checkChallenge', async () => {
    const { result } = renderQueryHook(() => useCheckBadges());

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(typeof result.current.checkChallenge).toBe('function');
  });

  it('expose isChecking', async () => {
    const { result } = renderQueryHook(() => useCheckBadges());

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(typeof result.current.isChecking).toBe('boolean');
  });
});
