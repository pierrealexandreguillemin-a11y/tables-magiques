/**
 * Types - Particles & Confetti
 * ISO/IEC 25010 - SRP: Particle system only
 */

export interface ParticleConfig {
  readonly count: number;
  readonly colors: readonly string[];
  readonly spread: number;
  readonly gravity: number;
  readonly duration: number;
}

export const CONFETTI_PRESETS = {
  small: {
    count: 20,
    colors: ['#ffb6d9', '#dda0dd', '#ffd700'],
    spread: 50,
    gravity: 0.8,
    duration: 800,
  },
  medium: {
    count: 40,
    colors: ['#ffb6d9', '#dda0dd', '#87ceeb', '#ffd700'],
    spread: 100,
    gravity: 0.6,
    duration: 1200,
  },
  large: {
    count: 80,
    colors: ['#ffb6d9', '#dda0dd', '#87ceeb', '#ffd700', '#b4e7ce'],
    spread: 150,
    gravity: 0.4,
    duration: 1500,
  },
} as const satisfies Record<string, ParticleConfig>;

export type ConfettiPresetKey = keyof typeof CONFETTI_PRESETS;
