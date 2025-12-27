/**
 * API Errors - Tables Magiques
 * ISO/IEC 25010 - Reliability (Error Reporting)
 *
 * Endpoint pour recevoir et stocker les erreurs frontend
 * Pas d'authentification requise (erreurs peuvent survenir avant login)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  storeErrors,
  getRecentErrors,
  getErrorStats,
  getErrorSystemHealth,
} from '@/lib/errors/storage';
import type { ErrorReport } from '@/lib/errorReporter';

// =============================================================================
// TYPES
// =============================================================================

interface ErrorPayload {
  errors: (ErrorReport & { id: string })[];
}

// =============================================================================
// VALIDATION
// =============================================================================

function isValidErrorPayload(body: unknown): body is ErrorPayload {
  if (!body || typeof body !== 'object') return false;
  const payload = body as Record<string, unknown>;
  if (!Array.isArray(payload.errors)) return false;

  // Validation légère - on ne veut pas bloquer les erreurs légitimes
  return payload.errors.every(
    (err) =>
      typeof err === 'object' &&
      err !== null &&
      'message' in err &&
      'type' in err &&
      'severity' in err
  );
}

// =============================================================================
// RATE LIMITING (simple, basé sur IP)
// =============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 100; // 100 requêtes
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // par minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Cleanup périodique (évite memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 1000);

// =============================================================================
// POST /api/errors - Recevoir erreurs frontend
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 });
    }

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
    }

    // Validation
    if (!isValidErrorPayload(body)) {
      return NextResponse.json(
        { error: 'Payload invalide', expected: { errors: 'ErrorReport[]' } },
        { status: 400 }
      );
    }

    // Limiter le nombre d'erreurs par requête
    const errorsToStore = body.errors.slice(0, 20);

    // Stocker
    const result = await storeErrors(errorsToStore);

    return NextResponse.json({
      success: true,
      stored: result.stored,
      failed: result.failed,
    });
  } catch (error) {
    console.error('Erreur POST /api/errors:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// =============================================================================
// GET /api/errors - Dashboard erreurs (admin)
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Health check simple
    if (action === 'health') {
      const health = await getErrorSystemHealth();
      return NextResponse.json(health);
    }

    // Stats
    if (action === 'stats') {
      const stats = await getErrorStats();
      return NextResponse.json({ stats });
    }

    // Liste des erreurs récentes
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const errors = await getRecentErrors(Math.min(limit, 100));
    const stats = await getErrorStats();

    return NextResponse.json({
      errors,
      stats,
      count: errors.length,
    });
  } catch (error) {
    console.error('Erreur GET /api/errors:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
