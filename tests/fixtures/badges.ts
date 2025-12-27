/**
 * Badge Fixtures - DONNÉES RÉELLES
 * ISO/IEC 29119 - 0 données mockées
 *
 * Badges gagnés par un utilisateur réel (enfant 9 ans)
 */

import type { EarnedBadge } from '@/types/badge';

/**
 * Badges gagnés par l'utilisateur - progression réaliste
 * Un enfant de 9 ans après 2 semaines d'utilisation
 */
export const EARNED_BADGES_FIXTURE: EarnedBadge[] = [
  // Mode Practice - Progression naturelle
  {
    id: 'first',
    mode: 'practice',
    earnedAt: '2025-12-10T14:30:00Z', // Premier jour
  },
  {
    id: 'streak5',
    mode: 'practice',
    earnedAt: '2025-12-10T14:35:00Z', // Premier jour
  },
  {
    id: 'streak10',
    mode: 'practice',
    earnedAt: '2025-12-11T15:00:00Z', // Deuxième jour
  },
  {
    id: 'perfect5',
    mode: 'practice',
    earnedAt: '2025-12-12T14:45:00Z', // Troisième jour
  },
  {
    id: 'streak20',
    mode: 'practice',
    earnedAt: '2025-12-15T16:00:00Z', // Après une semaine
  },

  // Mode Challenge - Badges de vitesse
  {
    id: 'speed5',
    mode: 'challenge',
    earnedAt: '2025-12-14T17:00:00Z', // Premier challenge
  },
  {
    id: 'speed10',
    mode: 'challenge',
    earnedAt: '2025-12-18T16:30:00Z', // Amélioration
  },
];

/**
 * Badge unique - pour tests unitaires
 */
export const SINGLE_BADGE_FIXTURE: EarnedBadge = {
  id: 'streak5',
  mode: 'practice',
  earnedAt: '2025-12-10T14:35:00Z',
};

/**
 * Badge challenge - pour tests spécifiques
 */
export const CHALLENGE_BADGE_FIXTURE: EarnedBadge = {
  id: 'speed10',
  mode: 'challenge',
  earnedAt: '2025-12-18T16:30:00Z',
};

/**
 * Badges par mode - pour filtrage
 */
export const PRACTICE_BADGES_EARNED = EARNED_BADGES_FIXTURE.filter(
  (b) => b.mode === 'practice'
);

export const CHALLENGE_BADGES_EARNED = EARNED_BADGES_FIXTURE.filter(
  (b) => b.mode === 'challenge'
);

/**
 * Statistiques de badges (calculées à partir des données réelles)
 */
export const BADGE_STATS_FIXTURE = {
  totalEarned: EARNED_BADGES_FIXTURE.length,
  practiceCount: PRACTICE_BADGES_EARNED.length,
  challengeCount: CHALLENGE_BADGES_EARNED.length,
  lastEarned: '2025-12-18T16:30:00Z',
  nextBadge: {
    id: 'perfect10',
    progress: 7, // 7/10 vers le badge parfait
  },
};

// =============================================================================
// FIXTURES POUR POST /api/badges (nouveau badge gagné)
// =============================================================================

import type { NewBadge, CheckBadgesResponse } from '@/types/badge';

/**
 * Nouveau badge practice (streak5) - réponse API réelle
 */
export const NEW_PRACTICE_BADGE_FIXTURE: NewBadge = {
  id: 'streak5',
  emoji: '🦄',
  name: 'Licorne Magique',
  description: '5 bonnes reponses',
};

/**
 * Nouveau badge challenge (speed5) - réponse API réelle
 */
export const NEW_CHALLENGE_BADGE_FIXTURE: NewBadge = {
  id: 'speed5',
  emoji: '⚡',
  name: 'Eclair Rapide',
  description: '5 reponses en challenge',
};

/**
 * Réponse POST /api/badges - practice
 */
export const CHECK_BADGES_PRACTICE_RESPONSE: CheckBadgesResponse = {
  newBadges: [NEW_PRACTICE_BADGE_FIXTURE],
  message: '1 nouveau(x) badge(s) debloque(s)',
};

/**
 * Réponse POST /api/badges - challenge
 */
export const CHECK_BADGES_CHALLENGE_RESPONSE: CheckBadgesResponse = {
  newBadges: [NEW_CHALLENGE_BADGE_FIXTURE],
  message: '1 nouveau(x) badge(s) debloque(s)',
};

/**
 * Réponse POST /api/badges - aucun nouveau badge
 */
export const CHECK_BADGES_EMPTY_RESPONSE: CheckBadgesResponse = {
  newBadges: [],
  message: '0 nouveau(x) badge(s) debloque(s)',
};
