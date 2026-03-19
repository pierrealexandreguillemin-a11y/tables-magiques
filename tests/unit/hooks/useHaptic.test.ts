/**
 * Tests - useHaptic Hook
 * Validates haptic feedback patterns and reduced motion integration.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHaptic, HAPTIC_PATTERNS } from '@/hooks/useHaptic';
import type { HapticPattern } from '@/hooks/useHaptic';

describe('useHaptic', () => {
  const originalMatchMedia = window.matchMedia;
  const originalNavigator = Object.getOwnPropertyDescriptor(
    global,
    'navigator'
  );

  const mockMatchMedia = (reducedMotion: boolean) => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches:
        query === '(prefers-reduced-motion: reduce)' ? reducedMotion : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  };

  const mockVibrate = (supported: boolean) => {
    if (supported) {
      Object.defineProperty(navigator, 'vibrate', {
        value: vi.fn(),
        writable: true,
        configurable: true,
      });
    }
  };

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', originalNavigator);
    }
    vi.restoreAllMocks();
  });

  describe('HAPTIC_PATTERNS', () => {
    it('defines all pattern types', () => {
      const expectedPatterns: HapticPattern[] = [
        'light',
        'medium',
        'heavy',
        'success',
        'error',
        'selection',
        'impact',
      ];
      expectedPatterns.forEach((pattern) => {
        expect(HAPTIC_PATTERNS[pattern]).toBeDefined();
        expect(Array.isArray(HAPTIC_PATTERNS[pattern])).toBe(true);
      });
    });

    it('light is shorter than heavy', () => {
      const lightTotal = HAPTIC_PATTERNS.light.reduce((a, b) => a + b, 0);
      const heavyTotal = HAPTIC_PATTERNS.heavy.reduce((a, b) => a + b, 0);
      expect(lightTotal).toBeLessThan(heavyTotal);
    });

    it('error has more pulses than success', () => {
      expect(HAPTIC_PATTERNS.error.length).toBeGreaterThan(
        HAPTIC_PATTERNS.success.length
      );
    });

    it('selection is the lightest pattern', () => {
      const selectionTotal = HAPTIC_PATTERNS.selection.reduce(
        (a, b) => a + b,
        0
      );
      Object.entries(HAPTIC_PATTERNS).forEach(([name, pattern]) => {
        if (name !== 'selection') {
          const total = pattern.reduce((a, b) => a + b, 0);
          expect(selectionTotal).toBeLessThanOrEqual(total);
        }
      });
    });
  });

  describe('with vibration support', () => {
    it('reports supported when vibrate API exists and no reduced motion', () => {
      mockMatchMedia(false);
      mockVibrate(true);

      const { result } = renderHook(() => useHaptic());
      expect(result.current.isSupported).toBe(true);
    });

    it('trigger calls navigator.vibrate with correct pattern', () => {
      mockMatchMedia(false);
      mockVibrate(true);

      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.trigger('success');
      });

      expect(navigator.vibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.success);
    });

    it('trigger defaults to light pattern', () => {
      mockMatchMedia(false);
      mockVibrate(true);

      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.trigger();
      });

      expect(navigator.vibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.light);
    });

    it('vibrate accepts custom pattern', () => {
      mockMatchMedia(false);
      mockVibrate(true);

      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.vibrate([100, 50, 100]);
      });

      expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 100]);
    });
  });

  describe('with reduced motion', () => {
    it('reports not supported when reduced motion is active', () => {
      mockMatchMedia(true);
      mockVibrate(true);

      const { result } = renderHook(() => useHaptic());
      expect(result.current.isSupported).toBe(false);
    });

    it('does not vibrate when reduced motion is active', () => {
      mockMatchMedia(true);
      mockVibrate(true);

      const { result } = renderHook(() => useHaptic());

      act(() => {
        result.current.trigger('heavy');
      });

      expect(navigator.vibrate).not.toHaveBeenCalled();
    });
  });
});
