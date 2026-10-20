// Parity harness, NEW side: the P22 canvas engine, same calls as the components.
import { startStarField } from '@/lib/animations/canvas/starField';
import {
  BASE_COUNT,
  STAR_FIELD_PRESETS,
  scaledCount,
  type StarFieldPresetName,
} from '@/lib/animations/canvas/starFieldPresets';
import { scatterConfetti } from '@/lib/animations/canvas/confettiScatter';

function canvasIn(el: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  el.appendChild(canvas);
  return canvas;
}

function stars(el: HTMLElement, preset: StarFieldPresetName) {
  const canvas = canvasIn(el);
  return startStarField(canvas, STAR_FIELD_PRESETS[preset], {
    count: scaledCount(
      preset,
      BASE_COUNT[preset],
      canvas.clientWidth,
      canvas.clientHeight
    ),
    reducedMotion: false,
  });
}

(window as unknown as Record<string, unknown>).ParityNew = {
  fairy: (el: HTMLElement) => stars(el, 'fairy'),
  sparkles: (el: HTMLElement) => stars(el, 'sparkles'),
  confetti: (el: HTMLElement) =>
    scatterConfetti(canvasIn(el), { reducedMotion: false }),
};
