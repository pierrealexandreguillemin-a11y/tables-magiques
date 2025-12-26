/**
 * Profile API - Tables Magiques
 * ISO/IEC 25010 - Fonctions API profil utilisateur
 */

import type {
  GetProfileResponse,
  GetSessionHistoryResponse,
  SessionHistoryFilters,
} from '@/types/profile';

// =============================================================================
// TYPES RESPONSES (erreurs incluses)
// =============================================================================

export type ProfileApiResponse =
  | GetProfileResponse
  | { success: false; error: string };

export type SessionHistoryApiResponse =
  | GetSessionHistoryResponse
  | { success: false; error: string };

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Recupere les donnees profil utilisateur
 */
export async function fetchProfile(): Promise<ProfileApiResponse> {
  const response = await fetch('/api/profile', {
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json();
    return { success: false, error: data.error || 'Erreur serveur' };
  }

  return response.json();
}

/**
 * Recupere l'historique des sessions
 */
export async function fetchSessionHistory(
  filters?: SessionHistoryFilters
): Promise<SessionHistoryApiResponse> {
  const params = new URLSearchParams();

  if (filters?.mode) params.set('mode', filters.mode);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.offset) params.set('offset', String(filters.offset));

  const url = `/api/profile/history${params.toString() ? `?${params}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json();
    return { success: false, error: data.error || 'Erreur serveur' };
  }

  return response.json();
}
