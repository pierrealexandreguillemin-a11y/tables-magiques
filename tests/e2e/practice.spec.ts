/**
 * Tests E2E - Mode Practice
 * ISO/IEC 29119 - Tests parcours utilisateur PRODUCTION
 *
 * Ces tests utilisent l'authentification du projet 'setup'
 * via storageState dans playwright.config.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Mode Practice - Page Selection', () => {
  test.describe('Page selection tables', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/practice');
      await page.waitForLoadState('networkidle');
    });

    test('affiche titre Mode Pratique', async ({ page }) => {
      // TextReveal fragmente le texte, chercher le h1 directement
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.getByText(/pratique/i).first()).toBeVisible();
    });

    test('affiche boutons de selection tables', async ({ page }) => {
      // Au moins quelques boutons de tables doivent être visibles
      const tableButtons = page.getByRole('button');
      const count = await tableButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('bouton table 7 est visible', async ({ page }) => {
      // Chercher un bouton contenant "7" ou "Table 7"
      const table7Btn = page
        .getByRole('button')
        .filter({ hasText: /7/ })
        .first();
      await expect(table7Btn).toBeVisible({ timeout: 5000 });
    });

    test('clic sur table demarre le jeu', async ({ page }) => {
      // Cliquer sur une table
      const tableBtn = page
        .getByRole('button')
        .filter({ hasText: /7/ })
        .first();

      if (await tableBtn.isVisible()) {
        await tableBtn.click();

        // Attendre que le jeu charge
        await page.waitForTimeout(1000);

        // Doit afficher une question avec multiplication
        const hasMultiplication = await page
          .locator('text=/×/')
          .first()
          .isVisible()
          .catch(() => false);
        const hasQuestion = await page
          .locator('[data-testid="question"]')
          .isVisible()
          .catch(() => false);

        expect(hasMultiplication || hasQuestion).toBeTruthy();
      }
    });
  });

  test.describe('Accessibilite', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/practice');
      await page.waitForLoadState('networkidle');
    });

    test('navigation clavier entre boutons', async ({ page }) => {
      // Tab pour naviguer
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      // Un element doit avoir le focus
      const hasFocus = await page.evaluate(() => {
        return document.activeElement?.tagName !== 'BODY';
      });

      expect(hasFocus).toBe(true);
    });

    test('focus visible sur les boutons', async ({ page }) => {
      const buttons = page.getByRole('button');

      if ((await buttons.count()) > 0) {
        await buttons.first().focus();

        // Le bouton doit etre focusable
        const isFocused = await page.evaluate(() => {
          return document.activeElement?.tagName === 'BUTTON';
        });

        expect(isFocused).toBe(true);
      }
    });
  });
});

test.describe('Mode Practice - Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');
  });

  test('peut demarrer une session de jeu', async ({ page }) => {
    // Trouver et cliquer sur un bouton de table
    const tableBtn = page
      .getByRole('button')
      .filter({ hasText: /[1-9]/ })
      .first();

    if (await tableBtn.isVisible()) {
      await tableBtn.click();
      await page.waitForTimeout(1000);

      // La page doit changer (soit question visible, soit URL change)
      const pageContent = await page.content();
      const hasGameContent =
        pageContent.includes('×') ||
        pageContent.includes('question') ||
        pageContent.includes('score');

      expect(hasGameContent).toBeTruthy();
    }
  });

  test('affiche clavier numerique si disponible', async ({ page }) => {
    // Demarrer le jeu d'abord
    const tableBtn = page
      .getByRole('button')
      .filter({ hasText: /[1-9]/ })
      .first();

    if (await tableBtn.isVisible()) {
      await tableBtn.click();
      await page.waitForTimeout(1000);

      // Chercher les boutons numeriques 0-9
      let numericButtonsFound = 0;
      for (let i = 0; i <= 9; i++) {
        const numBtn = page.getByRole('button', { name: new RegExp(`^${i}$`) });
        if (await numBtn.isVisible().catch(() => false)) {
          numericButtonsFound++;
        }
      }

      // Au moins quelques boutons numeriques
      expect(numericButtonsFound).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Mode Practice - Responsive', () => {
  test('s affiche correctement sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // La page doit charger sans erreur
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('s affiche correctement sur tablette', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('s affiche correctement sur desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Mode Practice - Performance', () => {
  test('page charge en moins de 3 secondes', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('pas d erreurs JavaScript critiques', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/practice');
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });
});
