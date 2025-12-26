/**
 * Stats Storage - Tables Magiques
 * ISO/IEC 25010 - Agrégation statistiques utilisateur
 */

import { getRedis, KEYS } from '@/lib/db/upstash';
import type { GameMode, Score } from '@/types/game';
import type {
  UserStats,
  ModeStats,
  SessionSummary,
  SessionHistoryFilters,
  SessionHistoryResponse,
  TableProgress,
  ProgressOverview,
  ProfileData,
} from '@/types/profile';

// =============================================================================
// HELPERS
// =============================================================================

function parseScores(data: unknown[]): Score[] {
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

function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

function generateSessionId(score: Score, index: number): string {
  const timestamp = new Date(score.timestamp).getTime();
  return `${score.mode}-${timestamp}-${index}`;
}

// =============================================================================
// USER STATS
// =============================================================================

/**
 * Récupère les statistiques globales d'un utilisateur
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const redis = getRedis();

  // Récupérer données utilisateur
  const userKey = KEYS.userId(userId);
  const username = await redis.get(userKey);

  let userData = null;
  if (username) {
    const userDataRaw = await redis.get(KEYS.user(username as string));
    if (userDataRaw) {
      try {
        userData =
          typeof userDataRaw === 'string'
            ? JSON.parse(userDataRaw)
            : userDataRaw;
      } catch {
        userData = null;
      }
    }
  }

  // Récupérer scores practice et challenge
  const practiceKey = KEYS.scores(userId, 'practice');
  const challengeKey = KEYS.scores(userId, 'challenge');

  const [practiceCount, challengeCount] = await Promise.all([
    redis.llen(practiceKey),
    redis.llen(challengeKey),
  ]);

  const [practiceData, challengeData] = await Promise.all([
    practiceCount > 0 ? redis.lrange(practiceKey, 0, -1) : [],
    challengeCount > 0 ? redis.lrange(challengeKey, 0, -1) : [],
  ]);

  const practiceScores = parseScores(practiceData as unknown[]);
  const challengeScores = parseScores(challengeData as unknown[]);
  const allScores = [...practiceScores, ...challengeScores];

  const totalGames = practiceCount + challengeCount;
  const totalQuestions = allScores.reduce((sum, s) => sum + s.total, 0);
  const totalCorrect = allScores.reduce((sum, s) => sum + s.correct, 0);
  const averageAccuracy = calculateAccuracy(totalCorrect, totalQuestions);

  // Trouver dernière session
  let lastPlayedAt: string | null = null;
  if (allScores.length > 0) {
    const sorted = allScores.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const mostRecent = sorted[0];
    if (mostRecent) {
      lastPlayedAt = mostRecent.timestamp;
    }
  }

  return {
    totalGames,
    totalQuestions,
    totalCorrect,
    averageAccuracy,
    bestStreak: 0, // TODO: calculer depuis les données
    practiceGames: practiceCount,
    challengeGames: challengeCount,
    lastPlayedAt,
    memberSince: userData?.createdAt || new Date().toISOString(),
  };
}

// =============================================================================
// MODE STATS
// =============================================================================

/**
 * Récupère les statistiques pour un mode spécifique
 */
export async function getModeStats(
  userId: string,
  mode: GameMode
): Promise<ModeStats> {
  const redis = getRedis();
  const key = KEYS.scores(userId, mode);

  const totalGames = await redis.llen(key);

  if (totalGames === 0) {
    return {
      mode,
      totalGames: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      averageAccuracy: 0,
      bestScore: 0,
      averageScore: 0,
    };
  }

  const data = await redis.lrange(key, 0, -1);
  const scores = parseScores(data as unknown[]);

  const totalQuestions = scores.reduce((sum, s) => sum + s.total, 0);
  const totalCorrect = scores.reduce((sum, s) => sum + s.correct, 0);
  const averageAccuracy = calculateAccuracy(totalCorrect, totalQuestions);

  const bestScore = Math.max(...scores.map((s) => s.correct));
  const averageScore = Math.round(totalCorrect / scores.length);

  return {
    mode,
    totalGames,
    totalQuestions,
    totalCorrect,
    averageAccuracy,
    bestScore,
    averageScore,
  };
}

// =============================================================================
// SESSION HISTORY
// =============================================================================

/**
 * Récupère l'historique des sessions avec pagination
 */
export async function getSessionHistory(
  userId: string,
  filters: SessionHistoryFilters
): Promise<SessionHistoryResponse> {
  const redis = getRedis();
  const { mode, limit = 20, offset = 0 } = filters;

  // Si mode spécifié, récupérer seulement ce mode
  const modes: GameMode[] = mode ? [mode] : ['practice', 'challenge'];

  const allSessions: SessionSummary[] = [];
  let total = 0;

  for (const m of modes) {
    const key = KEYS.scores(userId, m);
    const count = await redis.llen(key);
    total += count;

    if (count > 0) {
      const data = await redis.lrange(key, 0, -1);
      const scores = parseScores(data as unknown[]);

      const sessions = scores.map((score, index) => ({
        id: generateSessionId(score, index),
        mode: score.mode,
        table: score.table,
        score: score.correct,
        total: score.total,
        accuracy: calculateAccuracy(score.correct, score.total),
        timestamp: score.timestamp,
      }));

      allSessions.push(...sessions);
    }
  }

  // Trier par date décroissante
  allSessions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Appliquer pagination
  const paginatedSessions = allSessions.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  return {
    sessions: paginatedSessions,
    total,
    hasMore,
  };
}

// =============================================================================
// TABLE PROGRESS
// =============================================================================

/**
 * Récupère la progression par table de multiplication
 */
export async function getTableProgress(
  userId: string
): Promise<ProgressOverview> {
  const redis = getRedis();
  const key = KEYS.scores(userId, 'practice');

  const data = await redis.lrange(key, 0, -1);
  const scores = parseScores(data as unknown[]);

  // Grouper par table
  const tableMap = new Map<
    number,
    { correct: number; total: number; games: number }
  >();

  for (const score of scores) {
    if (score.table !== undefined) {
      const existing = tableMap.get(score.table) || {
        correct: 0,
        total: 0,
        games: 0,
      };
      tableMap.set(score.table, {
        correct: existing.correct + score.correct,
        total: existing.total + score.total,
        games: existing.games + 1,
      });
    }
  }

  // Créer progression pour tables 1-10
  const tables: TableProgress[] = [];
  let masteredCount = 0;

  for (let table = 1; table <= 10; table++) {
    const data = tableMap.get(table);
    const gamesPlayed = data?.games || 0;
    const accuracy = data ? calculateAccuracy(data.correct, data.total) : 0;
    const mastered = gamesPlayed >= 5 && accuracy >= 90;

    if (mastered) masteredCount++;

    tables.push({
      table,
      gamesPlayed,
      accuracy,
      mastered,
    });
  }

  return {
    tables,
    masteredCount,
    totalTables: 10,
  };
}

// =============================================================================
// PROFILE DATA
// =============================================================================

/**
 * Récupère toutes les données du profil utilisateur
 */
export async function getProfileData(
  userId: string
): Promise<ProfileData | null> {
  const redis = getRedis();

  // Récupérer données utilisateur
  const userKey = KEYS.userId(userId);
  const username = await redis.get(userKey);

  if (!username) {
    return null;
  }

  const userDataRaw = await redis.get(KEYS.user(username as string));
  if (!userDataRaw) {
    return null;
  }

  let userData;
  try {
    userData =
      typeof userDataRaw === 'string' ? JSON.parse(userDataRaw) : userDataRaw;
  } catch {
    return null;
  }

  // Récupérer toutes les données en parallèle
  const [stats, practiceStats, challengeStats, history, progress, badgesData] =
    await Promise.all([
      getUserStats(userId),
      getModeStats(userId, 'practice'),
      getModeStats(userId, 'challenge'),
      getSessionHistory(userId, { limit: 5 }),
      getTableProgress(userId),
      redis.lrange(KEYS.userBadges(userId), 0, -1),
    ]);

  return {
    user: {
      id: userId,
      username: userData.username,
      createdAt: userData.createdAt,
      lastLoginAt: userData.lastLoginAt || null,
    },
    stats,
    modeStats: {
      practice: practiceStats,
      challenge: challengeStats,
    },
    recentSessions: history.sessions,
    progress,
    badgeCount: badgesData?.length || 0,
  };
}
