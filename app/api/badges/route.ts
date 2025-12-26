/**
 * API Badges - Tables Magiques
 * ISO/IEC 25010 - GET/POST badges utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth/session';
import {
  getUserBadges,
  addUserBadges,
  getUserBadgeIds,
} from '@/lib/badges/storage';
import {
  checkPracticeBadges,
  checkChallengeBadges,
  getNewBadges,
} from '@/features/badges';
import { ALL_BADGES } from '@/config/badges';
import { z } from 'zod';

// Schemas Zod qui produisent des types compatibles avec les types metier
const PracticeStatsSchema = z.object({
  correctAnswers: z.number().min(0),
  totalQuestions: z.number().min(0),
  currentStreak: z.number().min(0),
  maxStreak: z.number().min(0),
});

const ChallengeResultSchema = z.object({
  correctAnswers: z.number().min(0),
  totalQuestions: z.number().min(0),
  accuracy: z.number().min(0).max(1),
  timeBonus: z.number().min(0),
  streakBonus: z.number().min(0),
  totalScore: z.number().min(0),
});

/**
 * GET /api/badges
 * Recupere tous les badges de l'utilisateur connecte
 */
export async function GET() {
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

    const earnedBadges = await getUserBadges(session.userId);
    const earnedIds = earnedBadges.map((b) => b.id);

    // Enrichir avec les definitions completes
    const badges = ALL_BADGES.map((def) => ({
      ...def,
      earned: earnedIds.includes(def.id),
      earnedAt: earnedBadges.find((b) => b.id === def.id)?.earnedAt || null,
    }));

    return NextResponse.json({
      badges,
      earnedCount: earnedBadges.length,
      totalCount: ALL_BADGES.length,
    });
  } catch (error) {
    console.error('Erreur GET /api/badges:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Schema validation pour POST - discriminated union
const PracticeCheckSchema = z.object({
  mode: z.literal('practice'),
  practiceStats: PracticeStatsSchema,
});

const ChallengeCheckSchema = z.object({
  mode: z.literal('challenge'),
  challengeResult: ChallengeResultSchema,
});

const CheckBadgesSchema = z.discriminatedUnion('mode', [
  PracticeCheckSchema,
  ChallengeCheckSchema,
]);

/**
 * POST /api/badges
 * Verifie et attribue les nouveaux badges gagnes
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
    const parsed = CheckBadgesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Donnees invalides', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Determiner les badges debloques selon le mode (discriminated union)
    let unlockedIds: string[];

    if (data.mode === 'practice') {
      unlockedIds = checkPracticeBadges(data.practiceStats);
    } else {
      unlockedIds = checkChallengeBadges(data.challengeResult);
    }

    // Filtrer les badges deja gagnes
    const alreadyEarned = await getUserBadgeIds(session.userId);
    const newBadges = getNewBadges(unlockedIds, alreadyEarned);

    if (newBadges.length === 0) {
      return NextResponse.json({
        newBadges: [],
        message: 'Aucun nouveau badge',
      });
    }

    // Persister les nouveaux badges
    const badgesToAdd = newBadges.map((b) => ({
      id: b.badgeId,
      mode: data.mode,
    }));

    await addUserBadges(session.userId, badgesToAdd);

    return NextResponse.json({
      newBadges: newBadges.map((b) => ({
        id: b.badgeId,
        emoji: b.badge.emoji,
        name: b.badge.name,
        description: b.badge.description,
      })),
      message: `${newBadges.length} nouveau(x) badge(s) gagne(s)!`,
    });
  } catch (error) {
    console.error('Erreur POST /api/badges:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
