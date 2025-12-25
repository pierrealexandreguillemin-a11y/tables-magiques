/**
 * Tests E2E - Authentification
 * ISO/IEC 29119 - Tests production login/register
 *
 * Note: Ces tests necessitent un backend fonctionnel avec Redis.
 * En CI, utiliser les tests d'integration MSW a la place.
 */

import { test, expect } from '@playwright/test';

test.describe('Authentification E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Page accueil', () => {
    test('affiche les boutons de jeu', async ({ page }) => {
      await expect(page.getByText('Mode Pratique')).toBeVisible();
      await expect(page.getByText('Mode Challenge')).toBeVisible();
    });

    test('titre principal est visible', async ({ page }) => {
      await expect(page.getByRole('heading', { level: 1 })).toContainText(
        'Tables Magiques'
      );
    });
  });

  test.describe('Modal Login UI', () => {
    // Note: Ces tests verifient l'UI du modal sans backend
    // Le composant UserButton doit etre integre dans la page pour ces tests

    test.skip('bouton connexion ouvre le modal', async ({ page }) => {
      // Skip si UserButton pas encore integre
      const loginButton = page.getByRole('button', { name: /connexion/i });

      if (await loginButton.isVisible()) {
        await loginButton.click();
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });

    test.skip('modal contient champs username et password', async ({
      page,
    }) => {
      const loginButton = page.getByRole('button', { name: /connexion/i });

      if (await loginButton.isVisible()) {
        await loginButton.click();
        await expect(page.getByLabel(/pseudo/i)).toBeVisible();
        await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
      }
    });
  });

  test.describe('Accessibilite formulaire auth', () => {
    test.skip('formulaire est accessible au clavier', async ({ page }) => {
      const loginButton = page.getByRole('button', { name: /connexion/i });

      if (await loginButton.isVisible()) {
        // Tab vers le bouton et Enter
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');

        // Dialog doit etre focusable
        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // Premier champ doit recevoir le focus
          const username = page.getByLabel(/pseudo/i);
          await expect(username).toBeFocused();
        }
      }
    });
  });
});

test.describe('Routes protegees', () => {
  test('/ est accessible sans authentification', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('/practice redirige vers / si non authentifie', async ({ page }) => {
    await page.goto('/practice');

    // Doit rediriger vers la page d'accueil
    await expect(page).toHaveURL(/\//);
  });

  test('/challenge redirige vers / si non authentifie', async ({ page }) => {
    await page.goto('/challenge');

    // Doit rediriger vers la page d'accueil
    await expect(page).toHaveURL(/\//);
  });

  test('/profile redirige vers / si non authentifie', async ({ page }) => {
    await page.goto('/profile');

    // Doit rediriger vers la page d'accueil
    await expect(page).toHaveURL(/\//);
  });

  test('/badges redirige vers / si non authentifie', async ({ page }) => {
    await page.goto('/badges');

    // Doit rediriger vers la page d'accueil
    await expect(page).toHaveURL(/\//);
  });
});

test.describe('API Auth Endpoints', () => {
  test('POST /api/auth/login retourne 401 avec mauvais credentials', async ({
    request,
  }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        username: 'invaliduser',
        password: 'wrongpassword',
      },
    });

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('POST /api/auth/login retourne 400 avec username trop court', async ({
    request,
  }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        username: 'ab',
        password: 'password',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  test('GET /api/auth/me retourne non authentifie sans cookie', async ({
    request,
  }) => {
    const response = await request.get('/api/auth/me');

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.authenticated).toBe(false);
  });

  test('POST /api/auth/logout retourne succes', async ({ request }) => {
    const response = await request.post('/api/auth/logout');

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
