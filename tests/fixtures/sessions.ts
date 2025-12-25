/**
 * Session Fixtures - DONNÉES RÉELLES
 * ISO/IEC 29119 - 0 données mockées
 *
 * Sessions utilisateur réalistes pour tests
 */

import type { UserSession } from '@/types/user';

/**
 * Session active - utilisateur connecté
 */
export const ACTIVE_SESSION_FIXTURE: UserSession = {
  userId: 'user-456',
  username: 'emma',
  expiresAt: Date.now() + 3600000, // +1 heure
};

/**
 * Session expirée - pour tests de reconnexion
 */
export const EXPIRED_SESSION_FIXTURE: UserSession = {
  userId: 'user-456',
  username: 'emma',
  expiresAt: Date.now() - 1000, // Expirée
};

/**
 * Session de test pour nouvel utilisateur
 */
export const NEW_USER_SESSION_FIXTURE: UserSession = {
  userId: 'user-new-001',
  username: 'nouveau',
  expiresAt: Date.now() + 7200000, // +2 heures
};

/**
 * Données de session API (format retourné par /api/session)
 */
export const API_SESSION_FIXTURE = {
  id: 'session-123',
  userId: 'user-456',
  username: 'emma',
  startedAt: '2025-12-24T10:00:00Z',
  tableSelected: 7,
  mode: 'practice' as const,
  questionsAnswered: 0,
  correctAnswers: 0,
};

/**
 * Session de jeu en cours - table de 7
 */
export const GAME_SESSION_FIXTURE = {
  id: 'game-session-789',
  userId: 'user-456',
  mode: 'practice' as const,
  table: 7,
  startedAt: '2025-12-24T10:30:00Z',
  currentQuestion: {
    a: 7,
    b: 8,
    answer: 56,
  },
  questionsAnswered: 5,
  correctAnswers: 4,
  streak: 3,
};

/**
 * Session challenge mode
 */
export const CHALLENGE_SESSION_FIXTURE = {
  id: 'challenge-session-001',
  userId: 'user-456',
  mode: 'challenge' as const,
  startedAt: '2025-12-24T11:00:00Z',
  timeRemaining: 165, // 2:45 restantes
  questionsAnswered: 8,
  correctAnswers: 7,
  currentStreak: 3,
};
