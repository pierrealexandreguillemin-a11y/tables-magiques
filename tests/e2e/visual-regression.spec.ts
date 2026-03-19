/**
 * Visual Regression Tests
 * Industry standard: screenshot comparison to catch unintended visual changes.
 *
 * Uses Playwright's built-in toHaveScreenshot() with pixel threshold.
 * Baseline screenshots are committed to source control.
 *
 * Run: npx playwright test visual-regression
 * Update baselines: npx playwright test visual-regression --update-snapshots
 */

import { test, expect } from '@playwright/test';

// Disable animations for deterministic screenshots
test.use({
  // Wait for fonts and images to load
  launchOptions: {
    args: ['--font-render-hinting=none'],
  },
});

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'practice', path: '/practice' },
  { name: 'challenge', path: '/challenge' },
  { name: 'profile', path: '/profile' },
  { name: 'settings', path: '/settings' },
] as const;

test.describe('Visual Regression - Key Pages', () => {
  for (const { name, path } of PAGES) {
    test(`${name} page matches baseline`, async ({ page }) => {
      await page.goto(path);

      // Wait for page to stabilize (fonts, animations settle)
      await page.waitForLoadState('networkidle');

      // Disable CSS animations/transitions for deterministic screenshots
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `,
      });

      // Small wait for style injection to take effect
      await page.waitForTimeout(100);

      await expect(page).toHaveScreenshot(`${name}.png`, {
        maxDiffPixelRatio: 0.01,
        fullPage: true,
      });
    });
  }
});

test.describe('Visual Regression - Reduced Motion', () => {
  test('home page respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('home-reduced-motion.png', {
      maxDiffPixelRatio: 0.01,
      fullPage: true,
    });
  });
});

test.describe('Visual Regression - Mobile', () => {
  test.use({
    viewport: { width: 375, height: 812 },
  });

  test('home page mobile layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });

    await page.waitForTimeout(100);

    await expect(page).toHaveScreenshot('home-mobile.png', {
      maxDiffPixelRatio: 0.01,
      fullPage: true,
    });
  });
});
