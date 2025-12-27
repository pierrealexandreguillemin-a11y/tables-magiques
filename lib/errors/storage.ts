/**
 * Error Storage - Upstash Redis
 * ISO/IEC 25010 - Reliability (Error Logging)
 *
 * Stocke les erreurs frontend dans Redis avec TTL auto-cleanup
 */

import { getRedis, isRedisConfigured } from '@/lib/db/upstash';
import type { ErrorReport } from '@/lib/errorReporter';

// =============================================================================
// CONFIGURATION
// =============================================================================

const APP_PREFIX = 'tm';
const ERROR_KEY_PREFIX = `${APP_PREFIX}:errors`;
const ERROR_LIST_KEY = `${ERROR_KEY_PREFIX}:list`;
const ERROR_STATS_KEY = `${ERROR_KEY_PREFIX}:stats`;

// TTL: 7 jours (cleanup automatique)
const ERROR_TTL_SECONDS = 7 * 24 * 60 * 60;
const MAX_STORED_ERRORS = 1000;

// =============================================================================
// TYPES
// =============================================================================

export interface StoredError extends ErrorReport {
  id: string;
  storedAt: string;
}

export interface ErrorStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  lastUpdated: string;
}

// =============================================================================
// TYPE GUARDS (ISO/IEC 5055 - CWE-704 compliant)
// =============================================================================

function hasStringProp(obj: object, key: string): boolean {
  if (!Object.prototype.hasOwnProperty.call(obj, key)) return false;
  // Safe property access via Object.getOwnPropertyDescriptor
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  return descriptor !== undefined && typeof descriptor.value === 'string';
}

function isStoredError(value: unknown): value is StoredError {
  if (!value || typeof value !== 'object') return false;
  // Type guard via property checks (ISO/IEC 5055 compliant)
  return (
    hasStringProp(value, 'id') &&
    hasStringProp(value, 'message') &&
    hasStringProp(value, 'type') &&
    hasStringProp(value, 'severity') &&
    hasStringProp(value, 'timestamp') &&
    hasStringProp(value, 'storedAt')
  );
}

function parseStoredError(raw: unknown): StoredError | null {
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isStoredError(parsed)) {
        return parsed;
      }
    } catch {
      return null;
    }
  }
  if (isStoredError(raw)) {
    return raw;
  }
  return null;
}

// =============================================================================
// STORAGE FUNCTIONS
// =============================================================================

/**
 * Sauvegarde un batch d'erreurs dans Redis
 */
export async function storeErrors(
  errors: (ErrorReport & { id: string })[]
): Promise<{ stored: number; failed: number }> {
  if (!isRedisConfigured()) {
    console.warn('[ErrorStorage] Redis not configured, skipping storage');
    return { stored: 0, failed: errors.length };
  }

  const redis = getRedis();
  let stored = 0;
  let failed = 0;

  for (const error of errors) {
    try {
      const storedError: StoredError = {
        ...error,
        storedAt: new Date().toISOString(),
      };

      // Pipeline pour atomicité
      const pipeline = redis.pipeline();

      // Ajouter à la liste (LPUSH pour ordre chronologique inverse)
      pipeline.lpush(ERROR_LIST_KEY, JSON.stringify(storedError));

      // Trim pour éviter croissance illimitée
      pipeline.ltrim(ERROR_LIST_KEY, 0, MAX_STORED_ERRORS - 1);

      // Incrémenter compteurs stats
      pipeline.hincrby(ERROR_STATS_KEY, 'total', 1);
      pipeline.hincrby(ERROR_STATS_KEY, `type:${error.type}`, 1);
      pipeline.hincrby(ERROR_STATS_KEY, `severity:${error.severity}`, 1);
      pipeline.hset(ERROR_STATS_KEY, { lastUpdated: new Date().toISOString() });

      // TTL sur la liste
      pipeline.expire(ERROR_LIST_KEY, ERROR_TTL_SECONDS);
      pipeline.expire(ERROR_STATS_KEY, ERROR_TTL_SECONDS);

      await pipeline.exec();
      stored++;
    } catch (err) {
      console.error('[ErrorStorage] Failed to store error:', err);
      failed++;
    }
  }

  return { stored, failed };
}

/**
 * Récupère les erreurs récentes
 */
export async function getRecentErrors(limit = 50): Promise<StoredError[]> {
  if (!isRedisConfigured()) {
    return [];
  }

  const redis = getRedis();
  const rawErrors = await redis.lrange(ERROR_LIST_KEY, 0, limit - 1);

  return rawErrors
    .map((raw) => parseStoredError(raw))
    .filter((error): error is StoredError => error !== null);
}

/**
 * Récupère les statistiques d'erreurs
 */
export async function getErrorStats(): Promise<ErrorStats | null> {
  if (!isRedisConfigured()) {
    return null;
  }

  const redis = getRedis();
  const rawStats = await redis.hgetall(ERROR_STATS_KEY);

  if (!rawStats || Object.keys(rawStats).length === 0) {
    return null;
  }

  const stats: ErrorStats = {
    total: 0,
    byType: {},
    bySeverity: {},
    lastUpdated: '',
  };

  for (const [key, value] of Object.entries(rawStats)) {
    if (key === 'total') {
      stats.total =
        typeof value === 'number' ? value : parseInt(String(value), 10);
    } else if (key === 'lastUpdated') {
      stats.lastUpdated = String(value);
    } else if (key.startsWith('type:')) {
      const type = key.replace('type:', '');
      stats.byType[type] =
        typeof value === 'number' ? value : parseInt(String(value), 10);
    } else if (key.startsWith('severity:')) {
      const severity = key.replace('severity:', '');
      stats.bySeverity[severity] =
        typeof value === 'number' ? value : parseInt(String(value), 10);
    }
  }

  return stats;
}

/**
 * Nettoie les anciennes erreurs (utile pour maintenance manuelle)
 */
export async function clearOldErrors(): Promise<{ deleted: number }> {
  if (!isRedisConfigured()) {
    return { deleted: 0 };
  }

  const redis = getRedis();

  // Supprimer tout et reset stats
  await redis.del(ERROR_LIST_KEY);
  await redis.del(ERROR_STATS_KEY);

  return { deleted: 1 }; // Simplifié - on supprime tout
}

/**
 * Health check pour le système d'erreurs
 */
export async function getErrorSystemHealth(): Promise<{
  healthy: boolean;
  configured: boolean;
  errorCount: number;
  lastError: string | null;
}> {
  if (!isRedisConfigured()) {
    return {
      healthy: false,
      configured: false,
      errorCount: 0,
      lastError: null,
    };
  }

  try {
    const redis = getRedis();
    const errorCount = await redis.llen(ERROR_LIST_KEY);
    const lastErrorRaw = await redis.lindex(ERROR_LIST_KEY, 0);

    let lastError: string | null = null;
    if (lastErrorRaw) {
      const parsed =
        typeof lastErrorRaw === 'string'
          ? JSON.parse(lastErrorRaw)
          : lastErrorRaw;
      lastError = parsed.timestamp || null;
    }

    return {
      healthy: true,
      configured: true,
      errorCount,
      lastError,
    };
  } catch (err) {
    return {
      healthy: false,
      configured: true,
      errorCount: 0,
      lastError: String(err),
    };
  }
}
