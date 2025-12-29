/**
 * useHaptic - Haptic Feedback Hook
 * ISO/IEC 25010 - Tactile feedback for touch interactions
 *
 * Provides vibration feedback on mobile devices using the Vibration API.
 * Falls back gracefully on unsupported devices.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 */

'use client';

import { useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'error'
  | 'selection'
  | 'impact';

/**
 * Haptic patterns for different feedback types
 * Values in milliseconds
 */
export const HAPTIC_PATTERNS: Record<HapticPattern, number[]> = {
  /** Light tap - single short vibration */
  light: [10],
  /** Medium tap - slightly longer */
  medium: [20],
  /** Heavy tap - strong feedback */
  heavy: [40],
  /** Success - double pulse */
  success: [30, 50, 30],
  /** Error - triple pulse */
  error: [50, 30, 50, 30, 50],
  /** Selection - very light */
  selection: [5],
  /** Impact - single strong pulse */
  impact: [50],
};

export interface UseHapticReturn {
  /** Whether haptic feedback is supported */
  isSupported: boolean;
  /** Trigger haptic feedback with pattern name */
  trigger: (pattern?: HapticPattern) => void;
  /** Trigger haptic feedback with custom pattern */
  vibrate: (pattern: number | number[]) => void;
}

/**
 * Check if Vibration API is supported
 */
function checkSupport(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Hook for haptic feedback
 *
 * @example
 * ```tsx
 * const { trigger } = useHaptic();
 *
 * <button onClick={() => {
 *   trigger('success');
 *   handleSubmit();
 * }}>
 *   Submit
 * </button>
 * ```
 */
export function useHaptic(): UseHapticReturn {
  const { prefersReducedMotion } = useReducedMotion();
  const isSupported = checkSupport();

  /**
   * Trigger haptic feedback with custom pattern
   */
  const vibrate = useCallback(
    (pattern: number | number[]) => {
      // Skip if reduced motion preferred or not supported
      if (prefersReducedMotion || !isSupported) return;

      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently fail - some browsers throw on vibrate
      }
    },
    [prefersReducedMotion, isSupported]
  );

  /**
   * Trigger haptic feedback with named pattern
   */
  const trigger = useCallback(
    (pattern: HapticPattern = 'light') => {
      vibrate(HAPTIC_PATTERNS[pattern]);
    },
    [vibrate]
  );

  return {
    isSupported: isSupported && !prefersReducedMotion,
    trigger,
    vibrate,
  };
}

export default useHaptic;
