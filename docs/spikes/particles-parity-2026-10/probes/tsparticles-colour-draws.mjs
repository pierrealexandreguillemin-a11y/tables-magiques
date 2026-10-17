import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const totals = {};
for (let run = 0; run < 6; run += 1) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(`http://127.0.0.1:8766/index.html?only=old&noapp&r=${run}`);
  await page.waitForTimeout(1500);
  const counts = await page.evaluate(() => {
    const sparkles = window.tsParticles.dom().find((c) => {
      const a = c.particles.array ?? c.particles._array ?? [];
      return (
        a.length > 0 &&
        a.every(
          (p) =>
            [51, 330, 0].includes(Math.round(p.getFillColor().h)) &&
            p.getRadius() < 3.5
        )
      );
    });
    const out = {};
    for (const p of sparkles.particles.array ?? sparkles.particles._array) {
      const c = p.getFillColor();
      const key = `h${Math.round(c.h)} s${Math.round(c.s)} l${Math.round(c.l)}`;
      out[key] = (out[key] ?? 0) + 1;
    }
    return out;
  });
  console.log('run', run, JSON.stringify(counts));
  for (const [k, v] of Object.entries(counts)) totals[k] = (totals[k] ?? 0) + v;
  await page.close();
}
console.log('total', JSON.stringify(totals));
await browser.close();
