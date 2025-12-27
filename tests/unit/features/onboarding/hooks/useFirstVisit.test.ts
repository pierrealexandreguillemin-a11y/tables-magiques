/**
 * Tests unitaires useFirstVisit
 * ISO 29119 - Tests contre production
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFirstVisit } from '@/features/onboarding/hooks/useFirstVisit';
import { FIRST_VISIT_KEY, TOUR_COMPLETED_KEY } from '@/types/onboarding';

// =============================================================================
// MOCK LOCALSTORAGE
// =============================================================================

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// =============================================================================
// TESTS
// =============================================================================

describe('useFirstVisit', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('returns isFirstVisit=true when localStorage empty', () => {
      const { result } = renderHook(() => useFirstVisit());

      expect(result.current.isFirstVisit).toBe(true);
    });

    it('returns isFirstVisit=false after localStorage has been set', async () => {
      mockLocalStorage.setItem(FIRST_VISIT_KEY, 'true');

      const { result } = renderHook(() => useFirstVisit());

      // Wait for useEffect to run
      await vi.waitFor(() => {
        expect(result.current.isFirstVisit).toBe(false);
      });
    });

    it('returns hasTourCompleted=false when localStorage empty', () => {
      const { result } = renderHook(() => useFirstVisit());

      expect(result.current.hasTourCompleted).toBe(false);
    });

    it('returns hasTourCompleted=true when tour was completed', async () => {
      mockLocalStorage.setItem(TOUR_COMPLETED_KEY, 'true');

      const { result } = renderHook(() => useFirstVisit());

      await vi.waitFor(() => {
        expect(result.current.hasTourCompleted).toBe(true);
      });
    });
  });

  describe('markAsVisited', () => {
    it('sets isFirstVisit to false', () => {
      const { result } = renderHook(() => useFirstVisit());

      act(() => {
        result.current.markAsVisited();
      });

      expect(result.current.isFirstVisit).toBe(false);
    });

    it('persists to localStorage', () => {
      const { result } = renderHook(() => useFirstVisit());

      act(() => {
        result.current.markAsVisited();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        FIRST_VISIT_KEY,
        'true'
      );
    });
  });

  describe('markTourCompleted', () => {
    it('sets hasTourCompleted to true', () => {
      const { result } = renderHook(() => useFirstVisit());

      act(() => {
        result.current.markTourCompleted();
      });

      expect(result.current.hasTourCompleted).toBe(true);
    });

    it('also marks as visited', () => {
      const { result } = renderHook(() => useFirstVisit());

      act(() => {
        result.current.markTourCompleted();
      });

      expect(result.current.isFirstVisit).toBe(false);
    });

    it('persists tour completed to localStorage', () => {
      const { result } = renderHook(() => useFirstVisit());

      act(() => {
        result.current.markTourCompleted();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        TOUR_COMPLETED_KEY,
        'true'
      );
    });
  });

  describe('reset', () => {
    it('resets isFirstVisit to true', () => {
      const { result } = renderHook(() => useFirstVisit());

      act(() => {
        result.current.markAsVisited();
      });
      expect(result.current.isFirstVisit).toBe(false);

      act(() => {
        result.current.reset();
      });
      expect(result.current.isFirstVisit).toBe(true);
    });

    it('resets hasTourCompleted to false', () => {
      const { result } = renderHook(() => useFirstVisit());

      act(() => {
        result.current.markTourCompleted();
      });
      expect(result.current.hasTourCompleted).toBe(true);

      act(() => {
        result.current.reset();
      });
      expect(result.current.hasTourCompleted).toBe(false);
    });

    it('removes keys from localStorage', () => {
      const { result } = renderHook(() => useFirstVisit());

      act(() => {
        result.current.reset();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(FIRST_VISIT_KEY);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        TOUR_COMPLETED_KEY
      );
    });
  });

  describe('Persistence', () => {
    it('maintains state across hook instances', () => {
      const { result: result1 } = renderHook(() => useFirstVisit());

      act(() => {
        result1.current.markAsVisited();
      });

      // Simulate new component mount
      mockLocalStorage.getItem.mockReturnValue('true');
      renderHook(() => useFirstVisit());

      // New instance should read from localStorage
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(FIRST_VISIT_KEY);
    });
  });
});
