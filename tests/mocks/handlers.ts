/**
 * MSW Request Handlers - Tables Magiques
 * ISO/IEC 29119 - Mock TRANSPORT only, NOT data
 *
 * MSW intercepte le réseau, les données viennent des fixtures RÉELLES
 * AUCUNE donnée inventée - TOUT vient des fixtures
 */

import { http, HttpResponse } from 'msw';
import {
  // Multiplications
  MULTIPLICATION_FIXTURES,
  // User Progress
  USER_PROGRESS_FIXTURES,
  // Sessions
  API_SESSION_FIXTURE,
  // Badges
  EARNED_BADGES_FIXTURE,
  CHECK_BADGES_PRACTICE_RESPONSE,
  CHECK_BADGES_CHALLENGE_RESPONSE,
  // Game State
  ACTIVE_GAME_STATE_FIXTURE,
  GAME_ANSWER_CORRECT_RESPONSE,
  GAME_START_RESPONSE,
  GAME_END_RESPONSE,
  // Auth
  EMMA_USER_FIXTURE,
  LOGIN_SUCCESS_RESPONSE,
  LOGIN_ERROR_RESPONSE,
  REGISTER_SUCCESS_RESPONSE,
  REGISTER_USER_EXISTS_RESPONSE,
  // Scores
  PRACTICE_SCORES_FIXTURE,
  CHALLENGE_SCORES_FIXTURE,
  SCORE_STATS_PRACTICE_FIXTURE,
  SCORE_STATS_CHALLENGE_FIXTURE,
  SCORE_PRACTICE_FIXTURE,
  // Profile
  EMMA_PROFILE_USER,
  EMMA_EXPECTED_STATS,
  EMMA_PRACTICE_STATS,
  EMMA_CHALLENGE_STATS,
  EMMA_TABLE_PROGRESS,
  EMMA_RECENT_SESSIONS,
} from '../fixtures';
import { ALL_BADGES } from '@/config/badges';

export const handlers = [
  // ============================================================================
  // MULTIPLICATIONS API
  // ============================================================================

  // GET /api/multiplications - Toutes les tables
  http.get('/api/multiplications', () => {
    return HttpResponse.json(MULTIPLICATION_FIXTURES);
  }),

  // GET /api/multiplications/:table - Table spécifique
  http.get('/api/multiplications/:table', ({ params }) => {
    const table = Number(params.table);

    if (isNaN(table) || table < 1 || table > 10) {
      return HttpResponse.json(
        { error: 'Table invalide', validRange: '1-10' },
        { status: 400 }
      );
    }

    const tableData = MULTIPLICATION_FIXTURES.find((t) => t.table === table);

    if (!tableData) {
      return HttpResponse.json({ error: 'Table non trouvée' }, { status: 404 });
    }

    return HttpResponse.json(tableData);
  }),

  // ============================================================================
  // USER PROGRESS API
  // ============================================================================

  // GET /api/progress - Progression utilisateur
  http.get('/api/progress', () => {
    return HttpResponse.json(USER_PROGRESS_FIXTURES);
  }),

  // GET /api/progress/:userId - Progression spécifique
  http.get('/api/progress/:userId', ({ params }) => {
    const { userId } = params;

    if (userId !== USER_PROGRESS_FIXTURES.userId) {
      return HttpResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return HttpResponse.json(USER_PROGRESS_FIXTURES);
  }),

  // POST /api/progress - Enregistrer réponse
  http.post('/api/progress', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    // Validation basique
    if (!body.problemId || body.userAnswer === undefined) {
      return HttpResponse.json(
        { error: 'Données manquantes: problemId et userAnswer requis' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        ...body,
        recordedAt: '2025-12-26T14:00:00.000Z', // Date fixe depuis fixtures
      },
    });
  }),

  // ============================================================================
  // SESSION API
  // ============================================================================

  // GET /api/session - Session utilisateur active
  http.get('/api/session', () => {
    return HttpResponse.json(API_SESSION_FIXTURE);
  }),

  // POST /api/session - Créer nouvelle session
  http.post('/api/session', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      success: true,
      session: {
        id: 'session-fixture-001',
        userId: body.userId || 'user-456',
        startedAt: '2025-12-26T14:00:00.000Z',
        mode: body.mode || 'practice',
        tableSelected: body.table || null,
      },
    });
  }),

  // DELETE /api/session - Terminer session
  http.delete('/api/session', () => {
    return HttpResponse.json({
      success: true,
      message: 'Session terminée',
    });
  }),

  // ============================================================================
  // BADGES API - 100% fixtures, 0 données inventées
  // ============================================================================

  // GET /api/badges - Badges de l'utilisateur connecté
  http.get('/api/badges', () => {
    // Combiner badges gagnés avec définitions complètes
    const badgesWithStatus = ALL_BADGES.map((badge) => {
      const earned = EARNED_BADGES_FIXTURE.find((e) => e.id === badge.id);
      return {
        ...badge,
        earned: !!earned,
        earnedAt: earned?.earnedAt || null,
      };
    });

    return HttpResponse.json({
      badges: badgesWithStatus,
      earnedCount: EARNED_BADGES_FIXTURE.length,
      totalCount: ALL_BADGES.length,
    });
  }),

  // POST /api/badges - Check badges (practice ou challenge)
  // Retourne des fixtures RÉELLES, pas des données inventées
  http.post('/api/badges', async ({ request }) => {
    const body = (await request.json()) as {
      mode: 'practice' | 'challenge';
      practiceStats?: unknown;
      challengeResult?: unknown;
    };

    // Retourne la fixture appropriée selon le mode
    if (body.mode === 'practice') {
      return HttpResponse.json(CHECK_BADGES_PRACTICE_RESPONSE);
    }
    return HttpResponse.json(CHECK_BADGES_CHALLENGE_RESPONSE);
  }),

  // ============================================================================
  // GAME API - Réponses déterministes depuis fixtures
  // ============================================================================

  // GET /api/game/state - État du jeu en cours
  http.get('/api/game/state', () => {
    return HttpResponse.json(ACTIVE_GAME_STATE_FIXTURE);
  }),

  // POST /api/game/start - Démarrer partie
  http.post('/api/game/start', async ({ request }) => {
    const body = (await request.json()) as { mode?: string; table?: number };
    return HttpResponse.json({
      ...GAME_START_RESPONSE,
      mode: body.mode || GAME_START_RESPONSE.mode,
      table: body.table || GAME_START_RESPONSE.table,
    });
  }),

  // POST /api/game/answer - Soumettre réponse
  // DÉTERMINISTE: toujours retourne une réponse correcte (fixture)
  // Pas de Math.random() - comportement prévisible pour tests
  http.post('/api/game/answer', () => {
    return HttpResponse.json(GAME_ANSWER_CORRECT_RESPONSE);
  }),

  // POST /api/game/end - Terminer partie
  http.post('/api/game/end', () => {
    return HttpResponse.json(GAME_END_RESPONSE);
  }),

  // ============================================================================
  // AUTH API - 100% fixtures réelles
  // ============================================================================

  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
    };

    // Validation basique
    if (!body.username || body.username.length < 4) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Le pseudo doit faire au moins 4 caracteres',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.password || body.password.length < 4) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Le mot de passe doit faire au moins 4 caracteres',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Authentification avec fixture
    if (body.username === 'emma' && body.password === 'magique123') {
      return HttpResponse.json(LOGIN_SUCCESS_RESPONSE);
    }

    return HttpResponse.json(LOGIN_ERROR_RESPONSE, { status: 401 });
  }),

  // POST /api/auth/register
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
      confirmPassword: string;
    };

    // Validation basique
    if (!body.username || body.username.length < 4) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Le pseudo doit faire au moins 4 caracteres',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.password !== body.confirmPassword) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Les mots de passe ne correspondent pas',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Username déjà pris (emma existe dans fixtures)
    if (body.username.toLowerCase() === 'emma') {
      return HttpResponse.json(REGISTER_USER_EXISTS_RESPONSE, { status: 409 });
    }

    // Succès inscription
    return HttpResponse.json(REGISTER_SUCCESS_RESPONSE, { status: 201 });
  }),

  // GET /api/auth/me
  http.get('/api/auth/me', ({ cookies }) => {
    const sessionCookie = cookies.tm_session;

    if (!sessionCookie) {
      return HttpResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // Session valide = retourne Emma (fixture)
    return HttpResponse.json({
      authenticated: true,
      user: EMMA_USER_FIXTURE,
    });
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      message: 'Deconnexion reussie',
    });
  }),

  // ============================================================================
  // SCORES API
  // ============================================================================

  // GET /api/scores - Scores utilisateur avec filtres
  http.get('/api/scores', ({ request }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'practice';
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    const scores =
      mode === 'challenge' ? CHALLENGE_SCORES_FIXTURE : PRACTICE_SCORES_FIXTURE;
    const stats =
      mode === 'challenge'
        ? SCORE_STATS_CHALLENGE_FIXTURE
        : SCORE_STATS_PRACTICE_FIXTURE;

    return HttpResponse.json({
      scores: scores.slice(0, limit),
      stats,
    });
  }),

  // POST /api/scores - Sauvegarder nouveau score
  http.post('/api/scores', async ({ request }) => {
    const body = (await request.json()) as {
      mode: 'practice' | 'challenge';
      table?: number;
      correct: number;
      total: number;
      timeRemaining?: number;
    };

    // Validation basique
    if (!body.mode || !['practice', 'challenge'].includes(body.mode)) {
      return HttpResponse.json(
        { error: 'Mode invalide', details: [{ path: ['mode'] }] },
        { status: 400 }
      );
    }

    if (body.correct === undefined || body.total === undefined) {
      return HttpResponse.json(
        {
          error: 'Donnees invalides',
          details: [{ path: ['correct', 'total'] }],
        },
        { status: 400 }
      );
    }

    // Retourne le score de fixture avec les données du body
    return HttpResponse.json(
      {
        success: true,
        score: {
          ...SCORE_PRACTICE_FIXTURE,
          ...body,
          timestamp: '2025-12-26T14:00:00.000Z',
        },
      },
      { status: 201 }
    );
  }),

  // ============================================================================
  // PROFILE API
  // ============================================================================

  // GET /api/profile - Données profil utilisateur
  http.get('/api/profile', ({ cookies }) => {
    const sessionCookie = cookies.session || cookies.tm_session;

    if (!sessionCookie) {
      return HttpResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Profil Emma complet avec fixtures réelles
    return HttpResponse.json({
      success: true,
      profile: {
        user: {
          id: EMMA_PROFILE_USER.id,
          username: EMMA_PROFILE_USER.username,
          createdAt: EMMA_PROFILE_USER.createdAt,
          lastLoginAt: EMMA_PROFILE_USER.lastLoginAt,
        },
        stats: EMMA_EXPECTED_STATS,
        modeStats: {
          practice: EMMA_PRACTICE_STATS,
          challenge: EMMA_CHALLENGE_STATS,
        },
        recentSessions: EMMA_RECENT_SESSIONS.slice(0, 5),
        progress: {
          tables: EMMA_TABLE_PROGRESS,
          masteredCount: EMMA_TABLE_PROGRESS.filter((t) => t.mastered).length,
          totalTables: 10,
        },
        badgeCount: EARNED_BADGES_FIXTURE.length,
      },
    });
  }),
];

/**
 * Handlers d'erreur pour tests de résilience
 */
export const errorHandlers = [
  http.get('/api/multiplications', () => {
    return HttpResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }),

  http.get('/api/progress', () => {
    return HttpResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }),
];

/**
 * Handler de latence pour tests de performance
 */
export const slowHandlers = [
  http.get('/api/multiplications', async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return HttpResponse.json(MULTIPLICATION_FIXTURES);
  }),
];
