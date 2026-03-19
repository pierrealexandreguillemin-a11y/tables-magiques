/**
 * Tests - useSaveScore hook
 * Validates fire-and-forget score persistence with deduplication.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSaveScore } from '@/features/game/hooks/useSaveScore';

describe('useSaveScore', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('calls POST /api/scores with correct body', () => {
    const { result } = renderHook(() => useSaveScore());

    act(() => {
      result.current.saveScore({
        mode: 'practice',
        table: 7,
        correct: 8,
        total: 10,
        streak: 5,
      });
    });

    expect(fetch).toHaveBeenCalledWith('/api/scores', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'practice',
        table: 7,
        correct: 8,
        total: 10,
        streak: 5,
      }),
    });
  });

  it('deduplicates identical saves', () => {
    const { result } = renderHook(() => useSaveScore());

    const input = {
      mode: 'practice' as const,
      correct: 8,
      total: 10,
      streak: 3,
    };

    act(() => {
      result.current.saveScore(input);
      result.current.saveScore(input);
      result.current.saveScore(input);
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('allows different scores to be saved', () => {
    const { result } = renderHook(() => useSaveScore());

    act(() => {
      result.current.saveScore({
        mode: 'practice' as const,
        correct: 8,
        total: 10,
        streak: 3,
      });
    });

    // Different input has different dedup key
    act(() => {
      result.current.saveScore({
        mode: 'challenge' as const,
        correct: 15,
        total: 20,
        streak: 7,
      });
    });

    // Both should be called (different dedup keys)
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('silently fails on network error', () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useSaveScore());

    // Should not throw
    expect(() => {
      act(() => {
        result.current.saveScore({
          mode: 'practice' as const,
          correct: 8,
          total: 10,
        });
      });
    }).not.toThrow();
  });

  it('includes challenge-specific fields', () => {
    const { result } = renderHook(() => useSaveScore());

    act(() => {
      result.current.saveScore({
        mode: 'challenge',
        correct: 15,
        total: 20,
        streak: 8,
        timeRemaining: 45,
      });
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/scores',
      expect.objectContaining({
        body: expect.stringContaining('"timeRemaining":45'),
      })
    );
  });
});
