/**
 * Challenge Mode Logic - Tables Magiques
 * ISO/IEC 25010 - Logique mode chronometré
 *
 * Mode Challenge: 3 minutes total, 5 secondes par question
 *
 * NOTE: Ce module CONSOMME les types définis dans @/types/game
 * Il ne définit PAS de types (principe SRP)
 */

import { generateRandomQuestion } from './questions';
import { updateStreak } from './scoring';
import type {
  ChallengeConfig,
  ChallengeState,
  ChallengeResult,
} from '@/types/game';
import { DEFAULT_GAME_CONFIG } from '@/types/game';

// Re-export des types pour compatibilité avec les imports existants
export type {
  ChallengeConfig,
  ChallengeState,
  ChallengeResult,
} from '@/types/game';
export type { ChallengePhase } from '@/types/game';

/**
 * Cree un etat initial pour le mode challenge
 */
export function createChallengeState(
  config: Partial<ChallengeConfig> = {}
): ChallengeState {
  const fullConfig = { ...DEFAULT_GAME_CONFIG.challenge, ...config };

  return {
    phase: 'ready',
    globalTimeRemaining: fullConfig.globalTime,
    questionTimeRemaining: fullConfig.questionTime,
    score: 0,
    questionsAnswered: 0,
    streak: 0,
    currentQuestion: null,
    config: fullConfig,
  };
}

/**
 * Demarre le challenge
 */
export function startChallenge(state: ChallengeState): ChallengeState {
  if (state.phase !== 'ready') {
    return state;
  }

  return {
    ...state,
    phase: 'playing',
    currentQuestion: generateRandomQuestion(),
    questionTimeRemaining: state.config.questionTime,
  };
}

/**
 * Decremente le timer global (appele chaque seconde)
 */
export function tickGlobalTimer(state: ChallengeState): ChallengeState {
  if (state.phase !== 'playing') {
    return state;
  }

  const newTime = Math.max(0, state.globalTimeRemaining - 1);

  if (newTime === 0) {
    return {
      ...state,
      globalTimeRemaining: 0,
      phase: 'game_over',
    };
  }

  return {
    ...state,
    globalTimeRemaining: newTime,
  };
}

/**
 * Decremente le timer question (appele chaque seconde)
 */
export function tickQuestionTimer(state: ChallengeState): ChallengeState {
  if (state.phase !== 'playing') {
    return state;
  }

  const newTime = state.questionTimeRemaining - 1;

  if (newTime <= 0) {
    // Auto-skip: temps ecoule pour cette question
    return {
      ...state,
      questionsAnswered: state.questionsAnswered + 1,
      streak: 0,
      questionTimeRemaining: state.config.questionTime,
      currentQuestion: generateRandomQuestion(),
    };
  }

  return {
    ...state,
    questionTimeRemaining: newTime,
  };
}

/**
 * Soumet une reponse a la question courante
 */
export function answerQuestion(
  state: ChallengeState,
  answer: number
): ChallengeState {
  if (state.phase !== 'playing' || !state.currentQuestion) {
    return state;
  }

  const isCorrect = answer === state.currentQuestion.answer;

  return {
    ...state,
    score: isCorrect ? state.score + 1 : state.score,
    questionsAnswered: state.questionsAnswered + 1,
    streak: updateStreak(state.streak, isCorrect),
    questionTimeRemaining: state.config.questionTime,
    currentQuestion: generateRandomQuestion(),
  };
}

/**
 * Passe a la question suivante sans repondre
 */
export function skipQuestion(state: ChallengeState): ChallengeState {
  if (state.phase !== 'playing') {
    return state;
  }

  return {
    ...state,
    questionsAnswered: state.questionsAnswered + 1,
    streak: 0,
    questionTimeRemaining: state.config.questionTime,
    currentQuestion: generateRandomQuestion(),
  };
}

/**
 * Termine le challenge manuellement
 */
export function endChallenge(state: ChallengeState): ChallengeState {
  return {
    ...state,
    phase: 'game_over',
  };
}

/**
 * Calcule le score final du challenge
 */
export function calculateChallengeScore(
  state: ChallengeState
): ChallengeResult {
  const correctAnswers = state.score;
  const totalQuestions = state.questionsAnswered;
  const accuracy =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100) / 100
      : 0;

  // Bonus temps: 1 point par seconde restante
  const timeBonus = state.globalTimeRemaining;

  // Bonus streak: (streak - 2) * 10 si >= 3
  const streakBonus = state.streak >= 3 ? (state.streak - 2) * 10 : 0;

  // Score total: 10 points par bonne reponse + bonus
  const totalScore = correctAnswers * 10 + timeBonus + streakBonus;

  return {
    correctAnswers,
    totalQuestions,
    accuracy,
    timeBonus,
    streakBonus,
    totalScore,
  };
}

/**
 * Verifie si la partie est terminee
 */
export function isGameOver(state: ChallengeState): boolean {
  return state.phase === 'game_over' || state.globalTimeRemaining === 0;
}

/**
 * Verifie si le temps de la question est ecoule
 */
export function isQuestionTimeout(state: ChallengeState): boolean {
  return state.questionTimeRemaining === 0;
}

/**
 * Formate le temps en "M:SS"
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
