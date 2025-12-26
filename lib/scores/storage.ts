/**
 * Score Storage - Tables Magiques
 * ISO/IEC 25010 - Persistence scores Redis
 */

import { getRedis, KEYS } from '@/lib/db/upstash';
import type { Score, GameMode, ScoreStats, SaveScoreInput } from '@/types/game';

// NOTE: ScoreStats import depuis @/types/game (source unique de verite)

/**
 * Recupere tous les scores d'un utilisateur pour un mode
 * @param userId - ID de l'utilisateur
 * @param mode - Mode de jeu (practice | challenge)
 * @returns Liste des scores
 */
export async function getUserScores(
  userId: string,
  mode: GameMode
): Promise<Score[]> {
  const redis = getRedis();
  const key = KEYS.scores(userId, mode);
  const data = await redis.lrange(key, 0, -1);

  if (!data || data.length === 0) {
    return [];
  }

  return data
    .map((item) => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    })
    .filter((score): score is Score => score !== null);
}

/**
 * Sauvegarde un nouveau score
 * @param userId - ID de l'utilisateur
 * @param input - Donnees du score
 * @returns Score sauvegarde avec timestamp
 */
export async function saveScore(
  userId: string,
  input: SaveScoreInput
): Promise<Score> {
  const redis = getRedis();
  const key = KEYS.scores(userId, input.mode);

  const score: Score = {
    userId,
    mode: input.mode,
    table: input.table,
    correct: input.correct,
    total: input.total,
    timeRemaining: input.timeRemaining,
    timestamp: new Date().toISOString(),
  };

  await redis.lpush(key, JSON.stringify(score));

  return score;
}

/**
 * Recupere les N derniers scores
 * @param userId - ID de l'utilisateur
 * @param mode - Mode de jeu
 * @param limit - Nombre de scores (defaut: 20)
 * @returns Liste des scores recents
 */
export async function getRecentScores(
  userId: string,
  mode: GameMode,
  limit: number = 20
): Promise<Score[]> {
  const redis = getRedis();
  const key = KEYS.scores(userId, mode);
  const data = await redis.lrange(key, 0, limit - 1);

  if (!data || data.length === 0) {
    return [];
  }

  return data
    .map((item) => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    })
    .filter((score): score is Score => score !== null);
}

/**
 * Calcule les statistiques de scores
 * @param userId - ID de l'utilisateur
 * @param mode - Mode de jeu
 * @returns Statistiques
 */
export async function getScoreStats(
  userId: string,
  mode: GameMode
): Promise<ScoreStats> {
  const redis = getRedis();
  const key = KEYS.scores(userId, mode);

  const totalGames = await redis.llen(key);

  if (totalGames === 0) {
    return {
      totalGames: 0,
      averageAccuracy: 0,
      bestStreak: 0,
    };
  }

  const scores = await getUserScores(userId, mode);

  const totalAccuracy = scores.reduce((sum, score) => {
    const accuracy = (score.correct / score.total) * 100;
    return sum + accuracy;
  }, 0);

  const averageAccuracy = Math.round(totalAccuracy / scores.length);

  return {
    totalGames,
    averageAccuracy,
    bestStreak: 0, // TODO: Calculer a partir des donnees
  };
}
