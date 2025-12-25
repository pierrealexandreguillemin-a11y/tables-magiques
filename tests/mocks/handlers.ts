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

  // GET /api/badges - Badges de l'utilisateur
  http.get('/api/badges', () => {
    return HttpResponse.json(EARNED_BADGES_FIXTURE);
  }),

  // GET /api/badges/:userId - Badges spécifiques
  http.get('/api/badges/:userId', ({ params }) => {
    const { userId } = params;

    if (userId !== 'user-456') {
      return HttpResponse.json([], { status: 200 }); // Nouvel utilisateur = pas de badges
    }

    return HttpResponse.json(EARNED_BADGES_FIXTURE);
  }),

  // POST /api/badges - Attribuer nouveau badge
  http.post('/api/badges', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      success: true,
      badge: {
        id: body.badgeId,
        mode: body.mode,
        earnedAt: new Date().toISOString(),
      },
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
  // AUTH API (minimal pour tests)
  // ============================================================================

  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
    };

    if (body.username === 'emma' && body.password === 'magique123') {
      return HttpResponse.json({
        success: true,
        user: { id: 'user-456', username: 'emma' },
      });
    }

    return HttpResponse.json(
      { success: false, message: 'Identifiants incorrects' },
      { status: 401 }
    );
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
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
