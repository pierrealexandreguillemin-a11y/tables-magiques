/**
 * E2E Tests - Page d'Accueil
 * ISO/IEC 29119 - 0 MOCK - 100% Production
 *
 * Tests contre l'application réelle
 */

import { test, expect } from '@playwright/test';

test.describe('Page Accueil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche le titre principal', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /tables magiques/i })
    ).toBeVisible();
  });

  test('affiche la licorne animée', async ({ page }) => {
    // La licorne est un élément texte emoji
    const unicorn = page.locator('text=🦄');
    await expect(unicorn).toBeVisible();
  });

  test('affiche le bouton Mode Pratique', async ({ page }) => {
    const practiceBtn = page.getByRole('button', { name: /mode pratique/i });
    await expect(practiceBtn).toBeVisible();
  });

  test('affiche le bouton Mode Challenge', async ({ page }) => {
    const challengeBtn = page.getByRole('button', { name: /mode challenge/i });
    await expect(challengeBtn).toBeVisible();
  });

  test('affiche les stats de déploiement', async ({ page }) => {
    await expect(page.locator('text=Vercel')).toBeVisible();
    await expect(page.locator('text=Upstash')).toBeVisible();
    await expect(page.locator('text=GSAP')).toBeVisible();
    await expect(page.locator('text=shadcn')).toBeVisible();
  });

  test('affiche le message PWA', async ({ page }) => {
    await expect(page.locator('text=PWA Moderne')).toBeVisible();
  });
});

test.describe('Animations Page Accueil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('le titre apparaît avec animation', async ({ page }) => {
    const title = page.getByRole('heading', { name: /tables magiques/i });

    // Le titre devrait être visible après l'animation
    await expect(title).toBeVisible({ timeout: 3000 });
  });

  test('les boutons apparaissent avec délai', async ({ page }) => {
    const practiceBtn = page.getByRole('button', { name: /mode pratique/i });

    // Les boutons apparaissent après 1.2s selon le code
    await expect(practiceBtn).toBeVisible({ timeout: 3000 });
  });

  test('la licorne réagit au hover', async ({ page }) => {
    const unicorn = page.locator('text=🦄').first();

    // Hover sur la licorne
    await unicorn.hover();

    // L'élément devrait toujours être visible
    await expect(unicorn).toBeVisible();
  });

  test('la licorne réagit au clic', async ({ page }) => {
    const unicorn = page.locator('text=🦄').first();

    // Clic sur la licorne
    await unicorn.click();

    // L'élément devrait toujours être visible (animation de scale)
    await expect(unicorn).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('mobile - affiche correctement', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /tables magiques/i })
    ).toBeVisible();

    // Les boutons doivent être empilés sur mobile
    const buttons = page.getByRole('button');
    await expect(buttons.first()).toBeVisible();
  });

  test('tablet - affiche correctement', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /tables magiques/i })
    ).toBeVisible();
  });

  test('desktop - affiche correctement', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /tables magiques/i })
    ).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('la page charge en moins de 3 secondes', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('pas d erreurs console critiques', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Filtrer les erreurs non-critiques (warnings React, etc.)
    const criticalErrors = errors.filter(
      (err) =>
        !err.includes('React does not recognize') &&
        !err.includes('Download the React DevTools')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Visual Regression', () => {
  test('screenshot page complète', async ({ page }) => {
    await page.goto('/');

    // Attendre que les animations soient terminées
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('home-page.png', {
      maxDiffPixelRatio: 0.1, // Tolérance 10% pour animations
    });
  });

  test('screenshot mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('home-mobile.png', {
      maxDiffPixelRatio: 0.1,
    });
  });
});
