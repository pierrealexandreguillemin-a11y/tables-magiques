/**
 * Integration Tests - API avec MSW
 * ISO/IEC 29119 - DONNÉES RÉELLES via fixtures
 *
 * Ces tests vérifient que les appels API fonctionnent
 * correctement avec MSW interceptant le réseau et
 * retournant des données RÉELLES.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import {
  MULTIPLICATION_FIXTURES,
  TABLE_7_FIXTURE,
  USER_PROGRESS_FIXTURES,
  EARNED_BADGES_FIXTURE,
} from '../fixtures';

// Start MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Integration - Multiplications', () => {
  describe('GET /api/multiplications', () => {
    it('retourne toutes les tables de multiplication', async () => {
      const response = await fetch('/api/multiplications');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveLength(10);
      expect(data).toEqual(MULTIPLICATION_FIXTURES);
    });

    it('chaque table contient 10 problèmes', async () => {
      const response = await fetch('/api/multiplications');
      const data = await response.json();

      data.forEach((table: { problems: unknown[] }) => {
        expect(table.problems).toHaveLength(10);
      });
    });

    it('les réponses sont mathématiquement correctes', async () => {
      const response = await fetch('/api/multiplications');
      const data = await response.json();

      data.forEach(
        (table: {
          table: number;
          problems: Array<{ a: number; b: number; answer: number }>;
        }) => {
          table.problems.forEach((problem) => {
            expect(problem.answer).toBe(problem.a * problem.b);
          });
        }
      );
    });
  });

  describe('GET /api/multiplications/:table', () => {
    it('retourne la table de 7 correctement', async () => {
      const response = await fetch('/api/multiplications/7');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.table).toBe(7);
      expect(data.problems).toHaveLength(10);
      expect(data).toEqual(TABLE_7_FIXTURE);
    });

    it('retourne 400 pour table invalide', async () => {
      const response = await fetch('/api/multiplications/15');

      expect(response.status).toBe(400);
    });

    it('retourne 400 pour table non-numérique', async () => {
      const response = await fetch('/api/multiplications/abc');

      expect(response.status).toBe(400);
    });
  });
});

describe('API Integration - User Progress', () => {
  describe('GET /api/progress', () => {
    it('retourne la progression utilisateur', async () => {
      const response = await fetch('/api/progress');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.userId).toBe(USER_PROGRESS_FIXTURES.userId);
      expect(data.totalScore).toBe(USER_PROGRESS_FIXTURES.totalScore);
      expect(data.tablesProgress).toHaveLength(10);
    });

    it('contient les niveaux de maîtrise réalistes', async () => {
      const response = await fetch('/api/progress');
      const data = await response.json();

      // Table 1 devrait être maîtrisée (enfant 9 ans)
      const table1 = data.tablesProgress.find(
        (t: { table: number }) => t.table === 1
      );
      expect(table1.masteryLevel).toBe('mastered');

      // Table 7 en apprentissage (la plus difficile)
      const table7 = data.tablesProgress.find(
        (t: { table: number }) => t.table === 7
      );
      expect(table7.masteryLevel).toBe('learning');
    });
  });

  describe('POST /api/progress', () => {
    it('enregistre une réponse correctement', async () => {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: '7-8',
          userAnswer: 56,
          isCorrect: true,
          timeMs: 3500,
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.data.problemId).toBe('7-8');
    });

    it('rejette les données incomplètes', async () => {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: '7-8' }), // userAnswer manquant
      });

      expect(response.status).toBe(400);
    });
  });
});

describe('API Integration - Badges', () => {
  describe('GET /api/badges', () => {
    it('retourne les badges gagnés', async () => {
      const response = await fetch('/api/badges');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual(EARNED_BADGES_FIXTURE);
      expect(data.length).toBeGreaterThan(0);
    });

    it('contient des badges practice et challenge', async () => {
      const response = await fetch('/api/badges');
      const data = await response.json();

      const practiceBadges = data.filter(
        (b: { mode: string }) => b.mode === 'practice'
      );
      const challengeBadges = data.filter(
        (b: { mode: string }) => b.mode === 'challenge'
      );

      expect(practiceBadges.length).toBeGreaterThan(0);
      expect(challengeBadges.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/badges', () => {
    it('attribue un nouveau badge', async () => {
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeId: 'streak10',
          mode: 'practice',
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.badge.id).toBe('streak10');
      expect(data.badge.earnedAt).toBeDefined();
    });
  });
});

describe('API Integration - Session', () => {
  describe('GET /api/session', () => {
    it('retourne la session active', async () => {
      const response = await fetch('/api/session');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.userId).toBe('user-456');
      expect(data.tableSelected).toBe(7);
    });
  });

  describe('POST /api/session', () => {
    it('crée une nouvelle session', async () => {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'practice',
          table: 5,
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.session.mode).toBe('practice');
    });
  });

  describe('DELETE /api/session', () => {
    it('termine la session', async () => {
      const response = await fetch('/api/session', {
        method: 'DELETE',
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
    });
  });
});

describe('API Integration - Game', () => {
  describe('POST /api/game/start', () => {
    it('démarre une partie practice', async () => {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'practice',
          table: 7,
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('practice');
      expect(data.table).toBe(7);
    });

    it('démarre une partie challenge', async () => {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'challenge',
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.mode).toBe('challenge');
    });
  });

  describe('POST /api/game/end', () => {
    it('termine la partie avec les stats', async () => {
      const response = await fetch('/api/game/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'game-123',
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.finalScore).toBeDefined();
      expect(data.totalQuestions).toBeDefined();
      expect(data.accuracy).toBeDefined();
    });
  });
});

describe('API Integration - Error Handling', () => {
  it('gère les erreurs serveur gracieusement', async () => {
    // Override avec handler d'erreur
    server.use(
      http.get('/api/multiplications', () => {
        return HttpResponse.json({ error: 'Erreur serveur' }, { status: 500 });
      })
    );

    const response = await fetch('/api/multiplications');

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Erreur serveur');
  });

  it('gère les erreurs d authentification', async () => {
    server.use(
      http.get('/api/progress', () => {
        return HttpResponse.json({ error: 'Non autorisé' }, { status: 401 });
      })
    );

    const response = await fetch('/api/progress');

    expect(response.status).toBe(401);
  });
});

describe('API Integration - Auth', () => {
  describe('POST /api/auth/login', () => {
    it('authentifie utilisateur valide', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'emma',
          password: 'magique123',
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.user.username).toBe('emma');
    });

    it('rejette identifiants incorrects', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'emma',
          password: 'mauvais',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });
});
