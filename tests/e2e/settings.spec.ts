/**
 * Tests E2E Settings
 * ISO 29119 - Tests contre production Vercel
 */

import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/settings');
  });

  test.describe('Navigation', () => {
    test('navigates to /settings page', async ({ page }) => {
      await expect(page).toHaveURL('/settings');
      await expect(
        page.getByRole('heading', { name: 'Parametres' })
      ).toBeVisible();
    });
  });

  test.describe('Accessibility Section', () => {
    test('displays accessibility settings section', async ({ page }) => {
      await expect(page.getByTestId('settings-accessibility')).toBeVisible();
      await expect(page.getByText('Reduire les animations')).toBeVisible();
      await expect(page.getByText('Contraste eleve')).toBeVisible();
    });

    test('toggles reduced motion setting', async ({ page }) => {
      const toggle = page.getByTestId('toggle-reduced-motion');
      const switchElement = toggle.locator('[role="switch"]');

      await expect(switchElement).toHaveAttribute('aria-checked', 'false');
      await switchElement.click();
      await expect(switchElement).toHaveAttribute('aria-checked', 'true');

      // Verify persistence
      await page.reload();
      await expect(
        page.getByTestId('toggle-reduced-motion').locator('[role="switch"]')
      ).toHaveAttribute('aria-checked', 'true');
    });
  });

  test.describe('Audio Section', () => {
    test('displays audio settings section', async ({ page }) => {
      await expect(page.getByTestId('settings-audio')).toBeVisible();
      await expect(page.getByText("Sons d'interface")).toBeVisible();
      await expect(page.getByText('Musique de fond')).toBeVisible();
    });

    test('toggles sound and enables volume slider', async ({ page }) => {
      // Volume slider should be disabled initially
      const volumeSlider = page
        .getByTestId('slider-sound-volume')
        .locator('input');
      await expect(volumeSlider).toBeDisabled();

      // Enable sound
      const soundToggle = page
        .getByTestId('toggle-sound')
        .locator('[role="switch"]');
      await soundToggle.click();

      // Volume slider should now be enabled
      await expect(volumeSlider).toBeEnabled();
    });

    test('adjusts volume slider', async ({ page }) => {
      // Enable sound first
      const soundToggle = page
        .getByTestId('toggle-sound')
        .locator('[role="switch"]');
      await soundToggle.click();

      const volumeSlider = page
        .getByTestId('slider-sound-volume')
        .locator('input');
      await volumeSlider.fill('80');

      // Verify the display shows 80%
      await expect(page.getByTestId('slider-sound-volume')).toContainText(
        '80%'
      );
    });
  });

  test.describe('Display Section', () => {
    test('displays display settings section', async ({ page }) => {
      await expect(page.getByTestId('settings-display')).toBeVisible();
      await expect(page.getByText('Theme')).toBeVisible();
      await expect(page.getByText("Couleur d'accent")).toBeVisible();
    });

    test('changes theme setting', async ({ page }) => {
      const themeSelect = page.getByTestId('select-theme').locator('select');

      await themeSelect.selectOption('dark');
      await expect(themeSelect).toHaveValue('dark');

      // Verify persistence
      await page.reload();
      await expect(
        page.getByTestId('select-theme').locator('select')
      ).toHaveValue('dark');
    });

    test('changes accent color setting', async ({ page }) => {
      const accentSelect = page.getByTestId('select-accent').locator('select');

      await accentSelect.selectOption('purple');
      await expect(accentSelect).toHaveValue('purple');
    });
  });

  test.describe('Game Section', () => {
    test('displays game settings section', async ({ page }) => {
      await expect(page.getByTestId('settings-game')).toBeVisible();
      await expect(page.getByText('Difficulte')).toBeVisible();
      await expect(page.getByText('Temps par question')).toBeVisible();
    });

    test('changes difficulty setting', async ({ page }) => {
      const difficultySelect = page
        .getByTestId('select-difficulty')
        .locator('select');

      await difficultySelect.selectOption('hard');
      await expect(difficultySelect).toHaveValue('hard');
    });

    test('adjusts time per question slider', async ({ page }) => {
      const timeSlider = page.getByTestId('slider-time').locator('input');

      await timeSlider.fill('15');
      await expect(page.getByTestId('slider-time')).toContainText('15s');
    });

    test('toggles show hints setting', async ({ page }) => {
      const hintsToggle = page
        .getByTestId('toggle-hints')
        .locator('[role="switch"]');

      // Default is true
      await expect(hintsToggle).toHaveAttribute('aria-checked', 'true');

      await hintsToggle.click();
      await expect(hintsToggle).toHaveAttribute('aria-checked', 'false');
    });
  });

  test.describe('About Section', () => {
    test('displays app info', async ({ page }) => {
      await expect(page.getByTestId('settings-about')).toBeVisible();
      await expect(page.getByText('Tables Magiques')).toBeVisible();
      await expect(page.getByText('Version 1.0.0')).toBeVisible();
    });

    test('displays action buttons', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /exporter/i })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /importer/i })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /reinitialiser/i })
      ).toBeVisible();
    });
  });

  test.describe('Reset functionality', () => {
    test('shows confirmation on reset click', async ({ page }) => {
      const resetButton = page.getByRole('button', { name: /reinitialiser/i });

      await resetButton.click();
      await expect(
        page.getByRole('button', { name: /confirmer/i })
      ).toBeVisible();
    });

    test('resets settings on double-click', async ({ page }) => {
      // First, change a setting
      const themeSelect = page.getByTestId('select-theme').locator('select');
      await themeSelect.selectOption('dark');
      await expect(themeSelect).toHaveValue('dark');

      // Reset
      const resetButton = page.getByRole('button', { name: /reinitialiser/i });
      await resetButton.click();
      const confirmButton = page.getByRole('button', { name: /confirmer/i });
      await confirmButton.click();

      // Theme should be back to default (system)
      await expect(themeSelect).toHaveValue('system');
    });
  });

  test.describe('Accessibility', () => {
    test('all toggles are keyboard accessible', async ({ page }) => {
      // Tab to first toggle
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Use keyboard to toggle - verify an element is focused
      await expect(page.locator(':focus')).toBeVisible();
      await page.keyboard.press('Space');

      // Basic keyboard accessibility check passed
    });

    test('sliders are keyboard accessible', async ({ page }) => {
      // Enable sound first
      const soundToggle = page
        .getByTestId('toggle-sound')
        .locator('[role="switch"]');
      await soundToggle.click();

      const volumeSlider = page
        .getByTestId('slider-sound-volume')
        .locator('input');
      await volumeSlider.focus();

      // Use arrow keys to adjust
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');

      // Value should have increased
      const value = await volumeSlider.inputValue();
      expect(parseInt(value)).toBeGreaterThan(50);
    });

    test('page has proper heading structure', async ({ page }) => {
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toHaveText('Parametres');

      const h2s = page.getByRole('heading', { level: 2 });
      await expect(h2s.first()).toBeVisible();
    });
  });
});
