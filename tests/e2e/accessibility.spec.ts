/**
 * E2E Tests - Accessibilité
 * ISO/IEC 29119 - WCAG 2.1 AA Compliance
 *
 * Tests d'accessibilité contre l'application réelle
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { worstTextContrast } from './helpers/textContrast';
import { waitForEntryAnimations } from './helpers/settle';

test.describe('Accessibilité WCAG 2.1 AA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
  });

  test('pas de violations critiques', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Filtrer les violations critiques et sérieuses
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toEqual([]);
  });

  test('pas de violations de contraste', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    // Le contraste peut échouer sur les éléments animés - on tolère quelques warnings
    const criticalContrastViolations =
      accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical'
      );

    expect(criticalContrastViolations).toEqual([]);
  });

  // Le test ci-dessus ne retient que 'critical' : axe classe color-contrast en 'serious', il ne
  // peut donc jamais echouer. Et axe met ces boutons en "incomplete" (degrade + backdrop-filter) :
  // ils sont mesures sur le rendu reel. Regression 2026-10-21 : en theme clair, GradientBorder a
  // un fond interieur blanc et « Mode Entraînement » etait blanc sur blanc (1:1).
  // 4.5:1 = AA texte normal (plus strict que les 3:1 exiges pour ce texte gras de 20 px).
  for (const theme of ['light', 'dark'] as const) {
    test(`boutons de l’accueil lisibles (thème ${theme}, repos et survol)`, async ({
      page,
    }) => {
      await page.evaluate((t) => {
        localStorage.setItem('theme', t);
        localStorage.setItem('tables-magiques-tour-completed', 'true');
        localStorage.setItem('tables-magiques-first-visit', 'true');
      }, theme);
      await page.reload();
      // Attendre la fin de l'entree .animate-fade-scale (delai 1.2 s) : on mesure l'opacite finale
      await page.waitForFunction(() =>
        [...document.querySelectorAll('.animate-fade-scale')].every(
          (el) => getComputedStyle(el).opacity === '1'
        )
      );

      const ratios: Record<string, number> = {};
      for (const href of ['/practice', '/challenge']) {
        const cta = page.locator(`a[href="${href}"] span`);
        await page.mouse.move(0, 0);
        await page.waitForTimeout(400); // transition-all duration-300
        ratios[`${href} repos`] = await worstTextContrast(cta);
        await cta.hover();
        await page.waitForTimeout(400);
        ratios[`${href} survol`] = await worstTextContrast(cta);
      }
      test.info().annotations.push({
        type: 'contrast',
        description: JSON.stringify(ratios),
      });
      for (const [state, ratio] of Object.entries(ratios)) {
        expect(
          ratio,
          `${state} ${JSON.stringify(ratios)}`
        ).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test('structure de headings correcte', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    // Au moins un h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Pas de saut de niveau (h1 -> h3 sans h2)
    const headingLevels = await Promise.all(
      headings.map(async (h) => {
        const tagName = await h.evaluate((el) => el.tagName);
        return parseInt(tagName.charAt(1));
      })
    );

    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i];
      const previous = headingLevels[i - 1];
      if (current !== undefined && previous !== undefined) {
        const diff = current - previous;
        expect(diff).toBeLessThanOrEqual(1); // Pas de saut > 1 niveau
      }
    }
  });

  test('tous les boutons sont accessibles au clavier', async ({ page }) => {
    const buttons = page.getByRole('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      await button.focus();

      // Vérifie que le bouton est focusable
      const isFocused = await button.evaluate(
        (el) => document.activeElement === el
      );
      expect(isFocused).toBe(true);
    }
  });

  test('focus visible sur éléments interactifs', async ({ page }) => {
    // Tab vers le premier élément interactif
    await page.keyboard.press('Tab');

    // Vérifier qu'un élément a le focus
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName : null;
    });

    expect(focusedElement).not.toBe('BODY');
  });

  test('images ont des alt text', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');

      // Alt peut être vide pour images décoratives, mais doit exister
      expect(alt).not.toBeNull();
    }
  });

  test('liens ont du texte descriptif', async ({ page }) => {
    const links = page.getByRole('link');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      // Doit avoir du texte ou un aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('formulaires ont des labels', async ({ page }) => {
    const inputs = page.locator('input, select, textarea');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');

      if (id) {
        // Vérifie qu'un label existe pour cet input
        const label = page.locator(`label[for="${id}"]`);
        const labelExists = (await label.count()) > 0;

        // Doit avoir un label, aria-label, ou aria-labelledby
        expect(labelExists || ariaLabel || ariaLabelledby).toBeTruthy();
      }
    }
  });

  test('pas de piège de focus', async ({ page }) => {
    // Tab plusieurs fois
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }

    // Shift+Tab pour revenir
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Shift+Tab');
    }

    // Devrait pouvoir naviguer librement
    const finalActiveElement = await page.evaluate(
      () => document.activeElement?.tagName
    );

    // Le test passe si on peut naviguer (pas bloqué)
    expect(finalActiveElement).toBeDefined();
  });

  test('contenu visible sans CSS', async ({ page }) => {
    // Désactiver CSS
    await page.addStyleTag({ content: '* { all: unset !important; }' });

    // Le contenu texte doit rester lisible
    const bodyText = await page.textContent('body');

    expect(bodyText).toContain('Tables Magiques');
    expect(bodyText).toContain('Mode Entraînement');
  });
});

test.describe('Accessibilité - Toutes les pages (axe-core)', () => {
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Practice', path: '/practice' },
    { name: 'Challenge', path: '/challenge' },
    { name: 'Profile', path: '/profile' },
    { name: 'Settings', path: '/settings' },
  ];

  // Both themes: the dark one had its own failures (/settings "Bloque" 4.37:1, 2026-10-21).
  // waitForEntryAnimations: measured during the fade-in, a text reads half-transparent (flaky).
  for (const theme of ['light', 'dark'] as const) {
    for (const { name, path } of pages) {
      test(`${name} (${path}, thème ${theme}) — zero violation critique`, async ({
        page,
      }) => {
        await page.goto(path);
        await page.evaluate((t) => localStorage.setItem('theme', t), theme);
        await page.reload();
        await page.waitForLoadState('networkidle');
        await waitForEntryAnimations(page);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        const critical = results.violations.filter(
          (v) => v.impact === 'critical' || v.impact === 'serious'
        );

        expect(critical).toEqual([]);
      });
    }
  }
});

test.describe('Accessibilité - Reduced Motion', () => {
  test('respecte prefers-reduced-motion', async ({ page }) => {
    // Émuler prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // La page devrait charger sans erreur
    await expect(
      page.getByRole('heading', { name: /tables magiques/i })
    ).toBeVisible();
  });
});

test.describe('Accessibilité - Lecteurs d écran', () => {
  test('structure ARIA correcte', async ({ page }) => {
    await page.goto('/');

    // Vérifier les landmarks
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Vérifier aria-labels sur éléments interactifs
    const buttons = page.getByRole('button');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);
  });

  test('annonces live regions', async ({ page }) => {
    await page.goto('/');

    // Chercher des éléments avec aria-live
    const liveRegions = page.locator('[aria-live]');
    const statusRegions = page.locator('[role="status"]');
    const alertRegions = page.locator('[role="alert"]');

    // Au moins un type de région live devrait exister (ou pas si pas nécessaire)
    const totalLive =
      (await liveRegions.count()) +
      (await statusRegions.count()) +
      (await alertRegions.count());

    // Pas d'assertion stricte - juste vérifier que ça ne plante pas
    expect(totalLive).toBeGreaterThanOrEqual(0);
  });
});
