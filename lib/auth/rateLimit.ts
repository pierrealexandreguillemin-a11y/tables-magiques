/**
 * Rate Limiting - Tables Magiques
 * ISO/IEC 25010 - Security (Integrity)
 *
 * Protection brute-force pour API auth via Upstash Redis
 */

import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from '@/lib/db/upstash';
import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Limites par type d'action
 * - login: 5 tentatives par minute (protection brute-force)
 * - register: 3 par minute (anti-spam)
 * - general: 60 par minute (usage normal)
 */
const LIMITS = {
  login: { requests: 5, window: '1m' as const },
  register: { requests: 3, window: '1m' as const },
  general: { requests: 60, window: '1m' as const },
} as const;

type RateLimitType = keyof typeof LIMITS;

// =============================================================================
// RATE LIMITER INSTANCES (lazy init)
// =============================================================================

let loginLimiter: Ratelimit | null = null;
let registerLimiter: Ratelimit | null = null;
let generalLimiter: Ratelimit | null = null;

function getLimiter(type: RateLimitType): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const config = LIMITS[type];

  switch (type) {
    case 'login':
      if (!loginLimiter) {
        loginLimiter = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(config.requests, config.window),
          prefix: 'tm:ratelimit:login',
        });
      }
      return loginLimiter;

    case 'register':
      if (!registerLimiter) {
        registerLimiter = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(config.requests, config.window),
          prefix: 'tm:ratelimit:register',
        });
      }
      return registerLimiter;

    case 'general':
      if (!generalLimiter) {
        generalLimiter = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(config.requests, config.window),
          prefix: 'tm:ratelimit:general',
        });
      }
      return generalLimiter;
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Extrait l'IP du client depuis la requete
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Resultat du rate limiting
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Verifie le rate limit pour une requete
 *
 * @param request - NextRequest
 * @param type - Type de limite (login, register, general)
 * @returns RateLimitResult ou null si Redis non configure
 */
export async function checkRateLimit(
  request: NextRequest,
  type: RateLimitType = 'general'
): Promise<RateLimitResult | null> {
  const limiter = getLimiter(type);

  if (!limiter) {
    // Redis non configure - pas de rate limiting
    console.warn('[RateLimit] Redis not configured, skipping');
    return null;
  }

  const ip = getClientIP(request);
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  return { success, limit, remaining, reset };
}

/**
 * Middleware helper pour bloquer si rate limited
 * Retourne une reponse 429 si limite atteinte, null sinon
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  type: RateLimitType = 'general'
): Promise<NextResponse | null> {
  const result = await checkRateLimit(request, type);

  // Si pas de Redis, on laisse passer
  if (!result) return null;

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

    return NextResponse.json(
      {
        success: false,
        error: 'Trop de tentatives. Reessayez plus tard.',
        code: 'RATE_LIMITED',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(result.reset),
        },
      }
    );
  }

  return null;
}
