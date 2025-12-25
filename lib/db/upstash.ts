/**
 * Client Upstash Redis - ISO/IEC 25010 (Infrastructure)
 */

import { Redis } from '@upstash/redis';

// Singleton pattern pour le client Redis
let redis: Redis | null = null;

export const getRedis = (): Redis => {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set'
      );
    }

    redis = new Redis({ url, token });
  }
  return redis;
};

// Préfixes de clés pour l'organisation des données
export const KEYS = {
  // Users
  user: (username: string) => `user:${username}`,
  userId: (id: string) => `user:id:${id}`,

  // Sessions
  session: (token: string) => `session:${token}`,

  // Scores
  scores: (userId: string, mode: string) => `scores:${userId}:${mode}`,

  // Badges
  badges: (userId: string, mode: string) => `badges:${userId}:${mode}`,

  // Leaderboard (optionnel)
  leaderboard: (mode: string) => `leaderboard:${mode}`,
} as const;

// Helper pour vérifier si Redis est configuré
export const isRedisConfigured = (): boolean => {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
};
