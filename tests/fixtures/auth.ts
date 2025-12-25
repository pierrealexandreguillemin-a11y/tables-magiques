/**
 * Fixtures Auth - Donnees reelles pour tests
 * ISO/IEC 29119 - 0 mock, 100% production
 */

import type { SafeUser, Session, StoredUser } from '@/types/auth';

// =============================================================================
// UTILISATEURS
// =============================================================================

/**
 * Utilisateur test (Emma, 9 ans, joueuse reguliere)
 */
export const EMMA_USER_FIXTURE: SafeUser = {
  id: 'user-456',
  username: 'emma',
  createdAt: '2024-12-10T14:30:00.000Z',
  lastLoginAt: '2024-12-26T08:00:00.000Z',
};

/**
 * Utilisateur stocke avec password hash (pour tests unitaires)
 * Password: magique123 (hash bcrypt valide genere avec 10 rounds)
 */
export const EMMA_STORED_FIXTURE: StoredUser = {
  id: 'user-456',
  username: 'emma',
  // Hash bcrypt REEL de "magique123" avec 10 rounds
  passwordHash: '$2b$10$fmRaMOyS5DeBZefPQISK3uhWGzWfrP70qu7urxnUzAvywlSeH5xdW',
  createdAt: '2024-12-10T14:30:00.000Z',
  lastLoginAt: '2024-12-26T08:00:00.000Z',
};

/**
 * Nouvel utilisateur (Lucas, nouveau joueur)
 */
export const LUCAS_USER_FIXTURE: SafeUser = {
  id: 'user-789',
  username: 'lucas',
  createdAt: '2024-12-26T10:00:00.000Z',
  lastLoginAt: null,
};

// =============================================================================
// SESSIONS
// =============================================================================

/**
 * Session auth active valide
 */
export const AUTH_SESSION_FIXTURE: Session = {
  token: 'session-token-abc123',
  userId: 'user-456',
  username: 'emma',
  createdAt: '2024-12-26T08:00:00.000Z',
  expiresAt: '2024-12-27T08:00:00.000Z', // +24h
};

/**
 * Session auth expiree
 */
export const AUTH_EXPIRED_SESSION_FIXTURE: Session = {
  token: 'session-token-expired',
  userId: 'user-456',
  username: 'emma',
  createdAt: '2024-12-24T08:00:00.000Z',
  expiresAt: '2024-12-25T08:00:00.000Z', // Expiree
};

// =============================================================================
// INPUTS VALIDES
// =============================================================================

/**
 * Donnees login valides
 */
export const VALID_LOGIN_INPUT = {
  username: 'emma',
  password: 'magique123',
};

/**
 * Donnees register valides
 */
export const VALID_REGISTER_INPUT = {
  username: 'lucas',
  password: 'secret456',
  confirmPassword: 'secret456',
};

// =============================================================================
// INPUTS INVALIDES (pour tests erreurs)
// =============================================================================

/**
 * Login avec password incorrect
 */
export const INVALID_PASSWORD_INPUT = {
  username: 'emma',
  password: 'wrong',
};

/**
 * Login avec username trop court
 */
export const SHORT_USERNAME_INPUT = {
  username: 'ab',
  password: 'test1234',
};

/**
 * Register avec passwords differents
 */
export const MISMATCHED_PASSWORDS_INPUT = {
  username: 'newuser',
  password: 'password1',
  confirmPassword: 'password2',
};

// =============================================================================
// RESPONSES API
// =============================================================================

/**
 * Response login succes
 */
export const LOGIN_SUCCESS_RESPONSE = {
  success: true,
  user: EMMA_USER_FIXTURE,
  token: 'session-token-new123',
};

/**
 * Response login echec
 */
export const LOGIN_ERROR_RESPONSE = {
  success: false,
  error: 'Identifiants incorrects',
  code: 'INVALID_CREDENTIALS',
};

/**
 * Response register succes
 */
export const REGISTER_SUCCESS_RESPONSE = {
  success: true,
  user: LUCAS_USER_FIXTURE,
  token: 'session-token-lucas123',
};

/**
 * Response register echec (user existe)
 */
export const REGISTER_USER_EXISTS_RESPONSE = {
  success: false,
  error: 'Ce pseudo est deja pris',
  code: 'USER_EXISTS',
};
