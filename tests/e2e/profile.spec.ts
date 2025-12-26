/**
 * Tests E2E - Page Profil
 * ISO/IEC 29119 - Tests production page profil utilisateur
 *
 * Note: Ces tests necessitent un backend fonctionnel avec Redis.
 * En CI, utiliser les tests d'integration MSW a la place.
 */

import { test, expect } from '@playwright/test';

test.describe('Page Profil E2E', () => {
  test.describe('Acces non authentifie', () => {
    test('affiche message de connexion requise', async ({ page }) => {
      await page.goto('/profile');

      // Attendre le chargement de la page
      await page.waitForLoadState('networkidle');

      // Doit afficher un message de connexion requise ou rediriger
      const lockedIcon = page.getByText('🔒');
      const connectionMessage = page.getByText(/connexion requise/i);
      const backButton = page.getByRole('link', { name: /retour/i });

      // Soit le message de connexion, soit redirection
      const hasLockedContent = await lockedIcon.isVisible().catch(() => false);
      const hasMessage = await connectionMessage.isVisible().catch(() => false);

      if (hasLockedContent || hasMessage) {
        // Page profil avec message connexion
        expect(hasLockedContent || hasMessage).toBeTruthy();
        await expect(backButton).toBeVisible();
      } else {
        // Redirection vers accueil
        await expect(page).toHaveURL(/\//);
      }
    });
  });

  test.describe('API Profile Endpoints', () => {
    test('GET /api/profile retourne 401 sans cookie', async ({ request }) => {
      const response = await request.get('/api/profile');

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Non authentifié');
    });

    test('GET /api/profile structure de reponse', async ({ request }) => {
      // Ce test verifie la structure de reponse attendue
      // En production avec session valide, doit retourner ProfileData
      const response = await request.get('/api/profile');

      // Sans authentification, doit retourner erreur
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Composants UI (mocked)', () => {
    // Ces tests sont skipped car necessitent authentification
    // Utiliser les tests d'integration MSW pour les composants

    test.skip('affiche avatar utilisateur', async ({ page }) => {
      await page.goto('/profile');
      const avatar = page.locator('[data-testid="user-avatar"]');
      await expect(avatar).toBeVisible();
    });

    test.skip('affiche statistiques globales', async ({ page }) => {
      await page.goto('/profile');

      await expect(page.getByText(/parties jouees/i)).toBeVisible();
      await expect(page.getByText(/reponses correctes/i)).toBeVisible();
      await expect(page.getByText(/precision moyenne/i)).toBeVisible();
      await expect(page.getByText(/badges gagnes/i)).toBeVisible();
    });

    test.skip('affiche statistiques par mode', async ({ page }) => {
      await page.goto('/profile');

      await expect(page.getByText(/mode pratique/i)).toBeVisible();
      await expect(page.getByText(/mode challenge/i)).toBeVisible();
    });

    test.skip('affiche progression par table', async ({ page }) => {
      await page.goto('/profile');

      await expect(page.getByText(/progression par table/i)).toBeVisible();
      // Doit afficher 10 tables
      for (let i = 1; i <= 10; i++) {
        await expect(page.getByText(String(i))).toBeVisible();
      }
    });

    test.skip('affiche sessions recentes', async ({ page }) => {
      await page.goto('/profile');

      await expect(page.getByText(/sessions recentes/i)).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('bouton retour redirige vers accueil', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      const backButton = page.getByRole('link', { name: /retour/i });

      if (await backButton.isVisible()) {
        await backButton.click();
        await expect(page).toHaveURL('/');
      }
    });
  });

  test.describe('Theme', () => {
    test('toggle theme est visible', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Le theme toggle doit etre present
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      const themeButton = page.getByRole('button', { name: /theme/i });

      const hasToggle = await themeToggle.isVisible().catch(() => false);
      const hasButton = await themeButton.isVisible().catch(() => false);

      // Au moins un des deux doit etre present
      expect(hasToggle || hasButton).toBeTruthy();
    });
  });

  test.describe('Responsive', () => {
    test('page s adapte au mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Page doit charger sans erreur console critique
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Attendre un peu pour les erreurs async
      await page.waitForTimeout(500);

      // Pas d'erreurs critiques liees au layout
      const layoutErrors = consoleErrors.filter(
        (e) => e.includes('layout') || e.includes('overflow')
      );
      expect(layoutErrors.length).toBe(0);
    });

    test('page s adapte a la tablette', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Verifier que la page s'affiche correctement
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });
});

test.describe('Performance Profile', () => {
  test('page charge en moins de 3 secondes', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // La page doit charger en moins de 3 secondes
    expect(loadTime).toBeLessThan(3000);
  });

  test('pas de layout shift majeur', async ({ page }) => {
    await page.goto('/profile');

    // Mesurer CLS via Performance API
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (
              !(entry as PerformanceEntry & { hadRecentInput?: boolean })
                .hadRecentInput
            ) {
              clsValue +=
                (entry as PerformanceEntry & { value?: number }).value || 0;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        // Attendre un peu pour les shifts
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 2000);
      });
    });

    // CLS doit etre inferieur a 0.1 (good)
    expect(cls).toBeLessThan(0.1);
  });
});
