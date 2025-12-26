/**
 * useChallenge - Hook React pour le mode Challenge
 * ISO/IEC 25010 - Séparation logique métier / UI
 *
 * Ce hook encapsule toute la logique d'état du mode challenge.
 * La page devient un simple orchestrateur UI.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  createChallengeState,
  startChallenge,
  tickGlobalTimer,
  tickQuestionTimer,
  answerQuestion as answerQuestionLogic,
  calculateChallengeScore,
  isGameOver,
} from './challenge';
import type {
  ChallengeState,
  ChallengeResult,
  ChallengeConfig,
  UseChallengeReturn,
} from '@/types/game';

// Re-export type pour compatibilité imports existants
export type { UseChallengeReturn } from '@/types/game';

/**
 * Hook pour gérer le mode challenge
 * @param config Configuration optionnelle du challenge
 */
export function useChallenge(
  config?: Partial<ChallengeConfig>
): UseChallengeReturn {
  const [state, setState] = useState<ChallengeState>(() =>
    createChallengeState(config)
  );
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<ChallengeResult | null>(null);

  // Timer effect - tick chaque seconde quand en playing
  useEffect(() => {
    if (state.phase !== 'playing') return;

    const interval = setInterval(() => {
      setState((prev) => {
        let newState = tickGlobalTimer(prev);
        newState = tickQuestionTimer(newState);

        if (isGameOver(newState)) {
          setResult(calculateChallengeScore(newState));
        }

        return newState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.phase]);

  // Actions
  const start = useCallback(() => {
    const newState = startChallenge(createChallengeState(config));
    setState(newState);
    setUserAnswer('');
    setResult(null);
  }, [config]);

  const appendDigit = useCallback((digit: number) => {
    setUserAnswer((prev) => {
      if (prev.length >= 3) return prev;
      return prev + digit.toString();
    });
  }, []);

  const deleteDigit = useCallback(() => {
    setUserAnswer((prev) => prev.slice(0, -1));
  }, []);

  const answerQuestion = useCallback(() => {
    if (!userAnswer) return;

    const answer = parseInt(userAnswer, 10);
    setState((prev) => answerQuestionLogic(prev, answer));
    setUserAnswer('');
  }, [userAnswer]);

  const replay = useCallback(() => {
    setState(createChallengeState(config));
    setUserAnswer('');
    setResult(null);
  }, [config]);

  // Dérivés
  const canSubmit = userAnswer.length > 0;
  const isPlaying = state.phase === 'playing';
  const isReady = state.phase === 'ready';
  const isOver = state.phase === 'game_over';

  return {
    state,
    userAnswer,
    result,
    start,
    answerQuestion,
    appendDigit,
    deleteDigit,
    replay,
    canSubmit,
    isPlaying,
    isReady,
    isGameOver: isOver,
  };
}
