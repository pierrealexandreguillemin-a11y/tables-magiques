/**
 * Gestion des utilisateurs - Tables Magiques
 * ISO/IEC 25010 - CRUD utilisateurs Redis
 */

import { v4 as uuidv4 } from 'uuid';
import { getRedis, KEYS } from '@/lib/db/upstash';
import { hashPassword, verifyPassword } from './password';
import type {
  StoredUser,
  SafeUser,
  RegisterInput,
  LoginInput,
} from '@/types/auth';

/**
 * Cree un nouvel utilisateur
 * @param input - Donnees d'inscription validees
 * @returns Utilisateur cree (sans mot de passe)
 * @throws Error si le username existe deja
 */
export async function createUser(input: RegisterInput): Promise<SafeUser> {
  const redis = getRedis();

  // Verifier si le username existe deja
  const existingUser = await redis.get(KEYS.user(input.username.toLowerCase()));
  if (existingUser) {
    throw new Error('USER_EXISTS');
  }

  const userId = uuidv4();
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(input.password);

  const user: StoredUser = {
    id: userId,
    username: input.username.toLowerCase(),
    passwordHash,
    createdAt: now,
    lastLoginAt: null,
  };

  // Stocker l'utilisateur (2 cles pour lookup par username et par id)
  await Promise.all([
    redis.set(KEYS.user(user.username), JSON.stringify(user)),
    redis.set(KEYS.userId(user.id), user.username),
  ]);

  return toSafeUser(user);
}

/**
 * Authentifie un utilisateur
 * @param input - Donnees de connexion validees
 * @returns Utilisateur si authentifie, null sinon
 */
export async function authenticateUser(
  input: LoginInput
): Promise<SafeUser | null> {
  const redis = getRedis();

  // Recuperer l'utilisateur par username
  const data = await redis.get<string>(KEYS.user(input.username.toLowerCase()));

  if (!data) {
    return null;
  }

  const user: StoredUser = typeof data === 'string' ? JSON.parse(data) : data;

  // Verifier le mot de passe
  const isValid = await verifyPassword(input.password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  // Mettre a jour lastLoginAt
  const now = new Date().toISOString();
  const updatedUser: StoredUser = {
    ...user,
    lastLoginAt: now,
  };

  await redis.set(KEYS.user(user.username), JSON.stringify(updatedUser));

  return toSafeUser(updatedUser);
}

/**
 * Recupere un utilisateur par son ID
 * @param userId - ID de l'utilisateur
 * @returns Utilisateur si trouve, null sinon
 */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  const redis = getRedis();

  // Recuperer le username par ID
  const username = await redis.get<string>(KEYS.userId(userId));

  if (!username) {
    return null;
  }

  // Recuperer l'utilisateur par username
  const data = await redis.get<string>(KEYS.user(username));

  if (!data) {
    return null;
  }

  const user: StoredUser = typeof data === 'string' ? JSON.parse(data) : data;
  return toSafeUser(user);
}

/**
 * Recupere un utilisateur par son username
 * @param username - Username de l'utilisateur
 * @returns Utilisateur si trouve, null sinon
 */
export async function getUserByUsername(
  username: string
): Promise<SafeUser | null> {
  const redis = getRedis();

  const data = await redis.get<string>(KEYS.user(username.toLowerCase()));

  if (!data) {
    return null;
  }

  const user: StoredUser = typeof data === 'string' ? JSON.parse(data) : data;
  return toSafeUser(user);
}

/**
 * Verifie si un username est disponible
 * @param username - Username a verifier
 * @returns true si disponible
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const redis = getRedis();
  const exists = await redis.exists(KEYS.user(username.toLowerCase()));
  return exists === 0;
}

/**
 * Convertit un StoredUser en SafeUser (sans mot de passe)
 */
function toSafeUser(user: StoredUser): SafeUser {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}
