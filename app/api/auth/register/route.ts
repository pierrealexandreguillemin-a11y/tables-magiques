/**
 * API Route - Register
 * POST /api/auth/register
 * ISO/IEC 25010 - Inscription securisee
 */

import { NextRequest, NextResponse } from 'next/server';
import { RegisterSchema, SESSION_COOKIE_NAME } from '@/types/auth';
import { createUser, createSession } from '@/lib/auth';
import { rateLimitMiddleware } from '@/lib/auth/rateLimit';
import type { AuthErrorResponse, AuthSuccessResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // 0. Rate limiting (3 inscriptions/min par IP)
    const rateLimitResponse = await rateLimitMiddleware(request, 'register');
    if (rateLimitResponse) return rateLimitResponse;

    // 1. Parser le body
    const body = await request.json();

    // 2. Valider les donnees
    const validation = RegisterSchema.safeParse(body);

    if (!validation.success) {
      const errorResponse: AuthErrorResponse = {
        success: false,
        error: validation.error.issues[0]?.message || 'Donnees invalides',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 3. Creer l'utilisateur
    let user;
    try {
      user = await createUser(validation.data);
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_EXISTS') {
        const errorResponse: AuthErrorResponse = {
          success: false,
          error: 'Ce pseudo est deja pris',
          code: 'USER_EXISTS',
        };
        return NextResponse.json(errorResponse, { status: 409 });
      }
      throw error;
    }

    // 4. Creer la session (auto-login apres inscription)
    const token = await createSession(user);

    // 5. Reponse avec cookie de session
    const successResponse: AuthSuccessResponse = {
      success: true,
      user,
      token,
    };
    const response = NextResponse.json(successResponse, { status: 201 });

    // Cookie HttpOnly pour securite
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 heures
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    const errorResponse: AuthErrorResponse = {
      success: false,
      error: 'Erreur serveur',
      code: 'SERVER_ERROR',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
