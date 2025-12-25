/**
 * API Route - Current User
 * GET /api/auth/me
 * ISO/IEC 25010 - Recuperation session courante
 */

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/types/auth';
import { getSession, getUserById } from '@/lib/auth';
import type { SafeUser } from '@/types/auth';

interface MeSuccessResponse {
  authenticated: true;
  user: SafeUser;
}

interface MeErrorResponse {
  authenticated: false;
  user: null;
}

const notAuthenticatedResponse: MeErrorResponse = {
  authenticated: false,
  user: null,
};

export async function GET(request: NextRequest) {
  try {
    // 1. Recuperer le token depuis le cookie
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(notAuthenticatedResponse);
    }

    // 2. Recuperer la session
    const session = await getSession(token);

    if (!session) {
      // Session expiree ou invalide
      const response = NextResponse.json(notAuthenticatedResponse);

      // Nettoyer le cookie invalide
      response.cookies.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    // 3. Recuperer l'utilisateur
    const user = await getUserById(session.userId);

    if (!user) {
      return NextResponse.json(notAuthenticatedResponse);
    }

    const successResponse: MeSuccessResponse = {
      authenticated: true,
      user,
    };
    return NextResponse.json(successResponse);
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(notAuthenticatedResponse);
  }
}
