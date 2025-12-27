/**
 * API Health Check - Tables Magiques
 * GET /api/health
 * ISO/IEC 25010 - Reliability (Availability)
 *
 * Endpoint de monitoring pour:
 * - Vercel health checks
 * - Uptime monitoring (UptimeRobot, Pingdom, etc.)
 * - Kubernetes/Docker healthchecks
 */

import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/db/upstash';

// =============================================================================
// TYPES
// =============================================================================

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    redis: 'ok' | 'error' | 'unconfigured';
    api: 'ok';
  };
  latency?: {
    redis?: number;
  };
}

// =============================================================================
// HELPERS
// =============================================================================

const startTime = Date.now();

async function checkRedis(): Promise<{
  status: 'ok' | 'error' | 'unconfigured';
  latency?: number;
}> {
  const redis = getRedis();

  if (!redis) {
    return { status: 'unconfigured' };
  }

  try {
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    return { status: 'ok', latency };
  } catch (error) {
    console.error('[Health] Redis check failed:', error);
    return { status: 'error' };
  }
}

// =============================================================================
// GET /api/health
// =============================================================================

export async function GET() {
  const redisCheck = await checkRedis();

  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      redis: redisCheck.status,
      api: 'ok',
    },
  };

  // Add latency if available
  if (redisCheck.latency !== undefined) {
    health.latency = { redis: redisCheck.latency };
  }

  // Determine overall status
  if (redisCheck.status === 'error') {
    health.status = 'degraded';
  }

  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : 503;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

// =============================================================================
// HEAD /api/health (minimal check for uptime monitors)
// =============================================================================

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
