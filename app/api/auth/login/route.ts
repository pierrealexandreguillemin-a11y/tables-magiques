/**
 * API Route - Login
 * POST /api/auth/login
 * ISO/IEC 25010 - Authentification securisee
 */

import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema, SESSION_COOKIE_NAME } from '@/types/auth';
import { authenticateUser, createSession } from '@/lib/auth';
import type { AuthErrorResponse, AuthSuccessResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Parser le body
    const body = await request.json();

    // 2. Valider les donnees
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      const errorResponse: AuthErrorResponse = {
        success: false,
        error: validation.error.issues[0]?.message || 'Donnees invalides',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 3. Authentifier l'utilisateur
    const user = await authenticateUser(validation.data);

    if (!user) {
      const errorResponse: AuthErrorResponse = {
        success: false,
        error: 'Identifiants incorrects',
        code: 'INVALID_CREDENTIALS',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // 4. Creer la session
    const token = await createSession(user);

    // 5. Reponse avec cookie de session
    const successResponse: AuthSuccessResponse = {
      success: true,
      user,
      token,
    };
    const response = NextResponse.json(successResponse, { status: 200 });

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
    console.error('Login error:', error);
    const errorResponse: AuthErrorResponse = {
      success: false,
      error: 'Erreur serveur',
      code: 'SERVER_ERROR',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
