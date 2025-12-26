/**
 * Tests Unitaires - useAuth Hook
 * ISO/IEC 29119 - TDD: Tests hook React Query auth
 */

import { describe, it, expect } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { useAuth, authKeys } from '@/features/auth/hooks/useAuth';
import { renderQueryHook, createTestQueryClient } from '../../../../utils';
import {
  VALID_LOGIN_INPUT,
  VALID_REGISTER_INPUT,
  EMMA_USER_FIXTURE,
  LUCAS_USER_FIXTURE,
} from '../../../../fixtures';

// MSW server is started globally in tests/setup.ts

describe('useAuth Hook', () => {
  describe('authKeys', () => {
    it('retourne les bonnes query keys', () => {
      expect(authKeys.all).toEqual(['auth']);
      expect(authKeys.user()).toEqual(['auth', 'user']);
    });
  });

  describe('Initial state', () => {
    it('demarre en loading', () => {
      const { result } = renderQueryHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
    });

    it('user null initialement', () => {
      const { result } = renderQueryHook(() => useAuth());

      expect(result.current.user).toBeNull();
    });

    it('isAuthenticated false initialement', () => {
      const { result } = renderQueryHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Loaded state', () => {
    it('user null sans session', async () => {
      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('met a jour le cache apres login', async () => {
      const queryClient = createTestQueryClient();
      const { result } = renderQueryHook(() => useAuth(), { queryClient });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login(VALID_LOGIN_INPUT);
      });

      // Wait for cache update
      await waitFor(() => {
        expect(result.current.user?.username).toBe(EMMA_USER_FIXTURE.username);
      });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('retourne true en cas de succes', async () => {
      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.login(VALID_LOGIN_INPUT);
      });

      expect(success).toBe(true);
    });

    it('retourne false en cas echec', async () => {
      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success = true;
      await act(async () => {
        success = await result.current.login({
          username: 'emma',
          password: 'wrong',
        });
      });

      expect(success).toBe(false);
    });

    it('isLoggingIn false apres login termine', async () => {
      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login(VALID_LOGIN_INPUT);
      });

      // After login completes, isLoggingIn should be false
      expect(result.current.isLoggingIn).toBe(false);
    });
  });

  describe('register', () => {
    it('met a jour le cache apres register', async () => {
      const queryClient = createTestQueryClient();
      const { result } = renderQueryHook(() => useAuth(), { queryClient });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.register(VALID_REGISTER_INPUT);
      });

      // Wait for cache update
      await waitFor(() => {
        expect(result.current.user?.username).toBe(LUCAS_USER_FIXTURE.username);
      });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('retourne true en cas de succes', async () => {
      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.register(VALID_REGISTER_INPUT);
      });

      expect(success).toBe(true);
    });
  });

  describe('logout', () => {
    it('vide le cache apres logout', async () => {
      const queryClient = createTestQueryClient();
      const { result } = renderQueryHook(() => useAuth(), { queryClient });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login first
      await act(async () => {
        await result.current.login(VALID_LOGIN_INPUT);
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
