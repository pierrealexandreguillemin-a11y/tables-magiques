/**
 * useAuth - Re-export pour compatibilite
 * ISO/IEC 25010 - Backwards compatibility
 *
 * @deprecated Importer depuis @/features/auth a la place
 */

'use client';

export { useAuth, authKeys } from '@/features/auth';
export { useAuth as default } from '@/features/auth';

// Re-export type pour compatibilite
export interface AuthResult {
  user: import('@/types/auth').SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: import('@/types/auth').LoginInput) => Promise<boolean>;
  register: (data: import('@/types/auth').RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<unknown>;
}
