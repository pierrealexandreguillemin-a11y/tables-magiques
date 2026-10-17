import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const results = [];
for (const round of [1, 2]) {
  for (const side of ['old', 'new']) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Performance.enable');
    await page.goto(
      `http://127.0.0.1:8766/index.html?only=${side}&noapp&r=${round}`
    );
    await page.waitForTimeout(1500);
    const metric = async () =>
      Object.fromEntries(
        (await cdp.send('Performance.getMetrics')).metrics.map((m) => [
          m.name,
          m.value,
        ])
      );
    const a = await metric();
    const frames = await page.evaluate(async () => {
      const d = [];
      let last = performance.now();
      await new Promise((res) => {
        const end = last + 5000;
        const f = (t) => {
          d.push(t - last);
          last = t;
          if (t < end) requestAnimationFrame(f);
          else res();
        };
        requestAnimationFrame(f);
      });
      d.sort((x, y) => x - y);
      return {
        n: d.length,
        p50: +d[d.length >> 1].toFixed(1),
        p95: +d[Math.floor(d.length * 0.95)].toFixed(1),
        over33: d.filter((x) => x > 33.4).length,
      };
    });
    const b = await metric();
    results.push({
      round,
      side,
      cpuMsPerSec: Math.round(((b.TaskDuration - a.TaskDuration) * 1000) / 5),
      scriptMsPerSec: Math.round(
        ((b.ScriptDuration - a.ScriptDuration) * 1000) / 5
      ),
      ...frames,
    });
    await page.close();
  }
}
await browser.close();
console.table(results);
