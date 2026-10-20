/**
 * Star field presets, converted from the former tsParticles configs (2026-10-17):
 * per-frame values at 60 fps became per-second values. Parity target = what tsParticles
 * actually rendered: @tsparticles/slim ships no twinkle updater, so the configured
 * `twinkle` never showed and stays off here. Parity is judged side by side.
 */

import {
  FAIRY_STAR_COLORS,
  FAIRY_STAR_GLOW,
  SPARKLE_COLORS,
} from '@/lib/animations/colors';
import type { StarFieldPreset } from './starField';

export type StarFieldPresetName = 'fairy' | 'sparkles';

export const STAR_FIELD_PRESETS: Record<StarFieldPresetName, StarFieldPreset> =
  {
    // FairyBackground: 5-point stars with a gold glow.
    fairy: {
      colors: FAIRY_STAR_COLORS,
      sizeRange: [3, 8],
      opacityRange: [0.5, 1],
      opacitySpeed: 1.2,
      speed: 30, // 0.5 px/frame at 60 fps
      twinklePerSecond: 0,
      twinkleSeconds: 1,
      glow: { color: FAIRY_STAR_GLOW, blur: 10 },
      points: 5,
    },
    // Challenge page: small pulsing sparkles, no glow.
    sparkles: {
      colors: SPARKLE_COLORS,
      sizeRange: [1, 3],
      opacityRange: [0, 1],
      opacitySpeed: 1.2,
      speed: 18, // 0.3 px/frame at 60 fps
      twinklePerSecond: 0,
      twinkleSeconds: 1,
      glow: null,
      points: 5,
    },
  };

/** Star counts the old configs used at their reference area. */
export const BASE_COUNT: Record<StarFieldPresetName, number> = {
  fairy: 40, // FairyBackground: starCount (20) x 2
  sparkles: 30,
};

/**
 * tsParticles density: count = value x canvas CSS area / (density width x height)
 * (@tsparticles/engine Particles._initDensityFactor). Reference areas from the old configs.
 */
const DENSITY_AREA: Record<StarFieldPresetName, number> = {
  fairy: 1920 * 1080, // engine default
  sparkles: 600 * 600,
};

export function scaledCount(
  preset: StarFieldPresetName,
  baseCount: number,
  width: number,
  height: number
): number {
  return Math.max(
    1,
    Math.round((baseCount * width * height) / DENSITY_AREA[preset])
  );
}
