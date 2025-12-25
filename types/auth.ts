/**
 * Types pour l'authentification - Tables Magiques
 * ISO/IEC 25010 - Conformite stricte TypeScript
 */

import { z } from 'zod';

// =============================================================================
// SCHEMAS DE VALIDATION ZOD
// =============================================================================

/**
 * Schema pour le login
 * - Username: 4-20 caracteres alphanumeriques
 * - Password: 4-50 caracteres
 */
export const LoginSchema = z.object({
  username: z
    .string()
    .min(4, 'Le pseudo doit faire au moins 4 caracteres')
    .max(20, 'Le pseudo ne peut pas depasser 20 caracteres')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Le pseudo ne peut contenir que des lettres, chiffres et underscores'
    ),
  password: z
    .string()
    .min(4, 'Le mot de passe doit faire au moins 4 caracteres')
    .max(50, 'Le mot de passe ne peut pas depasser 50 caracteres'),
});

/**
 * Schema pour l'inscription
 * Memes regles que login + confirmation password
 */
export const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(4, 'Le pseudo doit faire au moins 4 caracteres')
      .max(20, 'Le pseudo ne peut pas depasser 20 caracteres')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Le pseudo ne peut contenir que des lettres, chiffres et underscores'
      ),
    password: z
      .string()
      .min(4, 'Le mot de passe doit faire au moins 4 caracteres')
      .max(50, 'Le mot de passe ne peut pas depasser 50 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

// =============================================================================
// TYPES DERIVES DES SCHEMAS
// =============================================================================

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

// =============================================================================
// TYPES UTILISATEUR
// =============================================================================

/**
 * Utilisateur stocke en base (Redis)
 */
export interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string | null;
}

/**
 * Utilisateur renvoye au client (sans password)
 */
export interface SafeUser {
  id: string;
  username: string;
  createdAt: string;
  lastLoginAt: string | null;
}

/**
 * Session utilisateur stockee en Redis
 */
export interface Session {
  token: string;
  userId: string;
  username: string;
  createdAt: string;
  expiresAt: string;
}

// =============================================================================
// TYPES API RESPONSES
// =============================================================================

export interface AuthSuccessResponse {
  success: true;
  user: SafeUser;
  token: string;
}

export interface AuthErrorResponse {
  success: false;
  error: string;
  code?:
    | 'INVALID_CREDENTIALS'
    | 'USER_EXISTS'
    | 'VALIDATION_ERROR'
    | 'SERVER_ERROR';
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// =============================================================================
// CONSTANTES
// =============================================================================

/**
 * Duree de vie d'une session (24 heures en secondes)
 */
export const SESSION_TTL_SECONDS = 24 * 60 * 60;

/**
 * Nom du cookie de session
 */
export const SESSION_COOKIE_NAME = 'tm_session';
