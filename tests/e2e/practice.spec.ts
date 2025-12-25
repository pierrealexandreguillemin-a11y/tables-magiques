/**
 * Tests E2E - Mode Practice
 * ISO/IEC 29119 - Tests parcours utilisateur
 */

import { test, expect } from '@playwright/test';

test.describe('Mode Practice - Page Selection', () => {
  // Note: Ces tests necessitent une session authentifiee
  // En CI, mocker la session ou skip si backend non disponible

  test.describe('Acces protege', () => {
    test('redirige vers / si non authentifie', async ({ page }) => {
      await page.goto('/practice');

      // Doit rediriger vers la page d'accueil
      await expect(page).toHaveURL(/\//);
    });

    test('conserve redirect param dans URL', async ({ page }) => {
      await page.goto('/practice');

      // L'URL doit contenir le parametre redirect
      await expect(page).toHaveURL(/redirect=.*practice/);
    });
  });

  test.describe('Page selection (avec auth mockee)', () => {
    test.beforeEach(async ({ context }) => {
      // Mock session cookie pour tests
      await context.addCookies([
        {
          name: 'tm_session',
          value: 'test-session-token',
          domain: 'localhost',
          path: '/',
        },
      ]);
    });

    test.skip('affiche titre Mode Pratique', async ({ page }) => {
      await page.goto('/practice');

      await expect(
        page.getByRole('heading', { name: /pratique/i })
      ).toBeVisible();
    });

    test.skip('affiche 11 boutons de selection (1-10 + Toutes)', async ({
      page,
    }) => {
      await page.goto('/practice');

      // 10 tables + 1 "Toutes les tables"
      const tableButtons = page.getByRole('button', { name: /table/i });
      await expect(tableButtons).toHaveCount(11);
    });

    test.skip('boutons tables ont les bons labels', async ({ page }) => {
      await page.goto('/practice');

      // Tables 1-10
      for (let i = 1; i <= 10; i++) {
        await expect(
          page.getByRole('button', { name: new RegExp(`table.*${i}`, 'i') })
        ).toBeVisible();
      }

      // Toutes les tables
      await expect(page.getByRole('button', { name: /toutes/i })).toBeVisible();
    });

    test.skip('clic sur table demarre le jeu', async ({ page }) => {
      await page.goto('/practice');

      // Clic sur table 7
      await page.getByRole('button', { name: /table.*7/i }).click();

      // Doit afficher une question
      await expect(page.getByText(/×/)).toBeVisible();
    });

    test.skip('bouton retour visible pendant le jeu', async ({ page }) => {
      await page.goto('/practice');

      await page.getByRole('button', { name: /table.*5/i }).click();

      await expect(
        page.getByRole('button', { name: /retour|back/i })
      ).toBeVisible();
    });
  });

  test.describe('Accessibilite', () => {
    test.beforeEach(async ({ context }) => {
      await context.addCookies([
        {
          name: 'tm_session',
          value: 'test-session-token',
          domain: 'localhost',
          path: '/',
        },
      ]);
    });

    test.skip('navigation clavier entre boutons', async ({ page }) => {
      await page.goto('/practice');

      // Tab pour naviguer entre les boutons
      await page.keyboard.press('Tab');

      // Le premier bouton doit etre focus
      const firstButton = page.getByRole('button').first();
      await expect(firstButton).toBeFocused();
    });

    test.skip('Enter active le bouton focus', async ({ page }) => {
      await page.goto('/practice');

      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Doit demarrer le jeu
      await expect(page.getByText(/×/)).toBeVisible();
    });
  });
});

test.describe('Mode Practice - Gameplay', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: 'tm_session',
        value: 'test-session-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test.skip('affiche question multiplication', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /table.*7/i }).click();

    // Question format: "7 × N = ?"
    await expect(page.getByText(/7\s*×\s*\d+\s*=/)).toBeVisible();
  });

  test.skip('affiche clavier numerique', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /table.*3/i }).click();

    // Clavier 0-9
    for (let i = 0; i <= 9; i++) {
      await expect(
        page.getByRole('button', { name: new RegExp(`^${i}$`) })
      ).toBeVisible();
    }
  });

  test.skip('saisie reponse avec clavier numerique', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /table.*2/i }).click();

    // Saisir "10"
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '0' }).click();

    // Affiche la reponse saisie
    await expect(page.getByText('10')).toBeVisible();
  });

  test.skip('bouton effacer fonctionne', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /table.*4/i }).click();

    // Saisir "12"
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();

    // Effacer
    await page.getByRole('button', { name: /effacer|clear|⌫/i }).click();

    // Doit afficher "1"
    await expect(page.getByText(/^1$/)).toBeVisible();
  });

  test.skip('feedback visuel bonne reponse', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /table.*1/i }).click();

    // Table 1 x 5 = 5
    // Attendre la question et repondre
    await page.getByRole('button', { name: '5' }).click();
    await page.getByRole('button', { name: /valider|check|ok/i }).click();

    // Feedback positif
    await expect(page.locator('[data-testid="feedback-correct"]')).toBeVisible({
      timeout: 2000,
    });
  });

  test.skip('score incremente apres bonne reponse', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /table.*1/i }).click();

    // Score initial = 0
    await expect(page.getByText(/score.*0/i)).toBeVisible();

    // Repondre correctement (hypothese: 1 x 1 = 1)
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: /valider/i }).click();

    // Score = 1
    await expect(page.getByText(/score.*1/i)).toBeVisible();
  });
});
