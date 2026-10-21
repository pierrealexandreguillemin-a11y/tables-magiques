/**
 * Worst WCAG contrast ratio between a text and the pixels actually rendered behind it.
 *
 * axe-core leaves text over gradients / backdrop-filter as "incomplete" (no pass, no violation),
 * so it cannot catch white-on-white there. This measures the real render instead: the text is
 * made transparent, the area of its words is captured (= the background as displayed), and every
 * pixel is compared with the text colour. Decoding happens in the page (canvas), no dependency.
 */

import type { Locator } from '@playwright/test';

export async function worstTextContrast(el: Locator): Promise<number> {
  const page = el.page();
  const { clip, color } = await el.evaluate((node) => {
    const text = [...node.childNodes].find(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()
    );
    if (!text?.textContent) throw new Error('no text node');
    // Words only: skip a leading emoji (its own colours are not the text colour)
    const start = text.textContent.search(/[A-Za-zÀ-ÿ]/);
    const range = document.createRange();
    range.setStart(text, start);
    range.setEnd(text, text.textContent.length);
    const r = range.getBoundingClientRect();
    const color = getComputedStyle(node).color;
    // transition: none, or the button's transition-all fades the colour out during the capture
    node.style.transition = 'none';
    node.style.color = 'transparent';
    return {
      clip: { x: r.x, y: r.y, width: r.width, height: r.height },
      color,
    };
  });
  const png = await page.screenshot({ clip });
  await el.evaluate((node) => {
    node.style.color = '';
    node.style.transition = '';
  });

  return page.evaluate(
    async ({ b64, color }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const ctx = document
        .createElement('canvas')
        .getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('no 2d context');
      ctx.canvas.width = img.width;
      ctx.canvas.height = img.height;
      ctx.fillStyle = color; // any CSS colour syntax (oklch...) -> sRGB pixel
      ctx.fillRect(0, 0, 1, 1);
      const [tr = 0, tg = 0, tb = 0] = ctx.getImageData(0, 0, 1, 1).data;
      ctx.drawImage(img, 0, 0);
      const px = ctx.getImageData(0, 0, img.width, img.height).data;

      const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const lum = (r: number, g: number, b: number) =>
        0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const text = lum(tr, tg, tb);
      let worst = Infinity;
      for (let i = 0; i < px.length; i += 4) {
        const bg = lum(px[i] ?? 0, px[i + 1] ?? 0, px[i + 2] ?? 0);
        const ratio = (Math.max(text, bg) + 0.05) / (Math.min(text, bg) + 0.05);
        worst = Math.min(worst, ratio);
      }
      return worst;
    },
    { b64: png.toString('base64'), color }
  );
}
