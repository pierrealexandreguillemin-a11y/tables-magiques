/**
 * Tests Integration - Auth API
 * ISO/IEC 29119 - Tests endpoints authentification
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../mocks/server';
import {
  VALID_LOGIN_INPUT,
  VALID_REGISTER_INPUT,
  INVALID_PASSWORD_INPUT,
  SHORT_USERNAME_INPUT,
  MISMATCHED_PASSWORDS_INPUT,
  EMMA_USER_FIXTURE,
  LUCAS_USER_FIXTURE,
} from '../fixtures';

// MSW setup
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Auth API Integration', () => {
  describe('POST /api/auth/login', () => {
    it('retourne succes avec identifiants valides', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(VALID_LOGIN_INPUT),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.username).toBe('emma');
      expect(data.token).toBeDefined();
    });

    it('retourne erreur avec mauvais password', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(INVALID_PASSWORD_INPUT),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.code).toBe('INVALID_CREDENTIALS');
    });

    it('retourne erreur validation avec username trop court', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(SHORT_USERNAME_INPUT),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('retourne erreur validation avec password trop court', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'validuser',
          password: 'abc',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/register', () => {
    it('retourne succes avec donnees valides', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(VALID_REGISTER_INPUT),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user.username).toBe('lucas');
      expect(data.token).toBeDefined();
    });

    it('retourne erreur si username existe deja', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'emma', // existe deja
          password: 'newpassword',
          confirmPassword: 'newpassword',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.code).toBe('USER_EXISTS');
    });

    it('retourne erreur si passwords ne correspondent pas', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(MISMATCHED_PASSWORDS_INPUT),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('retourne erreur validation avec username trop court', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'ab',
          password: 'password',
          confirmPassword: 'password',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/auth/me', () => {
    it('retourne non authentifie sans cookie', async () => {
      const response = await fetch('/api/auth/me');

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.authenticated).toBe(false);
      expect(data.user).toBeNull();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('retourne succes', async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Deconnexion reussie');
    });
  });

  describe('Flow complet authentification', () => {
    it('login -> me -> logout flow', async () => {
      // 1. Login
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(VALID_LOGIN_INPUT),
      });

      const loginData = await loginResponse.json();
      expect(loginData.success).toBe(true);
      expect(loginData.user.id).toBe(EMMA_USER_FIXTURE.id);

      // 2. Logout
      const logoutResponse = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const logoutData = await logoutResponse.json();
      expect(logoutData.success).toBe(true);
    });

    it('register -> logout flow', async () => {
      // 1. Register
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(VALID_REGISTER_INPUT),
      });

      const registerData = await registerResponse.json();
      expect(registerData.success).toBe(true);
      expect(registerData.user.id).toBe(LUCAS_USER_FIXTURE.id);

      // 2. Logout
      const logoutResponse = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const logoutData = await logoutResponse.json();
      expect(logoutData.success).toBe(true);
    });
  });
});
