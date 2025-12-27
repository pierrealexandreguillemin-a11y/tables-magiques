/**
 * Game State Fixtures - DONNÉES RÉELLES
 * ISO/IEC 29119 - 0 données mockées
 *
 * États de jeu réalistes pour tests
 */

import type { GameState, Question, GameConfig } from '@/types/game';

/**
 * État initial du jeu - avant de commencer
 */
export const INITIAL_GAME_STATE_FIXTURE: GameState = {
  mode: 'practice',
  currentTable: undefined,
  question: null,
  userAnswer: '',
  score: 0,
  total: 0,
  streak: 0,
  isCorrect: null,
  showFeedback: false,
  isActive: false,
};

/**
 * État en cours de jeu - table de 7
 */
export const ACTIVE_GAME_STATE_FIXTURE: GameState = {
  mode: 'practice',
  currentTable: 7,
  question: {
    a: 7,
    b: 8,
    answer: 56,
  },
  userAnswer: '',
  score: 4,
  total: 5,
  streak: 3,
  isCorrect: null,
  showFeedback: false,
  isActive: true,
};

/**
 * État après bonne réponse
 */
export const CORRECT_ANSWER_STATE_FIXTURE: GameState = {
  mode: 'practice',
  currentTable: 7,
  question: {
    a: 7,
    b: 8,
    answer: 56,
  },
  userAnswer: '56',
  score: 5,
  total: 6,
  streak: 4,
  isCorrect: true,
  showFeedback: true,
  isActive: true,
};

/**
 * État après mauvaise réponse
 */
export const WRONG_ANSWER_STATE_FIXTURE: GameState = {
  mode: 'practice',
  currentTable: 7,
  question: {
    a: 7,
    b: 6,
    answer: 42,
  },
  userAnswer: '48',
  score: 4,
  total: 6,
  streak: 0, // Reset après erreur
  isCorrect: false,
  showFeedback: true,
  isActive: true,
};

/**
 * État mode challenge - en cours
 */
export const CHALLENGE_GAME_STATE_FIXTURE: GameState = {
  mode: 'challenge',
  currentTable: undefined, // Aléatoire en challenge
  question: {
    a: 9,
    b: 7,
    answer: 63,
  },
  userAnswer: '',
  score: 12,
  total: 15,
  streak: 5,
  isCorrect: null,
  showFeedback: false,
  timeRemaining: 120,
  questionTimeRemaining: 4,
  isActive: true,
};

/**
 * État fin de partie - practice
 */
export const COMPLETED_GAME_STATE_FIXTURE: GameState = {
  mode: 'practice',
  currentTable: 7,
  question: null,
  userAnswer: '',
  score: 8,
  total: 10,
  streak: 3,
  isCorrect: null,
  showFeedback: false,
  isActive: false,
};

/**
 * Questions de test - table de 7 complète
 */
export const TABLE_7_QUESTIONS_FIXTURE: Question[] = [
  { a: 7, b: 1, answer: 7 },
  { a: 7, b: 2, answer: 14 },
  { a: 7, b: 3, answer: 21 },
  { a: 7, b: 4, answer: 28 },
  { a: 7, b: 5, answer: 35 },
  { a: 7, b: 6, answer: 42 },
  { a: 7, b: 7, answer: 49 },
  { a: 7, b: 8, answer: 56 },
  { a: 7, b: 9, answer: 63 },
  { a: 7, b: 10, answer: 70 },
];

/**
 * Configuration de jeu par défaut
 */
export const DEFAULT_CONFIG_FIXTURE: GameConfig = {
  practice: {
    questionsPerTable: 10,
  },
  challenge: {
    globalTime: 180,
    questionTime: 5,
  },
};

/**
 * Configuration personnalisée - pour tests
 */
export const CUSTOM_CONFIG_FIXTURE: GameConfig = {
  practice: {
    questionsPerTable: 5, // Version courte
  },
  challenge: {
    globalTime: 120, // 2 minutes
    questionTime: 3, // Plus rapide
  },
};

// =============================================================================
// API RESPONSES - Réponses déterministes (pas de Math.random)
// =============================================================================

/**
 * Réponse POST /api/game/answer - réponse CORRECTE (7×8=56)
 */
export const GAME_ANSWER_CORRECT_RESPONSE = {
  success: true,
  isCorrect: true,
  correctAnswer: 56,
  newScore: 5,
  streak: 4,
};

/**
 * Réponse POST /api/game/answer - réponse INCORRECTE (7×8≠48)
 */
export const GAME_ANSWER_WRONG_RESPONSE = {
  success: true,
  isCorrect: false,
  correctAnswer: 56,
  newScore: 4,
  streak: 0,
};

/**
 * Réponse POST /api/game/start
 */
export const GAME_START_RESPONSE = {
  success: true,
  gameId: 'game-fixture-001',
  mode: 'practice' as const,
  table: 7,
  startedAt: '2025-12-26T14:00:00.000Z',
};

/**
 * Réponse POST /api/game/end
 */
export const GAME_END_RESPONSE = {
  success: true,
  gameId: 'game-fixture-001',
  finalScore: 8,
  totalQuestions: 10,
  accuracy: 0.8,
  newBadges: [],
  endedAt: '2025-12-26T14:15:00.000Z',
};
