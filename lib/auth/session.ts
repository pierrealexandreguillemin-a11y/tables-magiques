/**
 * Gestion des sessions - Tables Magiques
 * ISO/IEC 25010 - Sessions Redis avec TTL
 */

import { v4 as uuidv4 } from 'uuid';
import { getRedis, KEYS } from '@/lib/db/upstash';
import type { Session, SafeUser } from '@/types/auth';

/**
 * Duree de vie d'une session (24 heures en secondes)
 */
const TTL_SECONDS = 24 * 60 * 60;

/**
 * Cree une nouvelle session pour un utilisateur
 * @param user - Utilisateur pour lequel creer la session
 * @returns Token de session genere
 */
export async function createSession(user: SafeUser): Promise<string> {
  const redis = getRedis();
  const token = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TTL_SECONDS * 1000);

  const session: Session = {
    token,
    userId: user.id,
    username: user.username,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // Stocker la session avec TTL automatique
  await redis.set(KEYS.session(token), JSON.stringify(session), {
    ex: TTL_SECONDS,
  });

  return token;
}

/**
 * Recupere une session par son token
 * @param token - Token de session
 * @returns Session si valide, null sinon
 */
export async function getSession(token: string): Promise<Session | null> {
  const redis = getRedis();
  const data = await redis.get<string>(KEYS.session(token));

  if (!data) {
    return null;
  }

  try {
    const session: Session = typeof data === 'string' ? JSON.parse(data) : data;

    // Verifier expiration (double securite avec TTL Redis)
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (now > expiresAt) {
      await deleteSession(token);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Supprime une session
 * @param token - Token de session a supprimer
 */
export async function deleteSession(token: string): Promise<void> {
  const redis = getRedis();
  await redis.del(KEYS.session(token));
}

/**
 * Rafraichit le TTL d'une session (prolonge de 24h)
 * @param token - Token de session
 * @returns true si la session a ete rafraichie
 */
export async function refreshSession(token: string): Promise<boolean> {
  const session = await getSession(token);

  if (!session) {
    return false;
  }

  const redis = getRedis();
  const now = new Date();
  const newExpiresAt = new Date(now.getTime() + TTL_SECONDS * 1000);

  const updatedSession: Session = {
    ...session,
    expiresAt: newExpiresAt.toISOString(),
  };

  await redis.set(KEYS.session(token), JSON.stringify(updatedSession), {
    ex: TTL_SECONDS,
  });

  return true;
}
