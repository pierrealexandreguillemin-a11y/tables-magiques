/**
 * MSW Handlers - Auth API
 */

import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // GET /api/auth/me — authenticated user
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      authenticated: true,
      user: {
        id: 'user-1',
        username: 'testuser',
        createdAt: '2025-12-26T00:00:00.000Z',
        lastLoginAt: '2026-03-19T10:00:00.000Z',
      },
    });
  }),

  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
    };

    if (body.username === 'testuser' && body.password === 'Password1!') {
      return HttpResponse.json({
        success: true,
        user: {
          id: 'user-1',
          username: 'testuser',
          createdAt: '2025-12-26T00:00:00.000Z',
          lastLoginAt: new Date().toISOString(),
        },
      });
    }

    return HttpResponse.json(
      { success: false, error: 'Identifiants invalides' },
      { status: 401 }
    );
  }),

  // POST /api/auth/register
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
    };

    if (body.username === 'existing') {
      return HttpResponse.json(
        { success: false, error: 'Nom deja pris' },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      success: true,
      user: {
        id: 'user-new',
        username: body.username,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
    });
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 200 });
  }),
];
