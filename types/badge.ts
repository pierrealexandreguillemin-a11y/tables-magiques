/**
 * Types des badges - ISO/IEC 25010 (Contrats)
 */

import type { GameMode } from './game';

export interface BadgeDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
  mode: GameMode;
  condition: string; // Description de la condition
}

export interface EarnedBadge {
  id: string;
  mode: GameMode;
  earnedAt: string; // ISO 8601
}

// Badges du mode Practice
export const PRACTICE_BADGES: BadgeDefinition[] = [
  {
    id: 'first',
    emoji: '⭐',
    name: 'Premiere Etoile',
    description: 'Premiere reponse correcte',
    mode: 'practice',
    condition: '1 bonne reponse',
  },
  {
    id: 'streak5',
    emoji: '🦄',
    name: 'Licorne Magique',
    description: '5 bonnes reponses',
    mode: 'practice',
    condition: '5 bonnes reponses',
  },
  {
    id: 'streak10',
    emoji: '👑',
    name: 'Princesse des Maths',
    description: '10 bonnes reponses',
    mode: 'practice',
    condition: '10 bonnes reponses',
  },
  {
    id: 'perfect5',
    emoji: '🌈',
    name: 'Arc-en-ciel Parfait',
    description: '5/5 sans erreur',
    mode: 'practice',
    condition: '5/5 parfait',
  },
  {
    id: 'streak20',
    emoji: '✨',
    name: 'Etoile Brillante',
    description: '20 bonnes reponses',
    mode: 'practice',
    condition: '20 bonnes reponses',
  },
  {
    id: 'perfect10',
    emoji: '🧚',
    name: 'Fee des Calculs',
    description: '10/10 parfait',
    mode: 'practice',
    condition: '10/10 parfait',
  },
  {
    id: 'streak30',
    emoji: '👸',
    name: 'Reine Magique',
    description: '30 bonnes reponses',
    mode: 'practice',
    condition: '30 bonnes reponses',
  },
  {
    id: 'streak50',
    emoji: '🏆',
    name: 'Super Championne',
    description: '50 bonnes reponses',
    mode: 'practice',
    condition: '50 bonnes reponses',
  },
];

// Badges du mode Challenge
export const CHALLENGE_BADGES: BadgeDefinition[] = [
  {
    id: 'speed5',
    emoji: '⚡',
    name: 'Eclair Rapide',
    description: '5 reponses en challenge',
    mode: 'challenge',
    condition: '5 reponses',
  },
  {
    id: 'speed10',
    emoji: '🥷',
    name: 'Ninja des Maths',
    description: '10 reponses en challenge',
    mode: 'challenge',
    condition: '10 reponses',
  },
  {
    id: 'speed15',
    emoji: '🚀',
    name: 'Fusee Magique',
    description: '15 reponses en challenge',
    mode: 'challenge',
    condition: '15 reponses',
  },
  {
    id: 'speed20',
    emoji: '⚡👑',
    name: 'Reine de la Vitesse',
    description: '20 reponses en challenge',
    mode: 'challenge',
    condition: '20 reponses',
  },
  {
    id: 'perfectChallenge',
    emoji: '💎',
    name: 'Perfection Chrono',
    description: 'Challenge parfait (0 erreur)',
    mode: 'challenge',
    condition: 'Challenge sans erreur',
  },
];

// Toutes les définitions de badges
export const ALL_BADGES = [...PRACTICE_BADGES, ...CHALLENGE_BADGES];

// Helper pour trouver un badge par ID
export const getBadgeById = (id: string): BadgeDefinition | undefined => {
  return ALL_BADGES.find((badge) => badge.id === id);
};

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
 * Statistiques cumulées utilisateur pour badges
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
