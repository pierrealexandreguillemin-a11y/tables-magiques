/**
 * Fixtures Profil - Données RÉELLES
 * ISO/IEC 29119 - Données production pour tests
 *
 * Scénario: Emma, 9 ans, utilise l'app depuis 2 semaines
 * - Joue principalement la table de 7 (la plus difficile)
 * - Quelques parties challenge le week-end
 * - Progression réaliste d'un enfant apprenant
 */

import type { Score, GameMode } from '@/types/game';
import type {
  UserStats,
  ModeStats,
  SessionSummary,
  TableProgress,
} from '@/types/profile';

// =============================================================================
// UTILISATEUR
// =============================================================================

export const EMMA_PROFILE_USER = {
  id: 'user-emma-123',
  username: 'emma',
  createdAt: '2025-12-12T10:00:00Z', // Inscrite il y a 2 semaines
  lastLoginAt: '2025-12-26T09:00:00Z',
  passwordHash: '$2a$10$xxxxx', // Jamais exposé dans les tests profil
};

// =============================================================================
// SCORES PRACTICE - Progression réaliste sur 2 semaines
// =============================================================================

export const EMMA_PRACTICE_SCORES: Score[] = [
  // Semaine 1 - Découverte, erreurs fréquentes
  {
    userId: 'user-emma-123',
    mode: 'practice',
    table: 7,
    correct: 6,
    total: 10,
    timestamp: '2025-12-12T14:00:00Z',
  },
  {
    userId: 'user-emma-123',
    mode: 'practice',
    table: 7,
    correct: 7,
    total: 10,
    timestamp: '2025-12-13T15:30:00Z',
  },
  {
    userId: 'user-emma-123',
    mode: 'practice',
    table: 8,
    correct: 5,
    total: 10,
    timestamp: '2025-12-14T10:00:00Z',
  },
  {
    userId: 'user-emma-123',
    mode: 'practice',
    table: 7,
    correct: 8,
    total: 10,
    timestamp: '2025-12-15T16:00:00Z',
  },

  // Semaine 2 - Amélioration progressive
  {
    userId: 'user-emma-123',
    mode: 'practice',
    table: 7,
    correct: 9,
    total: 10,
    timestamp: '2025-12-19T14:00:00Z',
  },
  {
    userId: 'user-emma-123',
    mode: 'practice',
    table: 7,
    correct: 10,
    total: 10,
    timestamp: '2025-12-20T15:00:00Z',
  }, // Premier parfait!
  {
    userId: 'user-emma-123',
    mode: 'practice',
    table: 8,
    correct: 8,
    total: 10,
    timestamp: '2025-12-21T11:00:00Z',
  },
  {
    userId: 'user-emma-123',
    mode: 'practice',
    table: 9,
    correct: 7,
    total: 10,
    timestamp: '2025-12-22T14:00:00Z',
  },
  {
    userId: 'user-emma-123',
    mode: 'practice',
    table: 7,
    correct: 9,
    total: 10,
    timestamp: '2025-12-25T16:00:00Z',
  },
];
// Table 7: 6 parties (53/60 = 88%), Table 8: 2 parties (13/20 = 65%), Table 9: 1 partie (7/10 = 70%)

// =============================================================================
// SCORES CHALLENGE - Week-end uniquement
// =============================================================================

export const EMMA_CHALLENGE_SCORES: Score[] = [
  // Premier essai - difficile
  {
    userId: 'user-emma-123',
    mode: 'challenge',
    correct: 12,
    total: 20,
    timeRemaining: 15,
    timestamp: '2025-12-14T15:00:00Z',
  },
  // Deuxième essai - mieux
  {
    userId: 'user-emma-123',
    mode: 'challenge',
    correct: 18,
    total: 25,
    timeRemaining: 30,
    timestamp: '2025-12-21T16:00:00Z',
  },
  // Troisième essai - record personnel!
  {
    userId: 'user-emma-123',
    mode: 'challenge',
    correct: 22,
    total: 28,
    timeRemaining: 45,
    timestamp: '2025-12-25T17:00:00Z',
  },
];

// =============================================================================
// STATISTIQUES ATTENDUES
// =============================================================================

export const EMMA_EXPECTED_STATS: UserStats = {
  totalGames: 12, // 9 practice + 3 challenge
  totalQuestions: 163, // 90 practice + 73 challenge
  totalCorrect: 121, // 69 practice + 52 challenge
  averageAccuracy: 74, // 121/163 = 74.2%
  bestStreak: 0, // Non calculé
  practiceGames: 9,
  challengeGames: 3,
  lastPlayedAt: '2025-12-25T17:00:00Z',
  memberSince: '2025-12-12T10:00:00Z',
};

export const EMMA_PRACTICE_STATS: ModeStats = {
  mode: 'practice',
  totalGames: 9,
  totalQuestions: 90,
  totalCorrect: 69,
  averageAccuracy: 77,
  bestScore: 10,
  averageScore: 8,
};

export const EMMA_CHALLENGE_STATS: ModeStats = {
  mode: 'challenge',
  totalGames: 3,
  totalQuestions: 73,
  totalCorrect: 52,
  averageAccuracy: 71,
  bestScore: 22,
  averageScore: 17,
};

// =============================================================================
// PROGRESSION TABLES
// =============================================================================

export const EMMA_TABLE_PROGRESS: TableProgress[] = [
  { table: 1, gamesPlayed: 0, accuracy: 0, mastered: false },
  { table: 2, gamesPlayed: 0, accuracy: 0, mastered: false },
  { table: 3, gamesPlayed: 0, accuracy: 0, mastered: false },
  { table: 4, gamesPlayed: 0, accuracy: 0, mastered: false },
  { table: 5, gamesPlayed: 0, accuracy: 0, mastered: false },
  { table: 6, gamesPlayed: 0, accuracy: 0, mastered: false },
  { table: 7, gamesPlayed: 6, accuracy: 88, mastered: true }, // 6 parties, 88% = maîtrisée!
  { table: 8, gamesPlayed: 2, accuracy: 65, mastered: false },
  { table: 9, gamesPlayed: 1, accuracy: 70, mastered: false },
  { table: 10, gamesPlayed: 0, accuracy: 0, mastered: false },
];

// =============================================================================
// SESSIONS RÉCENTES (pour historique)
// =============================================================================

export const EMMA_RECENT_SESSIONS: SessionSummary[] = [
  {
    id: 'challenge-1735149600000-0',
    mode: 'challenge',
    score: 22,
    total: 28,
    accuracy: 79,
    timestamp: '2025-12-25T17:00:00Z',
  },
  {
    id: 'practice-1735138800000-0',
    mode: 'practice',
    table: 7,
    score: 9,
    total: 10,
    accuracy: 90,
    timestamp: '2025-12-25T16:00:00Z',
  },
  {
    id: 'practice-1735034400000-0',
    mode: 'practice',
    table: 7,
    score: 10,
    total: 10,
    accuracy: 100,
    timestamp: '2025-12-24T10:00:00Z',
  },
  {
    id: 'practice-1734782400000-0',
    mode: 'practice',
    table: 9,
    score: 7,
    total: 10,
    accuracy: 70,
    timestamp: '2025-12-22T14:00:00Z',
  },
  {
    id: 'challenge-1734793200000-0',
    mode: 'challenge',
    score: 18,
    total: 25,
    accuracy: 72,
    timestamp: '2025-12-21T16:00:00Z',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getEmmaScoresAsJson(mode: GameMode): string[] {
  const scores =
    mode === 'practice' ? EMMA_PRACTICE_SCORES : EMMA_CHALLENGE_SCORES;
  return scores.map((s) => JSON.stringify(s));
}

export function getAllEmmaScoresAsJson(): string[] {
  return [
    ...EMMA_PRACTICE_SCORES.map((s) => JSON.stringify(s)),
    ...EMMA_CHALLENGE_SCORES.map((s) => JSON.stringify(s)),
  ];
}
