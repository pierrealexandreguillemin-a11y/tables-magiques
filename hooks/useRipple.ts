/**
 * useRipple Hook - Effet ripple Material Design
 * ISO/IEC 25010 - Feedback tactile
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { RipplePosition, UseRippleResult } from '@/types/effects';

/**
 * Hook pour gerer les effets ripple
 */
export function useRipple(duration: number = 600): UseRippleResult {
  const [ripples, setRipples] = useState<RipplePosition[]>([]);
  const cleanupRef = useRef<NodeJS.Timeout | null>(null);

  const addRipple = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();

      // Position relative au centre du click
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple: RipplePosition = {
        x,
        y,
        id: `ripple-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Auto-cleanup apres animation
      if (cleanupRef.current) {
        clearTimeout(cleanupRef.current);
      }

      cleanupRef.current = setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, duration);
    },
    [duration]
  );

  const clearRipples = useCallback(() => {
    setRipples([]);
    if (cleanupRef.current) {
      clearTimeout(cleanupRef.current);
    }
  }, []);

  return {
    ripples,
    addRipple,
    clearRipples,
  };
}

export default useRipple;
