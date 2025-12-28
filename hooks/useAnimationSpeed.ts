/**
 * useAnimationSpeed - Animation Speed Preference Hook
 * ISO/IEC 25010 - Applies animation speed setting via CSS custom properties
 *
 * Reads animation speed from localStorage settings and applies
 * --animation-speed-multiplier CSS variable to the document root.
 * This allows all animations to respect user preference.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { SETTINGS_STORAGE_KEY, DEFAULT_ACCESSIBILITY } from '@/types/settings';

/**
 * Get animation speed from stored settings
 */
function getStoredAnimationSpeed(): number {
  if (typeof window === 'undefined') return 1.0;

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.settings?.accessibility?.animationSpeed ?? 1.0;
    }
  } catch {
    // Ignore parse errors
  }

  return DEFAULT_ACCESSIBILITY.animationSpeed;
}

/**
 * Apply animation speed to CSS custom properties
 */
function applyAnimationSpeed(speed: number): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Base timing values in ms (from tokens.css)
  const baseTiming = {
    instant: 100,
    fast: 200,
    normal: 400,
    celebration: 800,
    dramatic: 1200,
  };

  // Apply inverted multiplier (higher speed = shorter duration)
  const multiplier = 1 / speed;

  root.style.setProperty('--animation-speed', speed.toString());
  root.style.setProperty(
    '--timing-instant',
    `${Math.round(baseTiming.instant * multiplier)}ms`
  );
  root.style.setProperty(
    '--timing-fast',
    `${Math.round(baseTiming.fast * multiplier)}ms`
  );
  root.style.setProperty(
    '--timing-normal',
    `${Math.round(baseTiming.normal * multiplier)}ms`
  );
  root.style.setProperty(
    '--timing-celebration',
    `${Math.round(baseTiming.celebration * multiplier)}ms`
  );
  root.style.setProperty(
    '--timing-dramatic',
    `${Math.round(baseTiming.dramatic * multiplier)}ms`
  );
}

export interface UseAnimationSpeedReturn {
  /** Current animation speed (0.5-2.0) */
  speed: number;
  /** Update animation speed */
  setSpeed: (speed: number) => void;
}

/**
 * Hook to manage animation speed preference
 *
 * @example
 * ```tsx
 * const { speed } = useAnimationSpeed();
 * // CSS will have --animation-speed and adjusted timing variables
 * ```
 */
export function useAnimationSpeed(): UseAnimationSpeedReturn {
  // Lazy initialization from storage
  const [speed, setSpeedState] = useState<number>(() => {
    const stored = getStoredAnimationSpeed();
    return stored;
  });

  // Apply animation speed on mount
  useEffect(() => {
    applyAnimationSpeed(speed);
  }, [speed]);

  // Listen for storage changes (from settings page)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const newSpeed = parsed?.settings?.accessibility?.animationSpeed;
          if (typeof newSpeed === 'number') {
            setSpeedState(newSpeed);
            applyAnimationSpeed(newSpeed);
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    // Also listen for custom event for same-window updates
    const handleSpeedChange = (e: Event) => {
      if (e instanceof CustomEvent && typeof e.detail?.speed === 'number') {
        setSpeedState(e.detail.speed);
        applyAnimationSpeed(e.detail.speed);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('animationSpeedChange', handleSpeedChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('animationSpeedChange', handleSpeedChange);
    };
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
    applyAnimationSpeed(newSpeed);

    // Dispatch custom event for same-window listeners
    window.dispatchEvent(
      new CustomEvent('animationSpeedChange', { detail: { speed: newSpeed } })
    );
  }, []);

  return { speed, setSpeed };
}

export default useAnimationSpeed;
