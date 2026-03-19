/**
 * useSaveScore - Persist game results to /api/scores
 * ISO/IEC 25010 - Data integrity: scores saved after each session
 */

'use client';

import { useCallback, useRef } from 'react';
import type { SaveScoreInput } from '@/types/game';

interface UseSaveScoreReturn {
  saveScore: (input: SaveScoreInput) => void;
}

/**
 * Hook to persist game scores. Fire-and-forget with deduplication.
 * Silently fails for guest users (401) — no error shown.
 */
export function useSaveScore(): UseSaveScoreReturn {
  const savingRef = useRef(false);
  const savedRef = useRef<string | null>(null);

  const saveScore = useCallback((input: SaveScoreInput) => {
    // Deduplicate: don't save the same result twice (e.g. on re-render)
    const key = `${input.mode}-${input.correct}-${input.total}-${input.streak ?? 0}`;
    if (savedRef.current === key) return;
    if (savingRef.current) return;

    savedRef.current = key;
    savingRef.current = true;

    fetch('/api/scores', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
      .catch(() => {
        // Silent fail — guest mode or network error
      })
      .finally(() => {
        savingRef.current = false;
      });
  }, []);

  return { saveScore };
}
