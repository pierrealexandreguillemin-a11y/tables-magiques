/**
 * API Profile - Tables Magiques
 * ISO/IEC 25010 - Endpoint profil utilisateur
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth/session';
import { getProfileData } from '@/lib/stats/storage';

/**
 * GET /api/profile
 * Récupère les données complètes du profil utilisateur
 */
export async function GET() {
  try {
    // Vérifier authentification
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const session = await getSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    // Récupérer données profil
    const profile = await getProfileData(session.userId);

    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Erreur API profile:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
