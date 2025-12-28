/**
 * usePracticeUI Hook
 * ISO/IEC 25010 - SRP: Practice UI state only
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToastContext } from '@/components/effects';
import { useAnnouncer } from '@/hooks/useAnnouncer';
import { useSound } from '@/hooks/useSound';
import type { PracticeResult } from '@/types/game';

interface UsePracticeUIProps {
  showFeedback: boolean;
  isCorrect: boolean | null;
  score: number;
  streak: number;
  isCompleted: boolean;
  result: PracticeResult | null;
}

export function usePracticeUI({
  showFeedback,
  isCorrect,
  score,
  streak,
  isCompleted,
  result,
}: UsePracticeUIProps) {
  const { success, error: toastError } = useToastContext();
  const { announcePolite, announceAssertive } = useAnnouncer();
  const { play: playSound } = useSound();
  const [explosionVisible, setExplosionVisible] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    if (showFeedback && isCorrect !== null) {
      if (isCorrect) {
        playSound('correct');
        success('Bravo !');
        announcePolite(`Correct ! Score: ${score}`);
        if (streak >= 5) {
          const showTimer = setTimeout(() => setExplosionVisible(true), 0);
          const hideTimer = setTimeout(() => setExplosionVisible(false), 2500);
          return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
          };
        }
      } else {
        playSound('incorrect');
        toastError('Essaie encore !');
        announceAssertive('Incorrect. Essaie encore !');
      }
    }
    return undefined;
  }, [
    showFeedback,
    isCorrect,
    score,
    streak,
    success,
    toastError,
    announcePolite,
    announceAssertive,
    playSound,
  ]);

  useEffect(() => {
    if (isCompleted && result) {
      playSound('levelUp');
      announcePolite(
        `Session terminée ! Score: ${result.score} sur ${result.total}`
      );
    }
  }, [isCompleted, result, announcePolite, playSound]);

  const enableGuestMode = useCallback(() => setIsGuestMode(true), []);

  return { explosionVisible, isGuestMode, enableGuestMode };
}
