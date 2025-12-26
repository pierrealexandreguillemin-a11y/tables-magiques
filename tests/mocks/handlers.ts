/**
 * MSW Request Handlers - Tables Magiques
 * ISO/IEC 29119 - Mock TRANSPORT only, NOT data
 *
 * MSW intercepte le réseau, les données viennent des fixtures RÉELLES
 */

import { http, HttpResponse } from 'msw';
import {
  MULTIPLICATION_FIXTURES,
  USER_PROGRESS_FIXTURES,
  API_SESSION_FIXTURE,
  EARNED_BADGES_FIXTURE,
  ACTIVE_GAME_STATE_FIXTURE,
  EMMA_USER_FIXTURE,
  LOGIN_SUCCESS_RESPONSE,
  LOGIN_ERROR_RESPONSE,
  REGISTER_SUCCESS_RESPONSE,
  REGISTER_USER_EXISTS_RESPONSE,
  PRACTICE_SCORES_FIXTURE,
  CHALLENGE_SCORES_FIXTURE,
  SCORE_STATS_PRACTICE_FIXTURE,
  SCORE_STATS_CHALLENGE_FIXTURE,
} from '../fixtures';

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
        recordedAt: new Date().toISOString(),
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
        id: `session-${Date.now()}`,
        userId: body.userId || 'user-456',
        startedAt: new Date().toISOString(),
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
  // BADGES API
  // ============================================================================

  // GET /api/badges - Badges de l'utilisateur connecte (via session)
  http.get('/api/badges', () => {
    return HttpResponse.json({
      badges: EARNED_BADGES_FIXTURE.map((b) => ({
        ...b,
        earned: true,
        earnedAt: b.earnedAt,
        emoji: '⭐',
        name: `Badge ${b.id}`,
        description: `Description ${b.id}`,
        condition: { type: 'streak', value: 5 },
      })),
      earnedCount: EARNED_BADGES_FIXTURE.length,
      totalCount: 13,
    });
  }),

  // POST /api/badges - Check badges (practice ou challenge)
  http.post('/api/badges', async ({ request }) => {
    const body = (await request.json()) as {
      mode: 'practice' | 'challenge';
      practiceStats?: unknown;
      challengeResult?: unknown;
    };

    // Simuler nouveau badge gagne
    const newBadges =
      body.mode === 'practice'
        ? [
            {
              id: 'streak5',
              emoji: '🔥',
              name: 'Serie de 5',
              description: '5 bonnes reponses',
            },
          ]
        : [
            {
              id: 'speed5',
              emoji: '⚡',
              name: 'Eclair Rapide',
              description: '5 questions en 30s',
            },
          ];

    return HttpResponse.json({
      newBadges,
      message: `${newBadges.length} nouveau(x) badge(s) debloque(s)`,
    });
  }),

  // ============================================================================
  // GAME API
  // ============================================================================

  // GET /api/game/state - État du jeu en cours
  http.get('/api/game/state', () => {
    return HttpResponse.json(ACTIVE_GAME_STATE_FIXTURE);
  }),

  // POST /api/game/start - Démarrer partie
  http.post('/api/game/start', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      success: true,
      gameId: `game-${Date.now()}`,
      mode: body.mode || 'practice',
      table: body.table,
      startedAt: new Date().toISOString(),
    });
  }),

  // POST /api/game/answer - Soumettre réponse
  http.post('/api/game/answer', async ({ request }) => {
    // Parse request to validate format
    await request.json();

    // Simuler vérification
    const isCorrect = Math.random() > 0.3; // 70% de réussite simulée

    return HttpResponse.json({
      success: true,
      isCorrect,
      correctAnswer: 56, // Fixe pour les tests
      newScore: isCorrect ? 1 : 0,
      streak: isCorrect ? 1 : 0,
    });
  }),

  // POST /api/game/end - Terminer partie
  http.post('/api/game/end', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      success: true,
      gameId: body.gameId,
      finalScore: 8,
      totalQuestions: 10,
      accuracy: 0.8,
      newBadges: [],
      endedAt: new Date().toISOString(),
    });
  }),

  // ============================================================================
  // AUTH API (complet avec fixtures reelles)
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

    // Username deja pris (emma existe)
    if (body.username.toLowerCase() === 'emma') {
      return HttpResponse.json(REGISTER_USER_EXISTS_RESPONSE, { status: 409 });
    }

    // Succes inscription
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

    // Session valide = retourne Emma
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

    // Retourner score cree
    return HttpResponse.json(
      {
        success: true,
        score: {
          userId: 'user-456',
          ...body,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
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
