/**
 * Next.js Middleware - Auth Protection
 * ISO/IEC 25010 - Controle d'acces
 */

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/types/auth';

/**
 * Routes protegees necessitant authentification
 */
const PROTECTED_ROUTES = ['/practice', '/challenge', '/profile', '/badges'];

/**
 * Routes API auth (toujours accessibles)
 */
const AUTH_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Routes API auth: toujours accessibles
  if (AUTH_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Routes protegees: redirect vers / si pas de session
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!sessionToken) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
