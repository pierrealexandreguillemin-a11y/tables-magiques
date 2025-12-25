/**
 * Utilitaires de gestion des mots de passe - Tables Magiques
 * ISO/IEC 25010 - Securite (bcrypt)
 */

import bcrypt from 'bcryptjs';

/**
 * Nombre de rounds pour le hachage bcrypt
 * 10 est un bon compromis securite/performance
 */
const SALT_ROUNDS = 10;

/**
 * Hache un mot de passe avec bcrypt
 * @param plainPassword - Mot de passe en clair
 * @returns Hash bcrypt du mot de passe
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Verifie si un mot de passe correspond a un hash
 * @param plainPassword - Mot de passe en clair a verifier
 * @param hash - Hash bcrypt stocke en base
 * @returns true si le mot de passe correspond
 */
export async function verifyPassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}
