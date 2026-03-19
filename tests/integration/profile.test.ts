/**
 * Integration Tests - Profile (useProfile + /api/profile)
 */

import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { waitFor } from '@testing-library/react';
import {
  useProfile,
  useSessionHistory,
} from '@/features/profile/hooks/useProfile';
import { renderQueryHook } from '../utils/query-test-utils';
import { server } from './setup';

describe('useProfile integration', () => {
  it('fetches and extracts profile data', async () => {
    const { result } = renderQueryHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user?.username).toBe('testuser');
    expect(result.current.stats?.totalGames).toBe(42);
    expect(result.current.stats?.bestStreak).toBe(12);
    expect(result.current.modeStats?.practice.averageAccuracy).toBe(92);
    expect(result.current.badgeCount).toBe(5);
    expect(result.current.recentSessions).toHaveLength(1);
  });

  it('handles 401 as error', async () => {
    server.use(
      http.get('/api/profile', () => {
        return HttpResponse.json(
          { success: false, error: 'Non authentifie' },
          { status: 401 }
        );
      })
    );

    const { result } = renderQueryHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.stats).toBeNull();
  });

  it('exposes progress data with table mastery', async () => {
    const { result } = renderQueryHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const tables = result.current.progress?.tables;
    expect(tables).toHaveLength(10);
    expect(tables?.filter((t) => t.mastered)).toHaveLength(3);
  });
});

describe('useSessionHistory integration', () => {
  it('fetches session history with default filters', async () => {
    const { result } = renderQueryHook(() => useSessionHistory());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sessions.length).toBeGreaterThan(0);
    expect(result.current.total).toBe(42);
    expect(result.current.hasMore).toBe(true);
  });

  it('respects limit filter', async () => {
    const { result } = renderQueryHook(() => useSessionHistory({ limit: 2 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sessions.length).toBeLessThanOrEqual(2);
  });
});
