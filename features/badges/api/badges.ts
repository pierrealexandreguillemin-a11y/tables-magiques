/**
 * Badges API - Tables Magiques
 * ISO/IEC 25010 - Fonctions API badges
 *
 * NOTE: Ce module contient les fonctions fetch pures
 * Les hooks React Query sont dans useBadges.ts
 */

import type {
  PracticeSessionStats,
  GetBadgesResponse,
  CheckBadgesResponse,
} from '@/types/badge';
import type { ChallengeResult } from '@/types/game';

// Re-export types pour compatibilité imports existants
export type {
  BadgeWithStatus,
  GetBadgesResponse,
  NewBadge,
  CheckBadgesResponse,
} from '@/types/badge';

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Recupere tous les badges de l'utilisateur
 */
export async function fetchBadges(): Promise<GetBadgesResponse> {
  const response = await fetch('/api/badges', {
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Non authentifie');
    }
    throw new Error('Erreur serveur');
  }

  return response.json();
}

/**
 * Verifie et attribue les badges pour une session Practice
 */
export async function checkPracticeBadges(
  stats: PracticeSessionStats
): Promise<CheckBadgesResponse> {
  const response = await fetch('/api/badges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      mode: 'practice',
      practiceStats: stats,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Non authentifie');
    }
    throw new Error('Erreur serveur');
  }

  return response.json();
}

/**
 * Verifie et attribue les badges pour une session Challenge
 */
export async function checkChallengeBadgesApi(
  result: ChallengeResult
): Promise<CheckBadgesResponse> {
  const response = await fetch('/api/badges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      mode: 'challenge',
      challengeResult: result,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Non authentifie');
    }
    throw new Error('Erreur serveur');
  }

  return response.json();
}
