import { chromium } from '@playwright/test';

const PALETTE = {
  gold: [255, 215, 0],
  white: [255, 255, 255],
  pink: [255, 105, 180],
};

const browser = await chromium.launch();
for (const side of ['old', 'new']) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(`http://127.0.0.1:8766/index.html?only=${side}&noapp`);
  await page.waitForTimeout(1500);
  const result = await page.evaluate((palette) => {
    const canvas = document.querySelector('.pair[data-row=sparkles] canvas');
    const { data } = canvas
      .getContext('2d')
      .getImageData(0, 0, canvas.width, canvas.height);
    const counts = { gold: 0, white: 0, pink: 0 };
    const alphaHist = { gold: 0, white: 0, pink: 0 };
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 40) continue;
      let best = null;
      let bestD = Infinity;
      for (const [name, [r, g, b]] of Object.entries(palette)) {
        const d =
          (data[i] - r) ** 2 + (data[i + 1] - g) ** 2 + (data[i + 2] - b) ** 2;
        if (d < bestD) {
          bestD = d;
          best = name;
        }
      }
      counts[best] += 1;
      alphaHist[best] += a;
    }
    for (const k of Object.keys(counts))
      alphaHist[k] = counts[k] ? Math.round(alphaHist[k] / counts[k]) : 0;
    return {
      counts,
      meanAlpha: alphaHist,
      size: `${canvas.width}x${canvas.height}`,
    };
  }, PALETTE);
  console.log(side, JSON.stringify(result));
  await page.close();
}
await browser.close();
