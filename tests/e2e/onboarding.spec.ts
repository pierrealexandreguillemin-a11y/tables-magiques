/**
 * Tests E2E Onboarding
 * ISO 29119 - Tests contre production Vercel
 */

import { test, expect } from '@playwright/test';

test.describe('Onboarding Tour', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('First Visit', () => {
    test('shows tour on first visit after delay', async ({ page }) => {
      await page.goto('/');

      // Tour should appear after 500ms delay
      await page.waitForTimeout(800);

      // Check if tour overlay is visible
      const tourOverlay = page.locator('[role="dialog"]');
      await expect(tourOverlay).toBeVisible({ timeout: 2000 });
    });

    test('does not show tour if already completed', async ({ page }) => {
      // Set tour as completed
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('tables-magiques-tour-completed', 'true');
        localStorage.setItem('tables-magiques-first-visit', 'true');
      });

      await page.goto('/');
      await page.waitForTimeout(800);

      // Tour should not appear
      const tourOverlay = page.locator('[role="dialog"]');
      await expect(tourOverlay).not.toBeVisible();
    });
  });

  test.describe('Tour Navigation', () => {
    test('navigates through steps with next button', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800);

      // Wait for tour to appear
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 2000 });

      // Should show first step
      await expect(page.getByText('Bienvenue !')).toBeVisible();

      // Click next
      await page.getByLabel('Etape suivante').click();

      // Should show second step
      await expect(page.getByText('Mode Pratique')).toBeVisible();
    });

    test('navigates back with prev button', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 2000 });

      // Go to step 2
      await page.getByLabel('Etape suivante').click();
      await expect(page.getByText('Mode Pratique')).toBeVisible();

      // Go back to step 1
      await page.getByLabel('Etape precedente').click();
      await expect(page.getByText('Bienvenue !')).toBeVisible();
    });

    test('shows progress dots', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 2000 });

      // Should have progress dots (tablist)
      const tablist = page.locator('[role="tablist"]');
      await expect(tablist).toBeVisible();

      // Should have multiple tabs
      const tabs = tablist.locator('[role="tab"]');
      await expect(tabs).toHaveCount(7); // MAIN_TOUR_STEPS has 7 steps
    });
  });

  test.describe('Skip and Complete', () => {
    test('can skip tour', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 2000 });

      // Click close button
      await page.getByLabel('Fermer le guide').click();

      // Tour should be closed
      await expect(dialog).not.toBeVisible();
    });

    test('tour does not reappear after skip', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 2000 });

      await page.getByLabel('Fermer le guide').click();
      await expect(dialog).not.toBeVisible();

      // Reload page
      await page.reload();
      await page.waitForTimeout(800);

      // Tour should not appear again
      await expect(dialog).not.toBeVisible();
    });
  });

  test.describe('Help Button', () => {
    test('help button is visible', async ({ page }) => {
      await page.goto('/');

      // Skip the tour first
      await page.waitForTimeout(800);
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        await page.getByLabel('Fermer le guide').click();
      }

      // Help button should be visible
      const helpButton = page.getByLabel("Afficher le guide d'aide");
      await expect(helpButton).toBeVisible();
    });

    test('help button restarts tour', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 2000 });

      // Skip tour
      await page.getByLabel('Fermer le guide').click();
      await expect(dialog).not.toBeVisible();

      // Click help button
      const helpButton = page.getByLabel("Afficher le guide d'aide");
      await helpButton.click();

      // Tour should restart
      await page.waitForTimeout(200);
      await expect(dialog).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Keyboard Accessibility', () => {
    test('can navigate with keyboard', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 2000 });

      // Press ArrowRight to go next
      await page.keyboard.press('ArrowRight');
      await expect(page.getByText('Mode Pratique')).toBeVisible();

      // Press ArrowLeft to go back
      await page.keyboard.press('ArrowLeft');
      await expect(page.getByText('Bienvenue !')).toBeVisible();
    });

    test('escape key closes tour', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 2000 });

      // Press Escape
      await page.keyboard.press('Escape');

      // Tour should be closed
      await expect(dialog).not.toBeVisible();
    });
  });

  test.describe('Spotlight', () => {
    test('highlights target elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 2000 });

      // SVG mask should be present for spotlight effect
      const svgMask = page.locator('svg mask');
      await expect(svgMask).toBeVisible();
    });
  });

  test.describe('Page Integration', () => {
    test('tour targets exist on page', async ({ page }) => {
      await page.goto('/');

      // Check that all tour targets exist
      await expect(page.locator('[data-tour="logo"]')).toBeVisible();
      await expect(page.locator('[data-tour="practice-button"]')).toBeVisible();
      await expect(
        page.locator('[data-tour="challenge-button"]')
      ).toBeVisible();
      await expect(page.locator('[data-tour="profile-button"]')).toBeVisible();
      await expect(page.locator('[data-tour="settings-button"]')).toBeVisible();
      await expect(page.locator('[data-tour="help-button"]')).toBeVisible();
    });
  });
});
