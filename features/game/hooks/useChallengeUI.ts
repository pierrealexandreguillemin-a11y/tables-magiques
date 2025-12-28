/**
 * useChallengeUI Hook
 * ISO/IEC 25010 - SRP: Challenge UI state only
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useToastContext } from '@/components/effects';
import { useAnnouncer } from '@/hooks/useAnnouncer';
import { useSound } from '@/hooks/useSound';

interface FeedbackState {
  show: boolean;
  isCorrect: boolean | null;
  explosion: boolean;
}

interface UseChallengeUIProps {
  questionsAnswered: number;
  score: number;
  streak: number;
  isPlaying: boolean;
  isGameOver: boolean;
  result: { totalScore: number } | null;
}

export function useChallengeUI({
  questionsAnswered,
  score,
  streak,
  isPlaying,
  isGameOver,
  result,
}: UseChallengeUIProps) {
  const { success, error: toastError } = useToastContext();
  const { announcePolite, announceAssertive } = useAnnouncer();
  const { play: playSound } = useSound();
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    isCorrect: null,
    explosion: false,
  });
  const [isGuestMode, setIsGuestMode] = useState(false);
  const prevQuestionsAnswered = useRef(questionsAnswered);

  useEffect(() => {
    if (questionsAnswered > prevQuestionsAnswered.current && isPlaying) {
      const isCorrect = streak > 0;
      const shouldExplode = isCorrect && streak >= 5;

      const stateTimer = setTimeout(
        () => setFeedback({ show: true, isCorrect, explosion: shouldExplode }),
        0
      );

      if (isCorrect) {
        playSound('correct');
        success('Bravo !');
        announcePolite(`Correct ! Score: ${score}`);
      } else {
        playSound('incorrect');
        toastError('Essaie encore !');
        announceAssertive('Incorrect');
      }

      const feedbackTimer = setTimeout(
        () => setFeedback((prev) => ({ ...prev, show: false })),
        500
      );
      const explosionTimer = shouldExplode
        ? setTimeout(
            () => setFeedback((prev) => ({ ...prev, explosion: false })),
            2500
          )
        : null;

      prevQuestionsAnswered.current = questionsAnswered;
      return () => {
        clearTimeout(stateTimer);
        clearTimeout(feedbackTimer);
        if (explosionTimer) clearTimeout(explosionTimer);
      };
    }
    prevQuestionsAnswered.current = questionsAnswered;
    return undefined;
  }, [
    questionsAnswered,
    score,
    streak,
    isPlaying,
    success,
    toastError,
    announcePolite,
    announceAssertive,
    playSound,
  ]);

  useEffect(() => {
    if (isGameOver && result) {
      playSound('levelUp');
      announcePolite(`Challenge terminé ! Score: ${result.totalScore} points`);
    }
  }, [isGameOver, result, announcePolite, playSound]);

  const enableGuestMode = useCallback(() => setIsGuestMode(true), []);

  return { feedback, isGuestMode, enableGuestMode };
}
