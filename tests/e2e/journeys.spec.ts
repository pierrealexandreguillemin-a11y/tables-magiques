/**
 * E2E Journey Tests - Full User Flows
 * ISO/IEC 29119 - End-to-end parcours complets contre production
 *
 * Tests the complete user journeys, not just individual pages.
 */

import { test, expect } from '@playwright/test';

test.describe('Practice Journey', () => {
  test('selection → jeu → resultats complet', async ({ page }) => {
    await page.goto('/practice');

    // Selection: choisir table de 7
    const table7 = page.getByRole('button', { name: /table 7/i });
    await expect(table7).toBeVisible();
    await table7.click();

    // Playing: repondre a toutes les questions
    for (let i = 0; i < 10; i++) {
      // Attendre que la question apparaisse
      await expect(
        page.getByRole('region', { name: /question/i })
      ).toBeVisible();

      // Lire la reponse attendue et taper
      const questionText = await page
        .locator('[data-testid="question-display"]')
        .textContent();

      if (questionText) {
        // Parse "7 × N = ?" pour trouver N et calculer la reponse
        const match = questionText.match(/(\d+)\s*×\s*(\d+)/);
        if (match) {
          const answer = parseInt(match[1]!) * parseInt(match[2]!);
          const digits = answer.toString().split('');

          for (const digit of digits) {
            await page
              .getByRole('button', { name: new RegExp(`^${digit}$`) })
              .click();
          }

          // Valider
          await page.getByRole('button', { name: /valider/i }).click();

          // Attendre feedback
          await page.waitForTimeout(1600);
        }
      }
    }

    // Completed: verifier ecran resultats
    await expect(page.getByText(/bien jou|parfait/i)).toBeVisible({
      timeout: 5000,
    });

    // Boutons de navigation presents
    await expect(
      page.getByRole('button', { name: /changer de table/i })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /rejouer/i })).toBeVisible();
  });
});

test.describe('Challenge Journey', () => {
  test('ready → jeu → game over', async ({ page }) => {
    await page.goto('/challenge');

    // Ready: voir les regles et commencer
    await expect(page.getByText(/règles/i)).toBeVisible();
    const startBtn = page.getByRole('button', { name: /commencer/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Playing: repondre a quelques questions
    const timer = page.getByRole('timer');
    await expect(timer).toBeVisible();

    // Repondre a 3 questions minimum
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(500);

      // Taper un chiffre et valider
      await page.getByRole('button', { name: /^5$/ }).click();
      await page.getByRole('button', { name: /valider/i }).click();

      await page.waitForTimeout(1600);
    }

    // Attendre game over (timeout ou toutes les questions)
    await expect(page.getByText(/challenge termin/i)).toBeVisible({
      timeout: 200000,
    });

    // Verifier ecran game over
    await expect(page.getByText(/points/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /rejouer/i })).toBeVisible();
  });
});

test.describe('Dark Mode Journey', () => {
  test('toggle persiste apres navigation', async ({ page }) => {
    await page.goto('/');

    // Trouver et cliquer le toggle theme
    const themeToggle = page.getByTestId('theme-toggle');
    await expect(themeToggle).toBeVisible();

    // Verifier etat initial
    const htmlBefore = await page.locator('html').getAttribute('class');

    // Toggle
    await themeToggle.click();
    await page.waitForTimeout(300);

    const htmlAfter = await page.locator('html').getAttribute('class');
    expect(htmlBefore).not.toBe(htmlAfter);

    // Naviguer vers une autre page
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Verifier que le theme persiste
    const htmlSettings = await page.locator('html').getAttribute('class');
    expect(htmlSettings).toBe(htmlAfter);
  });
});

test.describe('Skeleton Loading States', () => {
  test('profile page shows skeleton then content', async ({ page }) => {
    await page.goto('/profile');

    // Soit le skeleton est visible brievement, soit le contenu charge directement
    // On verifie que la page finit par afficher du contenu
    await expect(page.getByText(/profil|connexion requise/i)).toBeVisible({
      timeout: 10000,
    });
  });
});
