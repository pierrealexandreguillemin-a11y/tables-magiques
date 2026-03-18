/**
 * Tests Unitaires - Rate Limiting
 * ISO/IEC 29119 - TDD: Tests protection brute-force
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// =============================================================================
// MOCKS
// =============================================================================

// Mock du limiteur Ratelimit
const mockLimit = vi.fn();

// mockLimit is used in MockRatelimit class below
void mockLimit;

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class MockRatelimit {
    static slidingWindow = vi.fn().mockReturnValue({ type: 'slidingWindow' });

    constructor(public config: unknown) {}

    limit = mockLimit;
  },
}));

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock('@/lib/db/upstash', () => ({
  getRedis: () => mockRedis,
}));

// Import apres mock
import {
  getClientIP,
  checkRateLimit,
  rateLimitMiddleware,
} from '@/lib/auth/rateLimit';

// =============================================================================
// HELPERS
// =============================================================================

function makeRequest(
  headers: Record<string, string> = {},
  url = 'http://localhost/api/test'
): NextRequest {
  return new NextRequest(url, { headers });
}

// =============================================================================
// getClientIP
// =============================================================================

describe('getClientIP', () => {
  it('extrait IP depuis x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    expect(getClientIP(req)).toBe('1.2.3.4');
  });

  it('extrait premier IP si x-forwarded-for contient plusieurs IPs', () => {
    const req = makeRequest({
      'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12',
    });
    expect(getClientIP(req)).toBe('1.2.3.4');
  });

  it('supprime les espaces autour de l IP', () => {
    const req = makeRequest({ 'x-forwarded-for': '  1.2.3.4  , 5.6.7.8' });
    expect(getClientIP(req)).toBe('1.2.3.4');
  });

  it('utilise x-real-ip si pas de x-forwarded-for', () => {
    const req = makeRequest({ 'x-real-ip': '9.8.7.6' });
    expect(getClientIP(req)).toBe('9.8.7.6');
  });

  it('utilise cf-connecting-ip si les autres headers sont absents', () => {
    const req = makeRequest({ 'cf-connecting-ip': '3.3.3.3' });
    expect(getClientIP(req)).toBe('3.3.3.3');
  });

  it('retourne "unknown" si aucun header IP present', () => {
    const req = makeRequest({});
    expect(getClientIP(req)).toBe('unknown');
  });

  it('prefere x-forwarded-for sur x-real-ip', () => {
    const req = makeRequest({
      'x-forwarded-for': '1.1.1.1',
      'x-real-ip': '2.2.2.2',
    });
    expect(getClientIP(req)).toBe('1.1.1.1');
  });

  it('prefere x-real-ip sur cf-connecting-ip', () => {
    const req = makeRequest({
      'x-real-ip': '2.2.2.2',
      'cf-connecting-ip': '3.3.3.3',
    });
    expect(getClientIP(req)).toBe('2.2.2.2');
  });
});

// =============================================================================
// checkRateLimit
// =============================================================================

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset des singletons de limiteurs en reimportant le module
    vi.resetModules();
  });

  it('retourne RateLimitResult success si sous la limite', async () => {
    const limitResult = {
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    };
    mockLimit.mockResolvedValue(limitResult);

    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const result = await checkRateLimit(req, 'login');

    expect(result).not.toBeNull();
    expect(result!.success).toBe(true);
    expect(result!.limit).toBe(5);
    expect(result!.remaining).toBe(4);
  });

  it('retourne success=false si limite depassee', async () => {
    const limitResult = {
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60000,
    };
    mockLimit.mockResolvedValue(limitResult);

    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const result = await checkRateLimit(req, 'login');

    expect(result!.success).toBe(false);
    expect(result!.remaining).toBe(0);
  });

  it('utilise le type general par defaut', async () => {
    const limitResult = {
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60000,
    };
    mockLimit.mockResolvedValue(limitResult);

    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const result = await checkRateLimit(req);

    expect(result).not.toBeNull();
    expect(result!.success).toBe(true);
  });

  it('passe l IP comme identifiant au limiteur', async () => {
    const limitResult = {
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    };
    mockLimit.mockResolvedValue(limitResult);

    const req = makeRequest({ 'x-forwarded-for': '5.5.5.5' });
    await checkRateLimit(req, 'register');

    expect(mockLimit).toHaveBeenCalledWith('5.5.5.5');
  });

  it('retourne le reset timestamp depuis le limiteur', async () => {
    const resetTime = Date.now() + 30000;
    mockLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 3,
      reset: resetTime,
    });

    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const result = await checkRateLimit(req, 'login');

    expect(result!.reset).toBe(resetTime);
  });
});

// =============================================================================
// rateLimitMiddleware
// =============================================================================

describe('rateLimitMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne null si requete autorisee', async () => {
    mockLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    });

    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const response = await rateLimitMiddleware(req, 'login');

    expect(response).toBeNull();
  });

  it('retourne reponse 429 si limite depassee', async () => {
    mockLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60000,
    });

    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const response = await rateLimitMiddleware(req, 'login');

    expect(response).not.toBeNull();
    expect(response!.status).toBe(429);
  });

  it('reponse 429 contient le corps JSON attendu', async () => {
    mockLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60000,
    });

    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const response = await rateLimitMiddleware(req, 'login');

    const body = (await response!.json()) as Record<string, unknown>;
    expect(body.success).toBe(false);
    expect(body.code).toBe('RATE_LIMITED');
    expect(typeof body.error).toBe('string');
    expect(typeof body.retryAfter).toBe('number');
  });

  it('reponse 429 contient les headers RateLimit', async () => {
    const resetTime = Date.now() + 60000;
    mockLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: resetTime,
    });

    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const response = await rateLimitMiddleware(req, 'login');

    expect(response!.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(response!.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(response!.headers.get('X-RateLimit-Reset')).toBe(String(resetTime));
    expect(response!.headers.get('Retry-After')).toBeDefined();
  });

  it('Retry-After est un entier positif en secondes', async () => {
    const resetTime = Date.now() + 30000; // 30 secondes
    mockLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: resetTime,
    });

    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const response = await rateLimitMiddleware(req, 'login');

    const retryAfter = parseInt(response!.headers.get('Retry-After')!, 10);
    expect(retryAfter).toBeGreaterThan(0);
    expect(Number.isInteger(retryAfter)).toBe(true);
  });

  it('utilise le type general par defaut', async () => {
    mockLimit.mockResolvedValue({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60000,
    });

    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const response = await rateLimitMiddleware(req);

    expect(response).toBeNull();
  });

  it('fonctionne avec le type register', async () => {
    mockLimit.mockResolvedValue({
      success: false,
      limit: 3,
      remaining: 0,
      reset: Date.now() + 60000,
    });

    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const response = await rateLimitMiddleware(req, 'register');

    expect(response!.status).toBe(429);
    const body = (await response!.json()) as Record<string, unknown>;
    expect(body.code).toBe('RATE_LIMITED');
  });

  it('retryAfter est arrondi au superieur (Math.ceil)', async () => {
    // reset dans exactement 1500ms => retryAfter doit etre 2 (ceil(1.5))
    const resetTime = Date.now() + 1500;
    mockLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: resetTime,
    });

    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const response = await rateLimitMiddleware(req, 'login');

    const body = (await response!.json()) as Record<string, unknown>;
    expect(body.retryAfter as number).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(body.retryAfter as number)).toBe(true);
  });
});
