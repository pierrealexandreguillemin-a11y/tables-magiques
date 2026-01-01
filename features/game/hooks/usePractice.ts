'use client';

/**
 * usePractice - Hook React pour le mode Practice
 * ISO/IEC 25010 - Séparation logique métier / UI
 *
 * Ce hook encapsule toute la logique d'état du mode practice.
 * La page devient un simple orchestrateur UI.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  generateRandomQuestion,
  generateAllQuestionsForTable,
  shuffleArray,
  checkAnswer,
  updateStreak,
  calculateAccuracy,
  calculateBonus,
  checkPerfect,
} from './index';
import type {
  Question,
  PracticePhase,
  PracticeState,
  PracticeResult,
  UsePracticeReturn,
} from '@/types/game';

// Re-export types for backwards compatibility
export type { PracticePhase, PracticeState, PracticeResult, UsePracticeReturn };

// =============================================================================
// INITIAL STATE
// =============================================================================

const INITIAL_STATE: PracticeState = {
  phase: 'selection',
  selectedTable: null,
  questions: [],
  currentIndex: 0,
  userAnswer: '',
  score: 0,
  streak: 0,
  isCorrect: null,
  showFeedback: false,
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook pour gérer le mode practice
 */
export function usePractice(): UsePracticeReturn {
  const [state, setState] = useState<PracticeState>(INITIAL_STATE);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup du timeout au démontage
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // Actions
  const startGame = useCallback((table: number | null) => {
    let questions: Question[];

    if (table === null) {
      questions = Array.from({ length: 10 }, () => generateRandomQuestion());
    } else {
      questions = shuffleArray(generateAllQuestionsForTable(table));
    }

    setState({
      ...INITIAL_STATE,
      phase: 'playing',
      selectedTable: table,
      questions,
    });
  }, []);

  const handleNumberClick = useCallback((num: number) => {
    setState((prev) => {
      if (prev.showFeedback) return prev;
      if (prev.userAnswer.length >= 3) return prev;
      return { ...prev, userAnswer: prev.userAnswer + num.toString() };
    });
  }, []);

  const handleClear = useCallback(() => {
    setState((prev) => {
      if (prev.showFeedback) return prev;
      return { ...prev, userAnswer: prev.userAnswer.slice(0, -1) };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    setState((prev) => {
      if (prev.showFeedback || !prev.userAnswer) return prev;

      const currentQuestion = prev.questions[prev.currentIndex];
      if (!currentQuestion) return prev;

      const userNum = parseInt(prev.userAnswer, 10);
      const isCorrect = checkAnswer(userNum, currentQuestion.answer);

      return {
        ...prev,
        isCorrect,
        showFeedback: true,
        score: isCorrect ? prev.score + 1 : prev.score,
        streak: updateStreak(prev.streak, isCorrect),
      };
    });

    // Annuler le timeout précédent s'il existe
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setState((prev) => {
        const nextIndex = prev.currentIndex + 1;

        if (nextIndex >= prev.questions.length) {
          return { ...prev, phase: 'completed', showFeedback: false };
        }

        return {
          ...prev,
          currentIndex: nextIndex,
          userAnswer: '',
          isCorrect: null,
          showFeedback: false,
        };
      });
    }, 1500);
  }, []);

  const handleBack = useCallback(() => {
    // Nettoyer le timeout en cours si on revient à la sélection
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    setState(INITIAL_STATE);
  }, []);

  // Dérivés
  const currentQuestion = state.questions[state.currentIndex] ?? null;
  const canSubmit = state.userAnswer.length > 0 && !state.showFeedback;
  const isPlaying = state.phase === 'playing';
  const isSelection = state.phase === 'selection';
  const isCompleted = state.phase === 'completed';
  const progress =
    state.questions.length > 0
      ? ((state.currentIndex + 1) / state.questions.length) * 100
      : 0;

  // Résultat
  const result: PracticeResult | null = isCompleted
    ? {
        score: state.score,
        total: state.questions.length,
        accuracy: calculateAccuracy(state.score, state.questions.length),
        streak: state.streak,
        isPerfect: checkPerfect(state.score, state.questions.length),
        bonus: calculateBonus(
          state.streak,
          checkPerfect(state.score, state.questions.length)
        ),
      }
    : null;

  return {
    state,
    currentQuestion,
    result,
    startGame,
    handleNumberClick,
    handleClear,
    handleSubmit,
    handleBack,
    canSubmit,
    isPlaying,
    isSelection,
    isCompleted,
    progress,
  };
}
