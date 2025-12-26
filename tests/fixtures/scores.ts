/**
 * Scores Fixtures - DONNÉES RÉELLES
 * ISO/IEC 29119 - Scores de sessions practice et challenge
 */

import type { Score } from '@/types/game';

// =============================================================================
// SCORES PRACTICE - Entrainement table 7
// =============================================================================

export const SCORE_PRACTICE_FIXTURE: Score = {
  userId: 'user-456',
  mode: 'practice',
  table: 7,
  correct: 8,
  total: 10,
  timestamp: '2024-12-26T10:00:00.000Z',
};

export const SCORE_PRACTICE_PERFECT_FIXTURE: Score = {
  userId: 'user-456',
  mode: 'practice',
  table: 5,
  correct: 10,
  total: 10,
  timestamp: '2024-12-26T09:30:00.000Z',
};

// =============================================================================
// SCORES CHALLENGE - Defi contre la montre
// =============================================================================

export const SCORE_CHALLENGE_FIXTURE: Score = {
  userId: 'user-456',
  mode: 'challenge',
  correct: 25,
  total: 30,
  timeRemaining: 45,
  timestamp: '2024-12-26T11:00:00.000Z',
};

export const SCORE_CHALLENGE_FAST_FIXTURE: Score = {
  userId: 'user-456',
  mode: 'challenge',
  correct: 20,
  total: 20,
  timeRemaining: 90,
  timestamp: '2024-12-26T11:30:00.000Z',
};

// =============================================================================
// LISTES DE SCORES
// =============================================================================

export const PRACTICE_SCORES_FIXTURE: Score[] = [
  SCORE_PRACTICE_FIXTURE,
  SCORE_PRACTICE_PERFECT_FIXTURE,
];

export const CHALLENGE_SCORES_FIXTURE: Score[] = [
  SCORE_CHALLENGE_FIXTURE,
  SCORE_CHALLENGE_FAST_FIXTURE,
];

export const ALL_SCORES_FIXTURE: Score[] = [
  ...PRACTICE_SCORES_FIXTURE,
  ...CHALLENGE_SCORES_FIXTURE,
];

// =============================================================================
// STATISTIQUES
// =============================================================================

export const SCORE_STATS_PRACTICE_FIXTURE = {
  totalGames: 5,
  averageAccuracy: 85,
  bestStreak: 7,
};

export const SCORE_STATS_CHALLENGE_FIXTURE = {
  totalGames: 3,
  averageAccuracy: 78,
  bestStreak: 5,
};

// =============================================================================
// API RESPONSES
// =============================================================================

export const GET_SCORES_RESPONSE_FIXTURE = {
  scores: PRACTICE_SCORES_FIXTURE,
  stats: SCORE_STATS_PRACTICE_FIXTURE,
};

export const SAVE_SCORE_RESPONSE_FIXTURE = {
  success: true as const,
  score: SCORE_PRACTICE_FIXTURE,
};
