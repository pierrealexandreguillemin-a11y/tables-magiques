/**
 * API Route - Logout
 * POST /api/auth/logout
 * ISO/IEC 25010 - Deconnexion securisee
 */

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/types/auth';
import { deleteSession } from '@/lib/auth';
import type { LogoutResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Recuperer le token depuis le cookie
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    // 2. Supprimer la session si elle existe
    if (token) {
      await deleteSession(token);
    }

    // 3. Reponse avec suppression du cookie
    const successResponse: LogoutResponse = {
      success: true,
      message: 'Déconnexion réussie',
    };
    const response = NextResponse.json(successResponse, { status: 200 });

    // Supprimer le cookie
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediatement
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const errorResponse: LogoutResponse = {
      success: false,
      message: 'Erreur lors de la déconnexion',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
