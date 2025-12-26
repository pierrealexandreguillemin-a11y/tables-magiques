/**
 * Types des badges - ISO/IEC 25010 (Contrats)
 *
 * NOTE: Ce fichier contient UNIQUEMENT les TYPES (interfaces)
 * Les DONNEES de configuration sont dans @/config/badges (principe SRP)
 */

import type { GameMode } from './game';

// =============================================================================
// TYPES DE BASE
// =============================================================================

export interface BadgeDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
  mode: GameMode;
  condition: string;
}

export interface EarnedBadge {
  id: string;
  mode: GameMode;
  earnedAt: string; // ISO 8601
}

// =============================================================================
// TYPES POUR VERIFICATION BADGES
// =============================================================================

/**
 * Statistiques session Practice pour verification badges
 */
export interface PracticeSessionStats {
  correctAnswers: number;
  totalQuestions: number;
  currentStreak: number;
  maxStreak: number;
}

/**
 * Statistiques cumulees utilisateur pour badges
 */
export interface UserBadgeStats {
  totalCorrectAnswers: number;
  totalQuestions: number;
  maxStreak: number;
  challengeGamesPlayed: number;
  perfectChallenges: number;
}

/**
 * Resultat de verification de deblocage de badge
 */
export interface BadgeUnlockResult {
  badgeId: string;
  badge: BadgeDefinition;
  isNew: boolean;
}

// =============================================================================
// TYPES API RESPONSES (SRP - Source unique)
// =============================================================================

/**
 * Badge avec statut de gain pour l'API
 */
export interface BadgeWithStatus extends BadgeDefinition {
  earned: boolean;
  earnedAt: string | null;
}

/**
 * Réponse GET /api/badges
 */
export interface GetBadgesResponse {
  badges: BadgeWithStatus[];
  earnedCount: number;
  totalCount: number;
}

/**
 * Badge nouvellement gagné
 */
export interface NewBadge {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

/**
 * Réponse POST /api/badges (check)
 */
export interface CheckBadgesResponse {
  newBadges: NewBadge[];
  message: string;
}

// =============================================================================
// RE-EXPORTS CONFIG (backwards compatibility)
// =============================================================================

// Re-export depuis config pour compatibilite imports existants
export {
  PRACTICE_BADGES,
  CHALLENGE_BADGES,
  ALL_BADGES,
  getBadgeById,
} from '@/config/badges';
