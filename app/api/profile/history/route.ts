/**
 * API Profile History - Tables Magiques
 * ISO/IEC 25010 - Endpoint historique sessions utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth/session';
import { getSessionHistory } from '@/lib/stats/storage';
import type { SessionHistoryFilters } from '@/types/profile';

/**
 * GET /api/profile/history
 * Récupère l'historique des sessions avec filtres et pagination
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const session = await getSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const filters: SessionHistoryFilters = {
      mode: (searchParams.get('mode') as 'practice' | 'challenge') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: searchParams.has('limit')
        ? Math.min(Math.max(Number(searchParams.get('limit')), 1), 100)
        : 20,
      offset: searchParams.has('offset')
        ? Math.max(Number(searchParams.get('offset')), 0)
        : 0,
    };

    const history = await getSessionHistory(session.userId, filters);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Erreur API profile/history:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
