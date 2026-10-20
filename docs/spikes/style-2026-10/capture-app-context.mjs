// Captures the production home page (light and dark, phone viewport, tour dismissed) and the
// box of the current kawaii mascot, so the board can show A2/A3 in the real slot (protocol R2).
// Usage: node docs/spikes/style-2026-10/capture-app-context.mjs [baseUrl]
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2] ?? 'https://tables-magiques.vercel.app';
const out = join(import.meta.dirname, 'context');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const slots = {};
for (const theme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 2 });
  await page.addInitScript((t) => {
    localStorage.setItem('theme', t);
    localStorage.setItem('tables-magiques-first-visit', 'true');
    localStorage.setItem('tables-magiques-tour-completed', 'true');
  }, theme);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  // hero = the 🦄 emoji (UnicornHero, data-tour="logo"); kawaii = react-kawaii svg at size 100.
  slots[theme] = await page.evaluate(() => {
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y + window.scrollY, w: r.width, h: r.height };
    };
    return {
      hero: box(document.querySelector('[data-tour="logo"]')),
      kawaii: box([...document.querySelectorAll('svg')].find((s) => s.getAttribute('width') === '100')),
    };
  });
  // Empty both slots so the board can place a candidate on the real background.
  await page.addStyleTag({
    content: '[data-tour="logo"]{visibility:hidden!important} svg[width="100"]{visibility:hidden!important}',
  });
  await page.screenshot({ path: join(out, `home-${theme}.png`), fullPage: true });
  await page.close();
}
await browser.close();
writeFileSync(join(out, 'slots.json'), JSON.stringify({ base, viewport: [412, 823], slots }, null, 2));
console.log(JSON.stringify(slots));
