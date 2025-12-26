/**
 * Types Profil Utilisateur - ISO/IEC 25010
 * SOURCE UNIQUE DE VÉRITÉ pour les types profil/statistiques
 */

import type { GameMode } from './game';

// =============================================================================
// STATISTIQUES GLOBALES
// =============================================================================

export interface UserStats {
  totalGames: number;
  totalQuestions: number;
  totalCorrect: number;
  averageAccuracy: number;
  bestStreak: number;
  practiceGames: number;
  challengeGames: number;
  lastPlayedAt: string | null;
  memberSince: string;
}

export interface ModeStats {
  mode: GameMode;
  totalGames: number;
  totalQuestions: number;
  totalCorrect: number;
  averageAccuracy: number;
  bestScore: number;
  averageScore: number;
}

// =============================================================================
// HISTORIQUE SESSIONS
// =============================================================================

export interface SessionSummary {
  id: string;
  mode: GameMode;
  table?: number;
  score: number;
  total: number;
  accuracy: number;
  timestamp: string;
}

export interface SessionHistoryFilters {
  mode?: GameMode;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface SessionHistoryResponse {
  sessions: SessionSummary[];
  total: number;
  hasMore: boolean;
}

// =============================================================================
// PROGRESSION
// =============================================================================

export interface TableProgress {
  table: number;
  gamesPlayed: number;
  accuracy: number;
  mastered: boolean; // >= 90% accuracy sur 5+ games
}

export interface ProgressOverview {
  tables: TableProgress[];
  masteredCount: number;
  totalTables: number;
}

// =============================================================================
// API RESPONSES
// =============================================================================

export interface ProfileData {
  user: {
    id: string;
    username: string;
    createdAt: string;
    lastLoginAt: string | null;
  };
  stats: UserStats;
  modeStats: {
    practice: ModeStats;
    challenge: ModeStats;
  };
  recentSessions: SessionSummary[];
  progress: ProgressOverview;
  badgeCount: number;
}

export interface GetProfileResponse {
  success: true;
  profile: ProfileData;
}

export interface GetSessionHistoryResponse {
  success: true;
  history: SessionHistoryResponse;
}
