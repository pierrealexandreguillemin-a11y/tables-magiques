/**
 * Auth API - Tables Magiques
 * ISO/IEC 25010 - Fonctions API authentification
 */

import type { SafeUser, LoginInput, RegisterInput } from '@/types/auth';

// =============================================================================
// TYPES RESPONSE API
// =============================================================================

export interface AuthResponse {
  success: boolean;
  user?: SafeUser;
  error?: string;
}

export interface MeResponse {
  authenticated: boolean;
  user?: SafeUser;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Recupere l'utilisateur courant
 */
export async function fetchCurrentUser(): Promise<MeResponse> {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  return response.json();
}

/**
 * Connexion utilisateur
 */
export async function loginUser(
  credentials: LoginInput
): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  return response.json();
}

/**
 * Inscription utilisateur
 */
export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  return response.json();
}

/**
 * Deconnexion
 */
export async function logoutUser(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}
