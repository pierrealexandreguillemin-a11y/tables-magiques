/**
 * useAuth - Hook d'authentification
 * ISO/IEC 25010 - Gestion etat utilisateur
 *
 * Gere l'etat d'authentification, le login, logout et register.
 * Synchronise avec les cookies HttpOnly via API calls.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SafeUser, LoginInput, RegisterInput } from '@/types/auth';

/**
 * Resultat du hook useAuth
 */
export interface AuthResult {
  /** Utilisateur connecte ou null */
  user: SafeUser | null;
  /** true si en cours de chargement */
  isLoading: boolean;
  /** true si authentifie */
  isAuthenticated: boolean;
  /** Erreur eventuelle */
  error: string | null;
  /** Fonction de connexion */
  login: (credentials: LoginInput) => Promise<boolean>;
  /** Fonction d'inscription */
  register: (data: RegisterInput) => Promise<boolean>;
  /** Fonction de deconnexion */
  logout: () => Promise<void>;
  /** Fonction pour rafraichir l'etat */
  refresh: () => Promise<void>;
}

/**
 * Hook pour gerer l'authentification
 *
 * @returns Object avec user, fonctions auth et etat
 *
 * @example
 * ```tsx
 * function ProfileButton() {
 *   const { user, isAuthenticated, logout, isLoading } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   if (!isAuthenticated) {
 *     return <LoginButton />;
 *   }
 *
 *   return (
 *     <div>
 *       <span>Bonjour {user.username}!</span>
 *       <button onClick={logout}>Deconnexion</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthResult {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Recupere l'utilisateur courant depuis /api/auth/me
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Connexion utilisateur
   */
  const login = useCallback(
    async (credentials: LoginInput): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          return true;
        } else {
          setError(data.error || 'Erreur de connexion');
          return false;
        }
      } catch {
        setError('Erreur de connexion au serveur');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Inscription utilisateur
   */
  const register = useCallback(
    async (data: RegisterInput): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          setUser(result.user);
          return true;
        } else {
          setError(result.error || "Erreur lors de l'inscription");
          return false;
        }
      } catch {
        setError('Erreur de connexion au serveur');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Deconnexion
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
    } catch {
      setError('Erreur lors de la deconnexion');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger l'utilisateur au montage
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    error,
    login,
    register,
    logout,
    refresh,
  };
}

/**
 * Export default pour import plus simple
 */
export default useAuth;
