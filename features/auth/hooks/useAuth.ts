/**
 * useAuth - Hook React Query pour authentification
 * ISO/IEC 25010 - Gestion etat utilisateur avec cache
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
} from '../api/auth';
import type { LoginInput, RegisterInput } from '@/types/auth';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

/**
 * Hook pour gerer l'authentification
 */
export function useAuth() {
  const queryClient = useQueryClient();

  // Query: utilisateur courant
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: authKeys.user(),
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Mutation: login
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (result) => {
      if (result.success && result.user) {
        // Mettre a jour le cache directement
        queryClient.setQueryData(authKeys.user(), {
          authenticated: true,
          user: result.user,
        });
      }
    },
  });

  // Mutation: register
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (result) => {
      if (result.success && result.user) {
        queryClient.setQueryData(authKeys.user(), {
          authenticated: true,
          user: result.user,
        });
      }
    },
  });

  // Mutation: logout
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Vider le cache utilisateur
      queryClient.setQueryData(authKeys.user(), {
        authenticated: false,
        user: undefined,
      });
      // Invalider tous les badges aussi
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });

  // Derive user from data
  const user = data?.authenticated ? data.user : null;

  return {
    // Data
    user: user ?? null,
    isAuthenticated: !!user,

    // State
    isLoading,
    error:
      error?.message ??
      loginMutation.error?.message ??
      registerMutation.error?.message ??
      null,

    // Actions
    login: async (credentials: LoginInput): Promise<boolean> => {
      const result = await loginMutation.mutateAsync(credentials);
      return result.success;
    },
    register: async (data: RegisterInput): Promise<boolean> => {
      const result = await registerMutation.mutateAsync(data);
      return result.success;
    },
    logout: async (): Promise<void> => {
      await logoutMutation.mutateAsync();
    },
    refresh: refetch,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Errors from mutations
    loginError: loginMutation.data?.error ?? null,
    registerError: registerMutation.data?.error ?? null,
  };
}

export default useAuth;
