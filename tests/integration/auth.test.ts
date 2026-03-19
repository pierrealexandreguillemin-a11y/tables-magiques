/**
 * Integration Tests - Auth (useAuth + /api/auth/*)
 * MSW intercepts HTTP, React Query manages cache.
 */

import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { waitFor } from '@testing-library/react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { renderQueryHook } from '../utils/query-test-utils';
import { server } from './setup';

describe('useAuth integration', () => {
  describe('fetchCurrentUser (GET /api/auth/me)', () => {
    it('returns authenticated user', async () => {
      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.username).toBe('testuser');
      expect(result.current.user?.id).toBe('user-1');
    });

    it('returns unauthenticated when session expired', async () => {
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.json({ authenticated: false });
        })
      );

      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('login (POST /api/auth/login)', () => {
    it('updates cache on successful login', async () => {
      // Start unauthenticated
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.json({ authenticated: false });
        })
      );

      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);

      // Login
      const success = await result.current.login({
        username: 'testuser',
        password: 'Password1!',
      });

      expect(success).toBe(true);

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user?.username).toBe('testuser');
    });

    it('exposes loginError on invalid credentials', async () => {
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.json({ authenticated: false });
        })
      );

      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const success = await result.current.login({
        username: 'testuser',
        password: 'wrong',
      });

      expect(success).toBe(false);

      await waitFor(() => {
        expect(result.current.loginError).toBe('Identifiants invalides');
      });
    });
  });

  describe('register (POST /api/auth/register)', () => {
    it('updates cache on successful registration', async () => {
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.json({ authenticated: false });
        })
      );

      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const success = await result.current.register({
        username: 'newuser',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      });

      expect(success).toBe(true);

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user?.username).toBe('newuser');
    });

    it('exposes registerError on duplicate username', async () => {
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.json({ authenticated: false });
        })
      );

      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const success = await result.current.register({
        username: 'existing',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      });

      expect(success).toBe(false);

      await waitFor(() => {
        expect(result.current.registerError).toBe('Nom deja pris');
      });
    });
  });

  describe('logout (POST /api/auth/logout)', () => {
    it('clears user cache on logout', async () => {
      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await result.current.logout();

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('error handling', () => {
    it('handles network error gracefully', async () => {
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.error();
        })
      );

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderQueryHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});
