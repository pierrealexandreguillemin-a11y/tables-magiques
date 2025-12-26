/**
 * Badge Storage - Tables Magiques
 * ISO/IEC 25010 - Persistence badges Redis
 */

import { getRedis, KEYS } from '@/lib/db/upstash';
import type { EarnedBadge } from '@/types/badge';
import type { GameMode } from '@/types/game';

/**
 * Recupere tous les badges gagnes par un utilisateur
 * @param userId - ID de l'utilisateur
 * @returns Liste des badges gagnes
 */
export async function getUserBadges(userId: string): Promise<EarnedBadge[]> {
  const redis = getRedis();
  const data = await redis.get<string>(KEYS.userBadges(userId));

  if (!data) {
    return [];
  }

  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return [];
  }
}

/**
 * Ajoute un badge gagne a l'utilisateur
 * @param userId - ID de l'utilisateur
 * @param badgeId - ID du badge
 * @param mode - Mode de jeu
 * @returns Badge ajoute
 */
export async function addUserBadge(
  userId: string,
  badgeId: string,
  mode: GameMode
): Promise<EarnedBadge> {
  const redis = getRedis();
  const existingBadges = await getUserBadges(userId);

  // Verifier si le badge existe deja
  const alreadyEarned = existingBadges.find((b) => b.id === badgeId);
  if (alreadyEarned) {
    return alreadyEarned;
  }

  const newBadge: EarnedBadge = {
    id: badgeId,
    mode,
    earnedAt: new Date().toISOString(),
  };

  const updatedBadges = [...existingBadges, newBadge];
  await redis.set(KEYS.userBadges(userId), JSON.stringify(updatedBadges));

  return newBadge;
}

/**
 * Ajoute plusieurs badges gagnes a l'utilisateur
 * @param userId - ID de l'utilisateur
 * @param badges - Liste des badges a ajouter (id + mode)
 * @returns Liste des badges effectivement ajoutes (nouveaux uniquement)
 */
export async function addUserBadges(
  userId: string,
  badges: Array<{ id: string; mode: GameMode }>
): Promise<EarnedBadge[]> {
  const redis = getRedis();
  const existingBadges = await getUserBadges(userId);
  const existingIds = new Set(existingBadges.map((b) => b.id));

  const now = new Date().toISOString();
  const newBadges: EarnedBadge[] = badges
    .filter((b) => !existingIds.has(b.id))
    .map((b) => ({
      id: b.id,
      mode: b.mode,
      earnedAt: now,
    }));

  if (newBadges.length === 0) {
    return [];
  }

  const updatedBadges = [...existingBadges, ...newBadges];
  await redis.set(KEYS.userBadges(userId), JSON.stringify(updatedBadges));

  return newBadges;
}

/**
 * Verifie si un utilisateur possede un badge
 * @param userId - ID de l'utilisateur
 * @param badgeId - ID du badge
 * @returns true si le badge est possede
 */
export async function hasBadge(
  userId: string,
  badgeId: string
): Promise<boolean> {
  const badges = await getUserBadges(userId);
  return badges.some((b) => b.id === badgeId);
}

/**
 * Recupere les IDs des badges possedes
 * @param userId - ID de l'utilisateur
 * @returns Liste des IDs de badges
 */
export async function getUserBadgeIds(userId: string): Promise<string[]> {
  const badges = await getUserBadges(userId);
  return badges.map((b) => b.id);
}
