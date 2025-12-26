/**
 * API Scores - Tables Magiques
 * ISO/IEC 25010 - GET/POST scores utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth/session';
import {
  getRecentScores,
  saveScore,
  getScoreStats,
} from '@/lib/scores/storage';
import {
  SaveScoreSchema,
  GetScoresQuerySchema,
} from '@/lib/validation/schemas';
import type { GameMode } from '@/types/game';

/**
 * GET /api/scores
 * Recupere les scores de l'utilisateur connecte
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const session = await getSession(token);

    if (!session) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    // Parse query params (null -> undefined pour Zod)
    const { searchParams } = new URL(request.url);
    const modeParam = searchParams.get('mode');
    const limitParam = searchParams.get('limit');

    const parsed = GetScoresQuerySchema.safeParse({
      mode: modeParam ?? undefined,
      limit: limitParam ?? undefined,
    });

    const mode: GameMode =
      parsed.success && parsed.data.mode ? parsed.data.mode : 'practice';
    const limit = parsed.success ? parsed.data.limit : 20;

    const scores = await getRecentScores(session.userId, mode, limit);
    const stats = await getScoreStats(session.userId, mode);

    return NextResponse.json({
      scores,
      stats,
    });
  } catch (error) {
    console.error('Erreur GET /api/scores:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST /api/scores
 * Sauvegarde un nouveau score
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const session = await getSession(token);

    if (!session) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SaveScoreSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Donnees invalides', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const score = await saveScore(session.userId, parsed.data);

    return NextResponse.json(
      {
        success: true,
        score,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/scores:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
